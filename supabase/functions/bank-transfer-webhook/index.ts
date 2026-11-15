import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type, x-paystack-signature",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const paystackSecretKey = Deno.env.get("PAYSTACK_SECRET_KEY")!;

const admin = createClient(supabaseUrl, serviceRoleKey);

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

async function verifySignature(
  rawBody: string,
  signature: string,
): Promise<boolean> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(paystackSecretKey),
    { name: "HMAC", hash: "SHA-512" },
    false,
    ["sign"],
  );

  const digest = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(rawBody),
  );

  const expected = Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");

  return safeEqual(expected, signature);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ success: false, message: "Method not allowed" }, 405);
  }

  if (!supabaseUrl || !serviceRoleKey || !paystackSecretKey) {
    return jsonResponse({ success: false, message: "Server configuration error" }, 500);
  }

  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-paystack-signature");

    if (!signature) {
      return jsonResponse({ success: false, message: "Missing signature" }, 401);
    }

    const validSignature = await verifySignature(rawBody, signature);

    if (!validSignature) {
      return jsonResponse({ success: false, message: "Invalid signature" }, 401);
    }

    const event = JSON.parse(rawBody);
    const eventType = event?.event;
    const data = event?.data;

    if (!["transfer.success", "transfer.failed", "transfer.reversed"].includes(eventType)) {
      return jsonResponse({ success: true, ignored: true });
    }

    const reference = data?.reference;

    if (typeof reference !== "string" || !reference.trim()) {
      return jsonResponse({ success: false, message: "Missing transfer reference" }, 400);
    }

    const { data: transfer, error: lookupError } = await admin
      .from("bank_transfers")
      .select(`
        id,
        reference,
        amount,
        status,
        wallet_debited_at,
        refunded_at,
        paystack_transfer_code
      `)
      .eq("reference", reference)
      .maybeSingle();

    if (lookupError) {
      console.error("Transfer lookup failed:", lookupError);
      return jsonResponse({ success: false, message: "Could not verify transfer" }, 500);
    }

    if (!transfer) {
      console.warn("Webhook reference not found:", reference);
      return jsonResponse({ success: true, ignored: true, reason: "Unknown reference" });
    }

    // Verify the amount and currency against the stored transfer.
    const eventAmount = Number(data?.amount);
    const expectedAmount = Math.round(Number(transfer.amount) * 100);
    const currency = data?.currency;

    if (
      !Number.isFinite(eventAmount) ||
      eventAmount !== expectedAmount ||
      currency !== "NGN"
    ) {
      console.error("Webhook amount/currency mismatch:", {
        reference,
        eventAmount,
        expectedAmount,
        currency,
      });

      return jsonResponse({
        success: false,
        message: "Transfer amount or currency mismatch",
      }, 400);
    }

    const eventTransferCode = data?.transfer_code;

    if (
      transfer.paystack_transfer_code &&
      eventTransferCode &&
      transfer.paystack_transfer_code !== eventTransferCode
    ) {
      console.error("Transfer code mismatch:", reference);
      return jsonResponse({ success: false, message: "Transfer identity mismatch" }, 400);
    }

    // SUCCESS
    if (eventType === "transfer.success") {
      if (transfer.refunded_at || transfer.status === "failed") {
        console.error("Success event received for failed/refunded transfer:", reference);
        return jsonResponse({
          success: true,
          ignored: true,
          reason: "Transfer already failed or refunded",
        });
      }

      if (transfer.status === "successful") {
        return jsonResponse({ success: true, duplicate: true });
      }

      if (!transfer.wallet_debited_at || transfer.status !== "processing") {
        console.error("Success event received for an ineligible transfer:", reference);
        return jsonResponse({
          success: false,
          message: "Transfer is not in a valid processing state",
        }, 409);
      }

      const { data: updated, error: updateError } = await admin
        .from("bank_transfers")
        .update({
          status: "successful",
          paystack_transfer_code: eventTransferCode ?? transfer.paystack_transfer_code,
          updated_at: new Date().toISOString(),
        })
        .eq("reference", reference)
        .eq("status", "processing")
        .is("refunded_at", null)
        .not("wallet_debited_at", "is", null)
        .select("reference")
        .maybeSingle();

      if (updateError) {
        console.error("Success update failed:", updateError);
        return jsonResponse({ success: false, message: "Could not update transfer" }, 500);
      }

      if (!updated) {
        return jsonResponse({
          success: true,
          ignored: true,
          reason: "Transfer state changed before update",
        });
      }

      return jsonResponse({ success: true, status: "successful" });
    }

    const failureReason =
      typeof data?.reason === "string" && data.reason.trim()
        ? data.reason.trim().slice(0, 500)
        : eventType === "transfer.reversed"
        ? "Transfer reversed by Paystack"
        : "Transfer failed";

    // FAILURE: atomic status change + wallet refund.
    if (eventType === "transfer.failed") {
      const { data: result, error } = await admin.rpc(
        "process_bank_transfer_failure",
        {
          p_reference: reference,
          p_failure_reason: failureReason,
        },
      );

      if (error) {
        console.error("Failure processing RPC error:", error);
        return jsonResponse({ success: false, message: "Could not process failed transfer" }, 500);
      }

      if (!result?.success) {
        console.error("Failure processing rejected:", result);
        return jsonResponse({ success: false, message: result?.message ?? "Transfer failure processing rejected" }, 500);
      }

      return jsonResponse({ success: true, result });
    }

    // REVERSAL: separate atomic RPC for a previously successful payout.
    if (eventType === "transfer.reversed") {
      const { data: result, error } = await admin.rpc(
        "process_bank_transfer_reversal",
        {
          p_reference: reference,
          p_failure_reason: failureReason,
        },
      );

      if (error) {
        console.error("Reversal processing RPC error:", error);
        return jsonResponse({ success: false, message: "Could not process transfer reversal" }, 500);
      }

      if (!result?.success) {
        console.error("Reversal processing rejected:", result);
        return jsonResponse({ success: false, message: result?.message ?? "Transfer reversal processing rejected" }, 500);
      }

      return jsonResponse({ success: true, result });
    }

    return jsonResponse({ success: true, ignored: true });
  } catch (error) {
    console.error("Bank transfer webhook error:", error);
    return jsonResponse({ success: false, message: "Webhook processing failed" }, 500);
  }
});
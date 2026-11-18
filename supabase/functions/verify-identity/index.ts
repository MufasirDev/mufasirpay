
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const allowedOrigins = new Set([
  "http://localhost:5173",
  "https://mufasirpay.vercel.app",
]);

const NINJA_ENDPOINT =
  "https://api.ninja.boucloud.io/api/identity/identify";

function getCorsHeaders(origin: string | null): Record<string, string> {
  const headers: Record<string, string> = {
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type, x-supabase-api-version",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };

  if (origin && allowedOrigins.has(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
  }

  return headers;
}

function isValidDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

  const date = new Date(`${value}T00:00:00Z`);

  return (
    Number.isFinite(date.getTime()) &&
    date.toISOString().slice(0, 10) === value &&
    value < new Date().toISOString().slice(0, 10)
  );
}

Deno.serve(async (req: Request) => {
  const origin = req.headers.get("Origin");
  const corsHeaders = getCorsHeaders(origin);

  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
      },
    });

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return json({ error: "Method not allowed." }, 405);
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    // Sandbox-only credential. Never fall back to the live Ninja key.
    const ninjaSecret = Deno.env.get("NINJA_API_SECRET_KEY");

    if (!supabaseUrl || !anonKey || !serviceKey || !ninjaSecret) {
      console.error("Sandbox identity verification configuration is incomplete.");

      return json({
        error: "Sandbox verification is not configured.",
      }, 500);
    }

    // Authenticate customer.
    const authorization = req.headers.get("Authorization");

    if (!authorization?.startsWith("Bearer ")) {
      return json({ error: "Please sign in first." }, 401);
    }

    const token = authorization.slice("Bearer ".length).trim();

    if (!token) {
      return json({ error: "Please sign in first." }, 401);
    }

    const authClient = createClient(supabaseUrl, anonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    const { data: authData, error: authError } =
      await authClient.auth.getUser(token);

    if (authError || !authData.user) {
      return json({
        error: "Your session is invalid or expired. Please log in again.",
      }, 401);
    }

    const userId = authData.user.id;

    // Parse request.
    let body: Record<string, unknown>;

    try {
      const parsed: unknown = await req.json();

      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
        throw new Error("Invalid request");
      }

      body = parsed as Record<string, unknown>;
    } catch {
      return json({ error: "Request body must be valid JSON." }, 400);
    }

    if (body.consent !== true) {
      return json({
        error: "Please provide consent before identity verification.",
      }, 400);
    }

    const { idType, idNumber, firstName, lastName } = body;
    const rawDateOfBirth = body.dateOfBirth;

    if (
      (idType !== "nin" && idType !== "bvn") ||
      typeof idNumber !== "string" ||
      !/^\d{11}$/.test(idNumber) ||
      typeof firstName !== "string" ||
      firstName.trim().length < 1 ||
      firstName.trim().length > 100 ||
      typeof lastName !== "string" ||
      lastName.trim().length < 1 ||
      lastName.trim().length > 100
    ) {
      return json({
        error: "Enter a valid 11-digit NIN or BVN, first name, and last name.",
      }, 400);
    }

    let dateOfBirth: string | undefined;

    if (
      rawDateOfBirth !== undefined &&
      rawDateOfBirth !== null &&
      rawDateOfBirth !== ""
    ) {
      if (
        typeof rawDateOfBirth !== "string" ||
        !isValidDate(rawDateOfBirth)
      ) {
        return json({ error: "Please enter a valid date of birth." }, 400);
      }

      dateOfBirth = rawDateOfBirth;
    }

    // Admin database client.
    const adminClient = createClient(supabaseUrl, serviceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    // Check existing KYC status.
    const { data: existingKyc, error: kycReadError } = await adminClient
      .from("kyc_verifications")
      .select("status")
      .eq("user_id", userId)
      .maybeSingle();

    if (kycReadError) {
      console.error("Could not read KYC status.");

      return json({
        error: "Unable to check your verification status.",
      }, 500);
    }

    if (existingKyc?.status === "verified") {
      return json({
        status: "verified",
        message: "Your identity is already verified.",
      });
    }

    // Block another paid lookup if an unresolved attempt exists.
    const { data: unresolvedAttempts, error: unresolvedError } =
      await adminClient
        .from("kyc_verification_attempts")
        .select("id, status, provider_reference")
        .eq("user_id", userId)
        .in("status", ["pending", "inconclusive"])
        .limit(1);

    if (unresolvedError) {
      console.error("Could not check unresolved KYC attempts.");

      return json({
        error:
          "Unable to check previous verification attempts. Contact support.",
      }, 500);
    }

    if (unresolvedAttempts && unresolvedAttempts.length > 0) {
      const unresolved = unresolvedAttempts[0];

      return json({
        status: unresolved.status,
        message:
          "A previous verification attempt has not been resolved. Please contact support before trying again.",
      }, 409);
    }

    // Also protect unresolved records from the older flow.
    if (
      existingKyc?.status === "pending" ||
      existingKyc?.status === "inconclusive"
    ) {
      return json({
        status: existingKyc.status,
        message:
          "Your previous verification is unresolved. Please contact support.",
      }, 409);
    }

    const reference = `kyc-${crypto.randomUUID()}`;

    // Create attempt BEFORE contacting Ninja.
    const { data: attempt, error: attemptInsertError } = await adminClient
      .from("kyc_verification_attempts")
      .insert({
        user_id: userId,
        provider: "ninja",
        provider_reference: reference,
        id_type: idType,
        status: "pending",
      })
      .select("id")
      .single();

    if (attemptInsertError || !attempt) {
      if (attemptInsertError?.code === "23505") {
        return json({
          status: "pending",
          message:
            "A verification request is already being processed. Please contact support if it remains unresolved.",
        }, 409);
      }

      console.error("Could not create KYC attempt record.");

      return json({
        error: "Unable to start verification. Please contact support.",
      }, 500);
    }

    const attemptId = attempt.id;
    const submittedAt = new Date().toISOString();

    // Record pending status before the paid request.
    const { error: pendingWriteError } = await adminClient
      .from("kyc_verifications")
      .upsert(
        {
          user_id: userId,
          status: "pending",
          provider: "ninja",
          provider_reference: reference,
          submitted_at: submittedAt,
          reviewed_at: null,
          updated_at: submittedAt,
          rejection_reason: null,
        },
        { onConflict: "user_id" },
      );

    if (pendingWriteError) {
      console.error("Could not save pending KYC status.");

      return json({
        status: "pending",
        message:
          "Your request could not be fully recorded. Please contact support before trying again.",
      }, 500);
    }

    // Save inconclusive outcome.
    async function saveInconclusive(
      category: string,
      httpStatus: number | null = null,
    ): Promise<boolean> {
      const now = new Date().toISOString();

      const { error: kycError } = await adminClient
        .from("kyc_verifications")
        .update({
          status: "inconclusive",
          provider: "ninja",
          provider_reference: reference,
          updated_at: now,
        })
        .eq("user_id", userId);

      if (kycError) {
        console.error("Could not save inconclusive KYC status.");
        return false;
      }

      const { error: attemptError } = await adminClient
        .from("kyc_verification_attempts")
        .update({
          status: "inconclusive",
          provider_http_status: httpStatus,
          error_category: category,
          updated_at: now,
          completed_at: now,
        })
        .eq("id", attemptId)
        .eq("status", "pending");

      if (attemptError) {
        console.error("Could not save inconclusive attempt status.");
        return false;
      }

      return true;
    }

    // Save manual review outcome.
    async function savePendingReview(
      httpStatus: number,
    ): Promise<boolean> {
      const now = new Date().toISOString();

      const { error: kycError } = await adminClient
        .from("kyc_verifications")
        .update({
          status: "pending",
          provider: "ninja",
          provider_reference: reference,
          updated_at: now,
        })
        .eq("user_id", userId);

      if (kycError) {
        console.error("Could not save pending review KYC status.");
        return false;
      }

      const { error: attemptError } = await adminClient
        .from("kyc_verification_attempts")
        .update({
          status: "pending",
          provider_http_status: httpStatus,
          error_category: "provider_review_required",
          updated_at: now,
          completed_at: null,
        })
        .eq("id", attemptId)
        .eq("status", "pending");

      if (attemptError) {
        console.error("Could not save pending review attempt.");
        return false;
      }

      return true;
    }

    // Call Ninja sandbox once.
    let ninjaResponse: Response;

    try {
      ninjaResponse = await fetch(NINJA_ENDPOINT, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${ninjaSecret}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          idType,
          mode: "verify",
          idNumber,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          ...(dateOfBirth ? { dateOfBirth } : {}),
          reference,
        }),
        signal: AbortSignal.timeout(20000),
      });
    } catch {
      console.error("Ninja sandbox request failed or timed out.");

      const saved = await saveInconclusive(
        "provider_timeout_or_network_error",
      );

      return json({
        status: "inconclusive",
        message: saved
          ? "The provider could not confirm the result. Please contact support before submitting another request."
          : "The request outcome could not be saved safely. Please contact support.",
      }, 502);
    }

    let result: Record<string, unknown>;

    try {
      const parsed: unknown = await ninjaResponse.json();

      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
        throw new Error("Unexpected provider response");
      }

      result = parsed as Record<string, unknown>;
    } catch {
      console.error("Ninja returned an unreadable response.");

      const saved = await saveInconclusive(
        "invalid_provider_response",
        ninjaResponse.status,
      );

      return json({
        status: "inconclusive",
        message: saved
          ? "The provider returned an unexpected response. Please contact support."
          : "The provider response could not be recorded safely. Please contact support.",
      }, 502);
    }

    if (!ninjaResponse.ok) {
      console.error("Ninja returned an unsuccessful HTTP response:", {
        status: ninjaResponse.status,
        errorType: result.type ?? null,
        errorCode: result.code ?? null,
      });

      const saved = await saveInconclusive(
        "provider_http_error",
        ninjaResponse.status,
      );

      return json({
        status: "inconclusive",
        message: saved
          ? "The provider could not complete verification. Please contact support before trying again."
          : "The provider result could not be recorded safely. Please contact support.",
      }, 502);
    }

    // Ninja's recommendation is the authoritative decision.
    const found = result.found;
    const recommendation = result.recommendation;
    const score =
      typeof result.score === "number" && Number.isFinite(result.score)
        ? result.score
        : null;

    // No matching identity record.
    if (found === false) {
      console.log("Ninja reported that the identity record was not found.");

      const saved = await saveInconclusive(
        "provider_identity_not_found",
        ninjaResponse.status,
      );

      return json({
        status: "not_found",
        recommendation:
          typeof recommendation === "string" ? recommendation : null,
        message: saved
          ? "The provider could not find a matching identity record. Check your details or contact support."
          : "The identity result could not be recorded safely. Please contact support.",
      });
    }

    // Manual review.
    if (recommendation === "review") {
      console.log("Ninja requires manual review.");

      const saved = await savePendingReview(ninjaResponse.status);

      return json({
        status: "pending",
        recommendation: "review",
        score,
        message: saved
          ? "Your identity details require additional review. Please wait for support to review your verification."
          : "Your verification requires review, but its status could not be saved safely. Please contact support.",
      });
    }

    // Accept or reject using Ninja's documented recommendation.
    const accepted = recommendation === "accept";
    const explicitlyRejected = recommendation === "reject";

    // Unknown or missing recommendation.
    if (!accepted && !explicitlyRejected) {
      console.log("Ninja returned an unknown or uncertain decision.");

      const saved = await saveInconclusive(
        "provider_unknown_or_uncertain_result",
        ninjaResponse.status,
      );

      return json({
        status: "inconclusive",
        recommendation:
          typeof recommendation === "string" ? recommendation : null,
        message: saved
          ? "The provider could not make a conclusive decision. Please contact support."
          : "The verification result could not be recorded safely. Please contact support.",
      });
    }

    const now = new Date().toISOString();
    const finalStatus = accepted ? "verified" : "rejected";

    // Save final KYC result.
    const { error: finalKycError } = await adminClient
      .from("kyc_verifications")
      .update({
        status: finalStatus,
        provider: "ninja",
        provider_reference: reference,
        reviewed_at: now,
        updated_at: now,
        rejection_reason: accepted
          ? null
          : "The identity provider explicitly rejected the verification.",
      })
      .eq("user_id", userId);

    if (finalKycError) {
      console.error("Could not save final KYC status.");

      return json({
        status: "pending",
        message:
          "The provider response was received but could not be saved. Please contact support.",
      }, 500);
    }

    // Complete attempt after saving KYC result.
    const { error: finalAttemptError } = await adminClient
      .from("kyc_verification_attempts")
      .update({
        status: finalStatus,
        provider_http_status: ninjaResponse.status,
        error_category: null,
        updated_at: now,
        completed_at: now,
      })
      .eq("id", attemptId)
      .eq("status", "pending");

    if (finalAttemptError) {
      console.error("Could not finalize KYC attempt record.");

      return json({
        status: finalStatus,
        message:
          "The verification result was saved, but its attempt record needs support review.",
      }, 500);
    }

    return json({
      status: finalStatus,
      recommendation,
      score,
      message: accepted
        ? "The provider accepted the identity verification."
        : "The provider did not accept the identity details. Please contact support if you believe this is incorrect.",
    });
  } catch {
    console.error("Unexpected identity verification processing error.");

    return json({
      error: "Unable to process verification. Please contact support.",
    }, 500);
  }
});



import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed." }, 405);
  }

  try {
    // =====================================
    // SERVER CONFIGURATION
    // =====================================

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const paystackSecret = Deno.env.get("PAYSTACK_SECRET_KEY");

    if (
      !supabaseUrl ||
      !supabaseKey ||
      !serviceRoleKey ||
      !paystackSecret
    ) {
      console.error("Required server configuration is missing.");

      return jsonResponse(
        { error: "Server configuration is incomplete." },
        500,
      );
    }

    // =====================================
    // AUTHENTICATE THE USER
    // =====================================

    const authorization = req.headers.get("Authorization");

    if (!authorization?.startsWith("Bearer ")) {
      return jsonResponse(
        { error: "Please sign in first." },
        401,
      );
    }

    // User-scoped client: respects the authenticated user's permissions.
    const supabase = createClient(
      supabaseUrl,
      supabaseKey,
      {
        global: {
          headers: {
            Authorization: authorization,
          },
        },
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      },
    );

    // Trusted server-side client: never expose its key to the browser.
    const adminClient = createClient(
      supabaseUrl,
      serviceRoleKey,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      },
    );

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return jsonResponse(
        { error: "Your session is invalid or expired." },
        401,
      );
    }

    if (!user.email) {
      return jsonResponse(
        {
          error: "Please add and verify your email before continuing.",
        },
        400,
      );
    }

    // =====================================
    // CHECK FOR AN EXISTING VIRTUAL ACCOUNT
    // =====================================

    const {
      data: existingAccount,
      error: existingError,
    } = await supabase
      .from("virtual_accounts")
      .select(
        "id, account_number, account_name, bank_name, currency, status",
      )
      .eq("user_id", user.id)
      .eq("provider", "paystack")
      .maybeSingle();

    if (existingError) {
      console.error(
        "Existing account lookup failed:",
        existingError.message,
      );

      return jsonResponse(
        { error: "Could not check your existing account." },
        500,
      );
    }

    if (existingAccount) {
      return jsonResponse({
        success: true,
        message: "Your virtual account already exists.",
        account: existingAccount,
      });
    }

    // =====================================
    // READ THE AUTHENTICATED USER'S PROFILE
    // =====================================

    const {
      data: profile,
      error: profileError,
    } = await supabase
      .from("profiles")
      .select("full_name, phone")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError) {
      console.error(
        "Profile lookup failed:",
        profileError.message,
      );

      return jsonResponse(
        { error: "Could not retrieve your profile." },
        500,
      );
    }

    const fullName = profile?.full_name?.trim();
    const phone = profile?.phone?.trim();

    if (!fullName || !phone) {
      return jsonResponse(
        {
          error:
            "Please complete your profile with your full name and phone number.",
        },
        400,
      );
    }

    const nameParts = fullName.split(/\s+/);

    if (nameParts.length < 2) {
      return jsonResponse(
        {
          error:
            "Please enter both your first name and surname in your profile.",
        },
        400,
      );
    }

    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(" ");

    // =====================================
    // PAYSTACK API HELPER
    // =====================================

    async function paystackRequest(
      path: string,
      options?: RequestInit,
    ) {
      const response = await fetch(
        `https://api.paystack.co${path}`,
        {
          ...options,
          headers: {
            Authorization: `Bearer ${paystackSecret}`,
            "Content-Type": "application/json",
            ...options?.headers,
          },
        },
      );

      const result = await response.json();

      if (!response.ok || result.status !== true) {
        console.error("Paystack request failed:", {
          path,
          status: response.status,
          message: result.message,
        });

        throw new Error(
          response.status === 400 || response.status === 422
            ? "Paystack could not process the account request. Check your customer details and validation requirements."
            : "Paystack could not complete the request. Please try again later.",
        );
      }

      return result.data;
    }

    // =====================================
    // FIND OR CREATE THE PAYSTACK CUSTOMER
    // =====================================

    let customer: any;

    try {
      customer = await paystackRequest(
        `/customer/${encodeURIComponent(user.email)}`,
      );
    } catch {
      customer = await paystackRequest(
        "/customer",
        {
          method: "POST",
          body: JSON.stringify({
            email: user.email,
            first_name: firstName,
            last_name: lastName,
            phone,
          }),
        },
      );
    }

    if (!customer?.customer_code) {
      console.error("Paystack customer code is missing.");

      return jsonResponse(
        {
          error: "Paystack did not return a valid customer record.",
        },
        502,
      );
    }

    // =====================================
    // CREATE THE DEDICATED VIRTUAL ACCOUNT
    // =====================================

    const virtualAccount = await paystackRequest(
      "/dedicated_account",
      {
        method: "POST",
        body: JSON.stringify({
          customer: customer.customer_code,
          preferred_bank: "titan-paystack",
          first_name: firstName,
          last_name: lastName,
          phone,
        }),
      },
    );

    if (
      !virtualAccount?.account_number ||
      !virtualAccount?.account_name ||
      !virtualAccount?.bank?.name ||
      !virtualAccount?.id
    ) {
      console.error(
        "Paystack returned incomplete account details.",
      );

      return jsonResponse(
        {
          error:
            "The account is not ready yet. Please try again later.",
        },
        502,
      );
    }

    // =====================================
    // SAVE THE ACCOUNT USING THE ADMIN CLIENT
    // =====================================
    // RLS remains enabled.
    // Only this trusted Edge Function uses the service-role client.
    // The user ID comes from the verified Supabase session.

    const {
      data: savedAccount,
      error: saveError,
    } = await adminClient
      .from("virtual_accounts")
      .insert({
        user_id: user.id,
        provider: "paystack",
        provider_customer_code: customer.customer_code,
        provider_dedicated_account_id: virtualAccount.id,
        account_number: virtualAccount.account_number,
        account_name: virtualAccount.account_name,
        bank_name: virtualAccount.bank.name,
        currency: virtualAccount.currency || "NGN",
        status: virtualAccount.active ? "active" : "pending",
      })
      .select(
        "id, account_number, account_name, bank_name, currency, status",
      )
      .single();

    if (saveError) {
      console.error(
        "Virtual account database save failed:",
        saveError.message,
      );

      // Paystack may already have created the account.
      // Do not automatically create another account on retry.
      return jsonResponse(
        {
          error:
            "Paystack may have created your account, but we could not save it. Please contact support before retrying.",
          code: "ACCOUNT_SAVE_FAILED",
        },
        500,
      );
    }

    // =====================================
    // SUCCESS
    // =====================================

    return jsonResponse({
      success: true,
      message: "Your virtual account has been created successfully.",
      account: savedAccount,
    });
  } catch (error) {
    console.error(
      "Virtual account function error:",
      error instanceof Error
        ? error.message
        : "Unknown error",
    );

    return jsonResponse(
      {
        error:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred.",
      },
      500,
    );
  }
});

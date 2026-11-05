
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
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
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const paystackSecretKey = Deno.env.get("PAYSTACK_SECRET_KEY");

    if (!supabaseUrl || !supabaseAnonKey || !paystackSecretKey) {
      console.error("Required environment configuration is missing.");

      return jsonResponse(
        { success: false, error: "Server configuration is incomplete." },
        500,
      );
    }

    const authorization = req.headers.get("Authorization");

    if (!authorization?.startsWith("Bearer ")) {
      return jsonResponse(
        { success: false, error: "Authentication required." },
        401,
      );
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: { Authorization: authorization },
      },
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error("Bank-transfer authentication failed:", {
        message: authError?.message ?? "No authenticated user",
      });

      return jsonResponse(
        {
          success: false,
          error: "Invalid or expired session. Please log in again.",
        },
        401,
      );
    }

    const body = await req.json().catch(() => null);

    if (!body || typeof body.action !== "string") {
      return jsonResponse(
        { success: false, error: "A valid action is required." },
        400,
      );
    }

    // Centralized Paystack API request.
    const paystackRequest = async (
      endpoint: string,
    ): Promise<{ response: Response; data: any }> => {
      const response = await fetch(`https://api.paystack.co${endpoint}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${paystackSecretKey}`,
          Accept: "application/json",
        },
        signal: AbortSignal.timeout(15000),
      });

      const data = await response.json().catch(() => ({}));

      return { response, data };
    };

    // ACTION 1: List Nigerian banks.
    if (body.action === "list_banks") {
      let response: Response;
      let data: any;

      try {
        ({ response, data } = await paystackRequest(
          "/bank?country=nigeria&currency=NGN&perPage=100",
        ));
      } catch (error) {
        console.error("Paystack bank-list request failed:", {
          message: error instanceof Error
            ? error.message
            : "Unknown network error",
        });

        return jsonResponse(
          {
            success: false,
            error: "Unable to retrieve banks. Please try again.",
          },
          502,
        );
      }

      if (!response.ok || data.status !== true) {
        console.error("Paystack bank-list request failed:", {
          httpStatus: response.status,
          message: data.message ?? "No provider message returned",
          providerStatus: data.status ?? null,
          providerCode: data.code ?? null,
        });

        return jsonResponse(
          {
            success: false,
            error: "Unable to retrieve banks. Please try again.",
          },
          502,
        );
      }

      const banks = Array.isArray(data.data)
        ? data.data
            .filter(
              (bank: any) =>
                bank &&
                typeof bank.name === "string" &&
                typeof bank.code === "string",
            )
            .map((bank: any) => ({
              name: bank.name,
              code: bank.code,
              slug: bank.slug ?? null,
            }))
        : [];

      return jsonResponse({
        success: true,
        banks,
      });
    }

    // ACTION 2: Resolve a Nigerian bank account.
    if (body.action === "resolve_account") {
      const accountNumber = String(body.account_number ?? "").trim();
      const bankCode = String(body.bank_code ?? "").trim();

      if (!/^\d{10}$/.test(accountNumber)) {
        return jsonResponse(
          {
            success: false,
            error: "Enter a valid 10-digit Nigerian account number.",
          },
          400,
        );
      }

      if (!/^\d{2,10}$/.test(bankCode)) {
        return jsonResponse(
          { success: false, error: "Invalid bank code." },
          400,
        );
      }

      const params = new URLSearchParams({
        account_number: accountNumber,
        bank_code: bankCode,
      });

      let response: Response;
      let data: any;

      try {
        ({ response, data } = await paystackRequest(
          `/bank/resolve?${params.toString()}`,
        ));
      } catch (error) {
        console.error("Paystack account-resolution request failed:", {
          message: error instanceof Error
            ? error.message
            : "Unknown network error",
        });

        return jsonResponse(
          {
            success: false,
            error:
              "Unable to contact the account-verification service. Please try again.",
          },
          502,
        );
      }

      if (
        !response.ok ||
        data.status !== true ||
        !data.data?.account_name
      ) {
        // Diagnostic information only: never log the account number or key.
        console.error("Paystack account resolution failed:", {
          httpStatus: response.status,
          message: data.message ?? "No provider message returned",
          providerStatus: data.status ?? null,
          providerCode: data.code ?? null,
        });

        const isAccountRejection =
          response.status === 400 ||
          response.status === 404 ||
          response.status === 422;

        // Return a safe diagnostic category to the frontend.
        const errorCategory = isAccountRejection
          ? "ACCOUNT_RESOLUTION_REJECTED"
          : response.status === 401 || response.status === 403
          ? "PAYSTACK_AUTH_OR_PERMISSION_ERROR"
          : "PAYSTACK_PROVIDER_ERROR";

        return jsonResponse(
          {
            success: false,
            error: isAccountRejection
              ? "We could not verify this account. Check the account number and matching bank."
              : "The verification service could not complete the request. Please try again.",
            diagnostic: {
              category: errorCategory,
              providerHttpStatus: response.status,
            },
          },
          isAccountRejection ? 422 : 502,
        );
      }

      return jsonResponse({
        success: true,
        account: {
          account_number: accountNumber,
          bank_code: bankCode,
          account_name: String(data.data.account_name),
        },
      });
    }

    return jsonResponse(
      { success: false, error: "Unsupported action." },
      400,
    );
  } catch (error) {
    console.error("Bank-transfer request failed:", {
      message: error instanceof Error ? error.message : "Unknown error",
    });

    return jsonResponse(
      {
        success: false,
        error: "An unexpected error occurred. Please try again.",
      },
      500,
    );
  }
});

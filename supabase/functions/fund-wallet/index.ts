import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods':
    'POST, OPTIONS',
}

const supabaseUrl =
  Deno.env.get('SUPABASE_URL')!

const supabaseAnonKey =
  Deno.env.get('SUPABASE_ANON_KEY')!

const serviceRoleKey =
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const paystackSecretKey =
  (Deno.env.get('PAYSTACK_SECRET_KEY') || '').trim()

const authClient = createClient(
  supabaseUrl,
  supabaseAnonKey
)

const adminClient = createClient(
  supabaseUrl,
  serviceRoleKey
)

function jsonResponse(
  body: unknown,
  status = 200
) {
  return new Response(
    JSON.stringify(body),
    {
      status,
      headers: {
        ...corsHeaders,
        'Content-Type':
          'application/json',
      },
    }
  )
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: corsHeaders,
    })
  }

  try {
    // =========================
    // PAYSTACK SECRET CHECK
    // =========================

    if (!paystackSecretKey) {
      return jsonResponse(
        {
          error:
            'PAYSTACK_SECRET_KEY is missing from Supabase Edge Function secrets.',
        },
        500
      )
    }

    if (!paystackSecretKey.startsWith('sk_live_')) {
  return jsonResponse(
    {
      error: 'Live Paystack mode is required.'
    },
    500
  )
}


    // =========================
    // AUTHENTICATE USER
    // =========================

    const authHeader =
      req.headers.get('Authorization')

    if (
      !authHeader ||
      !authHeader.startsWith('Bearer ')
    ) {
      return jsonResponse(
        {
          error:
            'Missing or invalid authorization header.',
        },
        401
      )
    }

    const token =
      authHeader
        .slice('Bearer '.length)
        .trim()

    if (!token) {
      return jsonResponse(
        {
          error:
            'Authentication token is missing.',
        },
        401
      )
    }

    const {
      data: {
        user,
      },
      error: userError,
    } =
      await authClient.auth.getUser(
        token
      )

    if (userError || !user) {
      return jsonResponse(
        {
          error:
            'Unauthorized.',
        },
        401
      )
    }

    // =========================
    // REQUEST BODY
    // =========================

    const body = await req.json()

    const action =
      String(body.action || '').trim()

    // ==================================================
    // INITIALIZE PAYMENT
    // ==================================================

    if (action === 'initialize') {
      const rawAmount =
        Number(body.amountNaira)

      if (
        !Number.isFinite(rawAmount) ||
        rawAmount < 100
      ) {
        return jsonResponse(
          {
            error:
              'Minimum funding amount is ₦100.',
          },
          400
        )
      }

      // Keep money to 2 decimal places.
      const amountNaira =
        Math.round(
          rawAmount * 100
        ) / 100

      const amountKobo =
        Math.round(
          amountNaira * 100
        )

      if (
        !Number.isSafeInteger(
          amountKobo
        )
      ) {
        return jsonResponse(
          {
            error:
              'Invalid funding amount.',
          },
          400
        )
      }

      if (!user.email) {
        return jsonResponse(
          {
            error:
              'Your account does not have an email address.',
          },
          400
        )
      }

      // Much stronger than timestamp alone.
      const reference =
        `MUF-${user.id.slice(0, 8)}-${Date.now()}-${crypto
          .randomUUID()
          .replaceAll('-', '')
          .slice(0, 12)}`

      // =========================
      // CREATE PENDING TRANSACTION
      // =========================

      const {
        error:
          transactionError,
      } =
        await adminClient
          .from('transactions')
          .insert({
            sender_id: null,
            receiver_id: user.id,
            amount: amountNaira,
            type: 'fund_wallet',
            status: 'pending',
            reference,
            description:
              'Wallet funding via Paystack',
          })

      if (transactionError) {
        console.error(
          'Transaction insert error:',
          transactionError
        )

        return jsonResponse(
          {
            error:
              'Unable to create payment record.',
          },
          500
        )
      }

      // =========================
      // INITIALIZE PAYSTACK
      // =========================

      let paystackResponse: Response

      try {
        paystackResponse =
          await fetch(
            'https://api.paystack.co/transaction/initialize',
            {
              method: 'POST',

              headers: {
                Authorization:
                  `Bearer ${paystackSecretKey}`,

                'Content-Type':
                  'application/json',
              },

              body: JSON.stringify({
                email:
                  user.email,

                amount:
                  amountKobo.toString(),

                currency:
                  'NGN',

                reference,

                metadata: {
                  user_id:
                    user.id,

                  purpose:
                    'wallet_funding',
                },
              }),
            }
          )
      } catch (error) {
        console.error(
          'Paystack connection error:',
          error
        )

        await adminClient
          .from('transactions')
          .update({
            status: 'failed',
            description:
              'Paystack initialization failed.',
          })
          .eq(
            'reference',
            reference
          )
          .eq(
            'receiver_id',
            user.id
          )

        return jsonResponse(
          {
            error:
              'Unable to connect to Paystack.',
          },
          502
        )
      }

      const paystackData =
        await paystackResponse.json()

      console.log(
        'Paystack initialize status:',
        paystackResponse.status
      )

      if (
        !paystackResponse.ok ||
        !paystackData.status
      ) {
        console.error(
          'Paystack initialize error:',
          paystackData
        )

        await adminClient
          .from('transactions')
          .update({
            status: 'failed',
            description:
              'Paystack initialization was rejected.',
          })
          .eq(
            'reference',
            reference
          )
          .eq(
            'receiver_id',
            user.id
          )

        return jsonResponse(
          {
            error:
              paystackData.message ||
              'Unable to initialize Paystack payment.',
          },
          400
        )
      }

      return jsonResponse({
        authorization_url:
          paystackData.data
            .authorization_url,

        access_code:
          paystackData.data
            .access_code,

        reference:
          paystackData.data
            .reference,
      })
    }

    // ==================================================
    // VERIFY PAYMENT
    // ==================================================

    if (action === 'verify') {
      const reference =
        String(
          body.reference || ''
        ).trim()

      if (!reference) {
        return jsonResponse(
          {
            error:
              'Payment reference is required.',
          },
          400
        )
      }

      // =========================
      // FIND USER'S TRANSACTION
      // =========================

      const {
        data: pendingPayment,
        error:
          pendingError,
      } =
        await adminClient
          .from('transactions')
          .select('*')
          .eq(
            'reference',
            reference
          )
          .eq(
            'receiver_id',
            user.id
          )
          .eq(
            'type',
            'fund_wallet'
          )
          .single()

      if (
        pendingError ||
        !pendingPayment
      ) {
        return jsonResponse(
          {
            error:
              'Payment record not found.',
          },
          404
        )
      }

      // =========================
      // ALREADY CREDITED
      // =========================

      if (
        pendingPayment.status ===
        'successful'
      ) {
        const {
          data: wallet,
        } =
          await adminClient
            .from('wallets')
            .select('balance')
            .eq(
              'user_id',
              user.id
            )
            .single()

        return jsonResponse({
          success: true,
          alreadyCredited: true,
          balance:
            wallet?.balance || 0,
        })
      }

      // =========================
      // VERIFY WITH PAYSTACK
      // =========================

      const verifyResponse =
        await fetch(
          `https://api.paystack.co/transaction/verify/${encodeURIComponent(
            reference
          )}`,
          {
            method: 'GET',

            headers: {
              Authorization:
                `Bearer ${paystackSecretKey}`,
            },
          }
        )

      const verifyData =
        await verifyResponse.json()

      console.log(
        'Paystack verify status:',
        verifyResponse.status
      )

      if (
        !verifyResponse.ok ||
        !verifyData.status
      ) {
        console.error(
          'Paystack verify error:',
          verifyData
        )

        return jsonResponse(
          {
            error:
              verifyData.message ||
              'Unable to verify payment.',
          },
          400
        )
      }

      const payment =
        verifyData.data


        if (payment.domain !== 'live') {
  return jsonResponse(
    {
      error: 'Test-mode payments cannot fund a live wallet.'
    },
    400
  )
}

      // =========================
      // REFERENCE CHECK
      // =========================

      if (
        payment.reference !==
        reference
      ) {
        return jsonResponse(
          {
            error:
              'Payment reference mismatch.',
          },
          400
        )
      }

      // =========================
      // METADATA USER CHECK
      // =========================

      const metadataUserId = payment.metadata?.user_id

        if (
  typeof metadataUserId !== 'string' ||
  metadataUserId !== user.id
) {
  return jsonResponse(
    {
      error: 'Payment ownership mismatch.',
    },
    403
  )
}

      // =========================
      // PAYMENT STATUS
      // =========================

      if (
        payment.status !==
        'success'
      ) {
        return jsonResponse(
          {
            error:
              'Payment was not successful.',

            paymentStatus:
              payment.status,
          },
          400
        )
      }

      // =========================
      // CURRENCY CHECK
      // =========================

      if (
        payment.currency !==
        'NGN'
      ) {
        return jsonResponse(
          {
            error:
              'Invalid payment currency.',
          },
          400
        )
      }

      // =========================
      // AMOUNT CHECK
      // =========================

      const expectedAmount =
        Number(
          pendingPayment.amount
        )

      const paidAmount =
        Number(
          payment.amount
        ) / 100

      if (
        paidAmount !==
        expectedAmount
      ) {
        return jsonResponse(
          {
            error:
              'Payment amount mismatch.',
          },
          400
        )
      }

      // =========================
      // CREDIT WALLET
      // =========================

      const {
        data:
          creditResult,
        error:
          creditError,
      } =
        await adminClient.rpc(
          'credit_wallet_from_payment',
          {
            p_user_id:
              user.id,

            p_amount:
              expectedAmount,

            p_reference:
              reference,
          }
        )

      if (creditError) {
        console.error(
          'Credit wallet error:',
          creditError
        )

        return jsonResponse(
          {
            error:
              'Unable to credit wallet.',
          },
          500
        )
      }

      // =========================
      // SUCCESS
      // =========================

      return jsonResponse({
        success: true,

        credited:
          creditResult?.credited ??
          false,

        duplicate:
          creditResult?.duplicate ??
          false,

        balance:
          creditResult?.balance ??
          0,
      })
    }

    // =========================
    // INVALID ACTION
    // =========================

    return jsonResponse(
      {
        error:
          'Invalid action.',
      },
      400
    )
  } catch (error) {
    console.error(
      'Fund wallet error:',
      error
    )

    return jsonResponse(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Server error.',
      },
      500
    )
  }
})
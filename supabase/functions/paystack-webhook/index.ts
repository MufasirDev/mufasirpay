import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'content-type, x-paystack-signature',
  'Access-Control-Allow-Methods':
    'POST, OPTIONS',
}

const supabaseUrl =
  Deno.env.get('SUPABASE_URL')!

const serviceRoleKey =
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const paystackSecretKey =
  (Deno.env.get('PAYSTACK_SECRET_KEY') || '').trim()

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
        'Content-Type': 'application/json',
      },
    }
  )
}

// =====================================
// CREATE WALLET FUNDING NOTIFICATION
// =====================================

async function createFundingNotification(
  userId: string,
  amount: number,
  reference: string
) {
  try {
    const formattedAmount =
      new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN',
        minimumFractionDigits: 2,
      }).format(amount)

    const { error } = await adminClient
      .from('notifications')
      .upsert(
        {
          user_id: userId,
          title: 'Wallet funded successfully',
          message: `Your wallet has been credited with ${formattedAmount}.`,
          category: 'wallet',
          status: 'success',
          reference,
        },
        {
          onConflict: 'user_id,reference,category',
          ignoreDuplicates: true,
        }
      )

    if (error) {
      console.error(
        'Funding notification failed:',
        error.message
      )
    } else {
      console.log(
        'Funding notification checked:',
        reference
      )
    }
  } catch (error) {
    console.error(
      'Funding notification error:',
      error
    )
  }
}

// =====================================
// PAYSTACK SIGNATURE HELPERS
// =====================================

function bytesToHex(
  bytes: Uint8Array
) {
  return Array.from(bytes)
    .map((byte) =>
      byte.toString(16).padStart(2, '0')
    )
    .join('')
}

async function createHmacSha512(
  secret: string,
  payload: string
) {
  const encoder = new TextEncoder()

  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    {
      name: 'HMAC',
      hash: 'SHA-512',
    },
    false,
    ['sign']
  )

  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(payload)
  )

  return bytesToHex(
    new Uint8Array(signature)
  )
}

function safeEqual(
  a: string,
  b: string
) {
  if (a.length !== b.length) {
    return false
  }

  let result = 0

  for (let i = 0; i < a.length; i++) {
    result |=
      a.charCodeAt(i) ^
      b.charCodeAt(i)
  }

  return result === 0
}

// =====================================
// PAYSTACK WEBHOOK
// =====================================

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: corsHeaders,
    })
  }

  if (req.method !== 'POST') {
    return jsonResponse(
      { error: 'Method not allowed.' },
      405
    )
  }

  try {
    if (!paystackSecretKey) {
      console.error(
        'PAYSTACK_SECRET_KEY is missing.'
      )

      return jsonResponse(
        { error: 'Webhook configuration error.' },
        500
      )
    }

    // READ RAW BODY
    const rawBody = await req.text()

    // VERIFY PAYSTACK SIGNATURE
    const receivedSignature =
      req.headers.get('x-paystack-signature')

    if (!receivedSignature) {
      return jsonResponse(
        { error: 'Missing Paystack signature.' },
        401
      )
    }

    const expectedSignature =
      await createHmacSha512(
        paystackSecretKey,
        rawBody
      )

    if (
      !safeEqual(
        receivedSignature,
        expectedSignature
      )
    ) {
      console.error(
        'Invalid Paystack webhook signature.'
      )

      return jsonResponse(
        { error: 'Invalid signature.' },
        401
      )
    }

    // PARSE EVENT
    const event = JSON.parse(rawBody)

    console.log(
      'Paystack webhook event:',
      event.event
    )

    // HANDLE SUCCESSFUL PAYMENT
    if (event.event !== 'charge.success') {
      return jsonResponse({
        received: true,
        ignored: true,
      })
    }

    const payment = event.data

    if (
      !payment ||
      payment.status !== 'success'
    ) {
      return jsonResponse({
        received: true,
        ignored: true,
      })
    }

    // PRODUCTION SAFETY CHECK
    if (payment.domain !== 'live') {
      console.warn(
        'Non-live payment rejected:',
        payment.reference,
        payment.domain
      )

      return jsonResponse({
        received: true,
        ignored: true,
      })
    }

    const reference =
      String(payment.reference || '').trim()

    if (!reference) {
      console.error(
        'Webhook payment has no reference.'
      )

      return jsonResponse(
        { error: 'Payment reference missing.' },
        400
      )
    }

    // CURRENCY CHECK
    if (payment.currency !== 'NGN') {
      console.error(
        'Invalid payment currency:',
        payment.currency,
        reference
      )

      return jsonResponse(
        { error: 'Invalid payment currency.' },
        400
      )
    }

    // =====================================
    // DEDICATED VIRTUAL ACCOUNT DEPOSIT
    // =====================================

    const authorization = payment.authorization

    if (
      authorization?.channel === 'dedicated_nuban'
    ) {
      const accountNumber = String(
        authorization.receiver_bank_account_number || ''
      ).trim()

      if (!accountNumber) {
        console.error(
          'Virtual-account payment has no receiving account number.',
          reference
        )

        return jsonResponse(
          { error: 'Receiving account number missing.' },
          400
        )
      }

      // PAYSTACK AMOUNTS ARE IN KOBO
      const paidAmount =
        Number(payment.amount) / 100

      if (
        !Number.isFinite(paidAmount) ||
        paidAmount <= 0
      ) {
        console.error(
          'Invalid virtual-account payment amount:',
          payment.amount,
          reference
        )

        return jsonResponse(
          { error: 'Invalid payment amount.' },
          400
        )
      }

      // FIND THE SAVED ACTIVE VIRTUAL ACCOUNT.
      // DO NOT TRUST PAYMENT METADATA FOR OWNERSHIP.
      const {
        data: virtualAccount,
        error: accountError,
      } = await adminClient
        .from('virtual_accounts')
        .select('user_id, account_number')
        .eq('provider', 'paystack')
        .eq('account_number', accountNumber)
        .eq('status', 'active')
        .eq('currency', 'NGN')
        .maybeSingle()

      if (accountError) {
        console.error(
          'Virtual-account lookup failed:',
          accountError
        )

        return jsonResponse(
          { error: 'Unable to verify receiving account.' },
          500
        )
      }

      if (!virtualAccount) {
        console.error(
          'No active virtual account matches the receiving account:',
          accountNumber,
          reference
        )

        return jsonResponse(
          { error: 'Receiving virtual account not found.' },
          404
        )
      }

      const userId = virtualAccount.user_id

      // CREDIT WALLET ATOMICALLY THROUGH SQL RPC.
      // THE DATABASE FUNCTION HANDLES DUPLICATE REFERENCES.
      const {
        data: creditResult,
        error: creditError,
      } = await adminClient.rpc(
        'credit_wallet_from_virtual_account',
        {
          p_account_number: accountNumber,
          p_amount: paidAmount,
          p_reference: reference,
        }
      )

      if (creditError) {
        console.error(
          'Virtual-account wallet credit failed:',
          {
            reference,
            accountNumber,
            error: creditError.message,
          }
        )

        // Return 500 so a failed operation can be investigated
        // and retried by the webhook delivery mechanism.
        return jsonResponse(
          { error: 'Unable to credit virtual-account deposit.' },
          500
        )
      }

      console.log(
        'Virtual-account deposit processed:',
        {
          reference,
          userId,
          accountNumber,
          amount: paidAmount,
          credited: creditResult?.credited,
          duplicate: creditResult?.duplicate,
        }
      )

      // CREATE NOTIFICATION AFTER CONFIRMED CREDIT
      if (
        creditResult?.credited === true ||
        creditResult?.duplicate === true
      ) {
        await createFundingNotification(
          userId,
          paidAmount,
          reference
        )
      }

      return jsonResponse({
        received: true,
        paymentType: 'dedicated_virtual_account',
        processed: true,
        credited: creditResult?.credited ?? false,
        duplicate: creditResult?.duplicate ?? false,
      })
    }

    // =====================================
    // EXISTING CARD WALLET FUNDING
    // KEEP THIS FLOW INTACT
    // =====================================

    const metadata = payment.metadata
    const purpose = metadata?.purpose

    if (purpose !== 'wallet_funding') {
      return jsonResponse({
        received: true,
        ignored: true,
      })
    }

    const metadataUserId = metadata?.user_id

    if (!metadataUserId) {
      return jsonResponse(
        { error: 'Payment user ID missing.' },
        400
      )
    }

    // FIND ORIGINAL TRANSACTION
    const {
      data: transaction,
      error: transactionError,
    } = await adminClient
      .from('transactions')
      .select('*')
      .eq('reference', reference)
      .eq('type', 'fund_wallet')
      .single()

    if (transactionError || !transaction) {
      console.error(
        'Funding transaction not found:',
        transactionError
      )

      return jsonResponse(
        { error: 'Funding transaction not found.' },
        404
      )
    }

    // OWNERSHIP CHECK
    if (transaction.receiver_id !== metadataUserId) {
      console.error(
        'Webhook ownership mismatch.'
      )

      return jsonResponse(
        { error: 'Payment ownership mismatch.' },
        403
      )
    }

    // AMOUNT CHECK
    const expectedAmount =
      Number(transaction.amount)

    const paidAmount =
      Number(payment.amount) / 100

    if (
      !Number.isFinite(expectedAmount) ||
      paidAmount !== expectedAmount
    ) {
      console.error(
        'Webhook amount mismatch:',
        {
          expectedAmount,
          paidAmount,
        }
      )

      return jsonResponse(
        { error: 'Payment amount mismatch.' },
        400
      )
    }

    // ALREADY PROCESSED
    // DO NOT CREDIT THE WALLET TWICE.
    // ENSURE THE FUNDING NOTIFICATION EXISTS.
    if (transaction.status === 'successful') {
      await createFundingNotification(
        metadataUserId,
        expectedAmount,
        reference
      )

      return jsonResponse({
        received: true,
        alreadyProcessed: true,
        notificationChecked: true,
      })
    }

    // CREDIT WALLET USING THE EXISTING CARD-FUNDING RPC
    const {
      data: creditResult,
      error: creditError,
    } = await adminClient.rpc(
      'credit_wallet_from_payment',
      {
        p_user_id: metadataUserId,
        p_amount: expectedAmount,
        p_reference: reference,
      }
    )

    if (creditError) {
      console.error(
        'Wallet credit error:',
        creditError
      )

      return jsonResponse(
        { error: 'Unable to credit wallet.' },
        500
      )
    }

    console.log(
      'Wallet funding processed:',
      {
        reference,
        userId: metadataUserId,
        amount: expectedAmount,
        result: creditResult,
      }
    )

    // CREATE NOTIFICATION AFTER CONFIRMED CREDIT
    if (
      creditResult?.credited === true ||
      creditResult?.duplicate === true
    ) {
      await createFundingNotification(
        metadataUserId,
        expectedAmount,
        reference
      )
    }

    return jsonResponse({
      received: true,
      processed: true,
      credited: creditResult?.credited ?? false,
      duplicate: creditResult?.duplicate ?? false,
    })
  } catch (error) {
    console.error(
      'Paystack webhook error:',
      error
    )

    return jsonResponse(
      { error: 'Webhook processing failed.' },
      500
    )
  }
})
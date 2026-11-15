import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!
const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const authClient = createClient(
  supabaseUrl,
  supabaseAnonKey
)

const adminClient = createClient(
  supabaseUrl,
  serviceRoleKey
)

const PIN_ITERATIONS = 600_000

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  })
}

function fromHex(hex: string): Uint8Array {
  if (!/^(?:[0-9a-f]{2})+$/i.test(hex)) {
    throw new Error('Invalid stored PIN data.')
  }

  return new Uint8Array(
    hex.match(/.{2}/g)!.map((byte) => parseInt(byte, 16))
  )
}

async function hashPin(
  pin: string,
  salt: Uint8Array
): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(pin),
    'PBKDF2',
    false,
    ['deriveBits']
  )

  const bits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      hash: 'SHA-256',
      salt,
      iterations: PIN_ITERATIONS,
    },
    key,
    256
  )

  return new Uint8Array(bits)
}

function constantTimeEqual(
  a: Uint8Array,
  b: Uint8Array
): boolean {
  if (a.length !== b.length) return false

  let difference = 0

  for (let i = 0; i < a.length; i++) {
    difference |= a[i] ^ b[i]
  }

  return difference === 0
}

// Notifications must never cause a completed transfer to fail.
async function createNotification(notification: {
  user_id: string
  title: string
  message: string
  category: 'transfer'
  status: 'success'
  reference: string
}) {
  try {
    const { error } = await adminClient
      .from('notifications')
      .insert(notification)

    if (error) {
      console.error(
        'Notification creation failed:',
        error.message
      )
    }
  } catch (error) {
    console.error('Notification error:', error)
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: corsHeaders,
    })
  }

  if (req.method !== 'POST') {
    return jsonResponse(
      { error: 'Method not allowed' },
      405
    )
  }

  try {
    // =========================
    // AUTHENTICATION
    // =========================

    const authHeader = req.headers.get('Authorization')

    if (!authHeader?.startsWith('Bearer ')) {
      return jsonResponse({
        error: 'Missing or invalid authorization header.',
      }, 401)
    }

    const token = authHeader
      .slice('Bearer '.length)
      .trim()

    if (!token) {
      return jsonResponse({
        error: 'Authentication token is missing.',
      }, 401)
    }

    const {
      data: { user },
      error: userError,
    } = await authClient.auth.getUser(token)

    if (userError || !user) {
      return jsonResponse({
        error: 'Unauthorized.',
      }, 401)
    }

    // =========================
    // REQUEST BODY
    // =========================

    const body = await req.json()

    const receiverAccountNumber = String(
      body.receiverAccountNumber ?? ''
    ).trim()

    const rawAmount = Number(body.amount)

    const pin =
      typeof body.pin === 'string'
        ? body.pin
        : ''

    const idempotencyKey =
      typeof body.idempotencyKey === 'string'
        ? body.idempotencyKey
        : ''

    // =========================
    // VALIDATE IDEMPOTENCY KEY
    // =========================

    const validUUID =
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

    if (!validUUID.test(idempotencyKey)) {
      return jsonResponse({
        error: 'A valid transfer idempotency key is required.',
      }, 400)
    }

    // =========================
    // VALIDATE ACCOUNT NUMBER
    // =========================

    if (!/^\d{10}$/.test(receiverAccountNumber)) {
      return jsonResponse({
        error: 'Enter a valid 10-digit MufasirPay account number.',
      }, 400)
    }

    // =========================
    // VALIDATE AMOUNT
    // =========================

    if (!Number.isFinite(rawAmount)) {
      return jsonResponse({
        error: 'Enter a valid transfer amount.',
      }, 400)
    }

    const amount = Math.round(rawAmount * 100) / 100

    if (amount < 100) {
      return jsonResponse({
        error: 'Minimum transfer amount is ₦100.',
      }, 400)
    }

    if (!Number.isSafeInteger(Math.round(amount * 100))) {
      return jsonResponse({
        error: 'Transfer amount is too large or invalid.',
      }, 400)
    }

    // =========================
    // VALIDATE PIN FORMAT
    // =========================

    if (!/^\d{6}$/.test(pin)) {
      return jsonResponse({
        error: 'Enter your valid 6-digit transaction PIN.',
      }, 400)
    }

    // =========================
    // BEGIN PIN VERIFICATION
    // =========================

    const {
      data: reservation,
      error: beginPinError,
    } = await adminClient.rpc(
      'begin_pin_verification',
      {
        p_user_id: user.id,
      }
    )

    if (beginPinError) {
      console.error(
        'PIN verification start failed:',
        beginPinError.message
      )

      return jsonResponse({
        error: 'Unable to verify your transaction PIN. Please try again.',
      }, 500)
    }

    if (
      !reservation ||
      typeof reservation !== 'object'
    ) {
      console.error(
        'Unexpected PIN reservation response:',
        reservation
      )

      return jsonResponse({
        error: 'Unable to start PIN verification. Please try again.',
      }, 500)
    }

    const reservationStatus =
      reservation.status as string | undefined

    const reservationToken =
      reservation.token as string | undefined

    if (reservationStatus === 'pin_not_set') {
      return jsonResponse({
        error: 'Please set your transaction PIN before making a transfer.',
      }, 400)
    }

    if (reservationStatus === 'locked') {
      return jsonResponse({
        error: 'Your transaction PIN is temporarily locked. Please try again later.',
      }, 423)
    }

    if (reservationStatus === 'verification_in_progress') {
      return jsonResponse({
        error: 'A PIN verification is already in progress. Please wait a moment and try again.',
      }, 409)
    }

    if (
      reservationStatus !== 'reserved' ||
      !reservationToken
    ) {
      console.error(
        'Unexpected PIN reservation status:',
        reservation
      )

      return jsonResponse({
        error: 'Unable to start PIN verification. Please try again.',
      }, 500)
    }

    // Release only this user's matching reservation token.
    const abortReservation = async () => {
      const { error } = await adminClient.rpc(
        'abort_pin_verification',
        {
          p_user_id: user.id,
          p_token: reservationToken,
        }
      )

      if (error) {
        console.error(
          'Could not release PIN reservation:',
          error.message
        )
      }
    }

    // =========================
    // LOAD STORED PIN HASH
    // =========================

    const {
      data: storedPin,
      error: storedPinError,
    } = await adminClient
      .from('transaction_pins')
      .select('pin_hash, pin_salt')
      .eq('user_id', user.id)
      .maybeSingle()

    if (storedPinError || !storedPin) {
      console.error(
        'Stored PIN lookup failed:',
        storedPinError?.message
      )

      await abortReservation()

      return jsonResponse({
        error: 'Unable to verify your transaction PIN. Please try again.',
      }, 500)
    }

    // =========================
    // VERIFY PIN HASH
    // =========================

    let pinIsCorrect = false

    try {
      const derivedHash = await hashPin(
        pin,
        fromHex(storedPin.pin_salt)
      )

      pinIsCorrect = constantTimeEqual(
        derivedHash,
        fromHex(storedPin.pin_hash)
      )
    } catch (error) {
      console.error(
        'PIN hash verification failed:',
        error
      )

      await abortReservation()

      return jsonResponse({
        error: 'Unable to verify your transaction PIN. Please try again.',
      }, 500)
    }

    // =========================
    // RECORD VERIFICATION RESULT
    // =========================

    const {
      data: finishResult,
      error: finishPinError,
    } = await adminClient.rpc(
      'finish_pin_verification',
      {
        p_user_id: user.id,
        p_token: reservationToken,
        p_success: pinIsCorrect,
      }
    )

    if (finishPinError) {
      console.error(
        'PIN verification completion failed:',
        finishPinError.message
      )

      await abortReservation()

      return jsonResponse({
        error: 'Unable to complete PIN verification. Please try again.',
      }, 500)
    }

    const finishStatus =
      finishResult?.status as string | undefined

    if (finishStatus === 'reservation_invalid') {
      return jsonResponse({
        error: 'PIN verification expired. Please enter your PIN again.',
      }, 409)
    }

    if (finishStatus === 'pin_not_set') {
      return jsonResponse({
        error: 'Please set your transaction PIN before making a transfer.',
      }, 400)
    }

    if (finishStatus === 'incorrect_pin') {
      const attempts = Number(
        finishResult?.failed_attempts ?? 0
      )

      return jsonResponse({
        error: attempts >= 5
          ? 'Your transaction PIN is now locked for 15 minutes.'
          : 'Incorrect transaction PIN.',
      }, attempts >= 5 ? 423 : 401)
    }

    if (finishStatus !== 'verified') {
      console.error(
        'Unexpected PIN verification result:',
        finishResult
      )

      return jsonResponse({
        error: 'Unable to confirm your transaction PIN. Please try again.',
      }, 500)
    }

    // =========================
    // GENERATE STABLE REFERENCE
    // =========================

    /*
      The reference is derived from the authenticated user
      and the client-generated idempotency key.

      Retrying the same request produces the same reference.
      A different user cannot use another user's reference.
    */

    const reference =
      `TRF-${user.id.slice(0, 8)}-${idempotencyKey.replaceAll('-', '')}`

    // =========================
    // EXECUTE TRANSFER
    // =========================

    const {
      data,
      error,
    } = await adminClient.rpc(
      'execute_wallet_transfer',
      {
        p_sender_id: user.id,
        p_receiver_account_number: receiverAccountNumber,
        p_amount: amount,
        p_reference: reference,
      }
    )

    if (error) {
      console.error(
        'Transfer RPC error:',
        error
      )

      return jsonResponse({
        error: error.message || 'Transfer failed.',
      }, 400)
    }

    if (!data?.success) {
      console.error(
        'Unexpected transfer RPC response:',
        data
      )

      return jsonResponse({
        error: 'The transfer could not be confirmed. Please contact support if your wallet was debited.',
      }, 500)
    }

    // =========================
    // DUPLICATE REQUEST CHECK
    // =========================

    const isDuplicate =
      data.duplicate === true

    /*
      If SQL confirms that this exact transfer was
      already completed, do not create notifications again.
    */

    if (!isDuplicate) {
      // =========================
      // NOTIFICATIONS
      // =========================

      const formattedAmount =
        new Intl.NumberFormat('en-NG', {
          style: 'currency',
          currency: 'NGN',
          minimumFractionDigits: 2,
        }).format(amount)

      const [
        {
          data: senderProfile,
          error: senderProfileError,
        },
        {
          data: receiverProfile,
          error: receiverProfileError,
        },
      ] = await Promise.all([
        adminClient
          .from('profiles')
          .select('full_name, account_number')
          .eq('id', user.id)
          .maybeSingle(),

        adminClient
          .from('profiles')
          .select('id, full_name, account_number')
          .eq(
            'account_number',
            receiverAccountNumber
          )
          .maybeSingle(),
      ])

      if (senderProfileError) {
        console.error(
          'Could not load sender profile:',
          senderProfileError.message
        )
      }

      if (receiverProfileError) {
        console.error(
          'Could not load receiver profile:',
          receiverProfileError.message
        )
      }

      const receiverName =
        receiverProfile?.full_name ||
        'your recipient'

      const senderName =
        senderProfile?.full_name ||
        'A MufasirPay user'

      await createNotification({
        user_id: user.id,
        title: 'Transfer successful',
        message:
          `You sent ${formattedAmount} to ${receiverName} ` +
          `(${receiverAccountNumber}).`,
        category: 'transfer',
        status: 'success',
        reference,
      })

      if (
        receiverProfile?.id &&
        receiverProfile.id !== user.id
      ) {
        await createNotification({
          user_id: receiverProfile.id,
          title: 'Money received',
          message:
            `You received ${formattedAmount} from ${senderName}.`,
          category: 'transfer',
          status: 'success',
          reference,
        })
      }
    }

    // =========================
    // SUCCESS RESPONSE
    // =========================

    return jsonResponse({
      success: true,
      duplicate: isDuplicate,
      reference,
      amount,
      balance: data.balance ?? 0,
      message: isDuplicate
        ? 'This transfer was already completed.'
        : 'Transfer successful.',
    })

  } catch (error) {
    console.error(
      'Transfer error:',
      error
    )

    return jsonResponse({
      error:
        error instanceof Error
          ? error.message
          : 'Server error.',
    }, 500)
  }
})
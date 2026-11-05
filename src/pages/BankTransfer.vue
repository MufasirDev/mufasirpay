<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

function goToDashboard() {
  router.push('/dashboard')
}
import { supabase } from '../lib/supabase'

interface Bank {
  name: string
  code: string
  slug?: string | null
}

interface VerifiedAccount {
  account_number: string
  bank_code: string
  account_name: string
}

interface TransferAttempt {
  idempotencyKey: string
  fingerprint: string
}

interface BankTransfer {
  reference?: string
  status?: string
  amount?: number
  recipient_name?: string
  account_number?: string
  bank_name?: string
  failure_reason?: string | null
}

const banks = ref<Bank[]>([])
const selectedBankCode = ref('')
const accountNumber = ref('')
const amount = ref<number | null>(null)

const loadingBanks = ref(false)
const verifyingAccount = ref(false)
const submittingTransfer = ref(false)
const checkingTransfer = ref(false)
const showSummary = ref(false)

const verifiedAccount = ref<VerifiedAccount | null>(null)
const transactionPin = ref('')

const errorMessage = ref('')
const successMessage = ref('')

const transferReference = ref('')
const transferStatus = ref('')
const transferMessage = ref('')

const MIN_TRANSFER = 100
const ATTEMPT_STORAGE_KEY = 'mufasirpay_bank_transfer_attempt'

const transferIsPending = computed(() =>
  ['pending', 'processing', 'queued', 'otp'].includes(
    transferStatus.value.toLowerCase(),
  ),
)

const transferIsSuccessful = computed(() =>
  transferStatus.value.toLowerCase() === 'success' ||
  transferStatus.value.toLowerCase() === 'successful',
)

const transferIsFailed = computed(() =>
  ['failed', 'reversed'].includes(transferStatus.value.toLowerCase()),
)

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 2,
  }).format(value)

const selectedBank = computed(() =>
  banks.value.find(bank => bank.code === selectedBankCode.value),
)

const formattedAmount = computed(() =>
  amount.value ? formatCurrency(amount.value) : '₦0.00',
)

const canVerify = computed(() =>
  !!selectedBankCode.value &&
  /^\d{10}$/.test(accountNumber.value) &&
  !verifyingAccount.value &&
  !transferIsPending.value,
)

const canContinue = computed(() =>
  !!verifiedAccount.value &&
  amount.value !== null &&
  Number.isFinite(amount.value) &&
  amount.value >= MIN_TRANSFER &&
  !showSummary.value &&
  !transferIsPending.value &&
  !transferIsSuccessful.value,
)

const canSubmitTransfer = computed(() =>
  !!verifiedAccount.value &&
  amount.value !== null &&
  Number.isFinite(amount.value) &&
  amount.value >= MIN_TRANSFER &&
  /^\d{6}$/.test(transactionPin.value) &&
  !submittingTransfer.value &&
  !transferIsPending.value &&
  !transferIsSuccessful.value,
)

function clearMessages() {
  errorMessage.value = ''
  successMessage.value = ''
}

function getFingerprint() {
  return [
    verifiedAccount.value?.account_number ?? '',
    verifiedAccount.value?.bank_code ?? '',
    Number(amount.value ?? 0).toFixed(2),
  ].join('|')
}

function getOrCreateAttempt(): TransferAttempt {
  const fingerprint = getFingerprint()

  try {
    const saved = sessionStorage.getItem(ATTEMPT_STORAGE_KEY)

    if (saved) {
      const parsed = JSON.parse(saved) as TransferAttempt

      if (
        parsed.fingerprint === fingerprint &&
        parsed.idempotencyKey
      ) {
        return parsed
      }
    }
  } catch (error) {
    console.warn('Could not read saved transfer attempt:', error)
  }

  const attempt: TransferAttempt = {
    idempotencyKey: crypto.randomUUID(),
    fingerprint,
  }

  sessionStorage.setItem(
    ATTEMPT_STORAGE_KEY,
    JSON.stringify(attempt),
  )

  return attempt
}

function clearSavedAttempt() {
  sessionStorage.removeItem(ATTEMPT_STORAGE_KEY)
}

function resetTransferState() {
  transferReference.value = ''
  transferStatus.value = ''
  transferMessage.value = ''
  clearSavedAttempt()
}

function resetVerification() {
  if (transferIsPending.value || transferIsSuccessful.value) return

  verifiedAccount.value = null
  showSummary.value = false
  transactionPin.value = ''
  resetTransferState()
  clearMessages()
}

async function loadBanks() {
  loadingBanks.value = true
  clearMessages()

  try {
    const { data, error } = await supabase.functions.invoke(
      'bank-transfer',
      {
        body: {
          action: 'list_banks',
        },
      },
    )

    if (error) throw error

    if (!data?.success || !Array.isArray(data.banks)) {
      throw new Error(data?.error || 'Unable to retrieve banks.')
    }

    banks.value = data.banks
  } catch (error) {
    console.error('Bank loading failed:', error)

    errorMessage.value =
      error instanceof Error
        ? error.message
        : 'Unable to load banks. Please try again.'
  } finally {
    loadingBanks.value = false
  }
}

async function verifyAccount() {
  clearMessages()

  if (transferIsPending.value || transferIsSuccessful.value) return

  verifiedAccount.value = null
  showSummary.value = false
  transactionPin.value = ''
  resetTransferState()

  if (!selectedBankCode.value) {
    errorMessage.value = 'Please select a bank.'
    return
  }

  if (!/^\d{10}$/.test(accountNumber.value)) {
    errorMessage.value = 'Enter a valid 10-digit account number.'
    return
  }

  verifyingAccount.value = true

  try {
    const { data, error } = await supabase.functions.invoke(
      'bank-transfer',
      {
        body: {
          action: 'resolve_account',
          account_number: accountNumber.value,
          bank_code: selectedBankCode.value,
        },
      },
    )

    if (error) throw error

    if (!data?.success || !data?.account?.account_name) {
      throw new Error(
        data?.error || 'We could not verify this bank account.',
      )
    }

    verifiedAccount.value = data.account
    successMessage.value = 'Account successfully verified.'
  } catch (error) {
    console.error('Account verification failed:', error)

    errorMessage.value =
      error instanceof Error
        ? error.message
        : 'Account verification failed. Please try again.'
  } finally {
    verifyingAccount.value = false
  }
}

function continueToSummary() {
  clearMessages()
  transactionPin.value = ''

  if (!verifiedAccount.value) {
    errorMessage.value = 'Please verify the recipient account first.'
    return
  }

  if (
    amount.value === null ||
    !Number.isFinite(amount.value) ||
    amount.value < MIN_TRANSFER
  ) {
    errorMessage.value = 'The minimum transfer amount is ₦100.'
    return
  }

  showSummary.value = true
}

function editTransfer() {
  if (transferIsPending.value || transferIsSuccessful.value) return

  showSummary.value = false
  transactionPin.value = ''
  clearMessages()
}

function getTransferFromResponse(data: any): BankTransfer | null {
  return (
    data?.transfer ??
    data?.data?.transfer ??
    data?.data ??
    null
  )
}

function applyTransferResponse(data: any) {
  const transfer = getTransferFromResponse(data)

  const reference =
    transfer?.reference ??
    data?.reference ??
    data?.transfer_reference

  const status =
    transfer?.status ??
    data?.status ??
    ''

  if (reference) {
    transferReference.value = String(reference)
  }

  if (status) {
    transferStatus.value = String(status).toLowerCase()
  }

  if (transferIsSuccessful.value) {
    transferMessage.value = 'Your bank transfer was successful.'
    successMessage.value = transferMessage.value
    clearSavedAttempt()
    transactionPin.value = ''
    return
  }

  if (transferIsFailed.value) {
    transferMessage.value =
      transfer?.failure_reason ||
      data?.error ||
      'The bank transfer failed. Check your transaction history.'

    errorMessage.value = transferMessage.value
    clearSavedAttempt()
    transactionPin.value = ''
    return
  }

  if (transferIsPending.value) {
    transferMessage.value =
      'Your transfer is being processed. Do not submit it again. Check the status using the button below.'
    transactionPin.value = ''
    return
  }

  if (data?.success === true && reference) {
    transferMessage.value =
      'Your transfer request has been received. Check its status before trying again.'
    transferStatus.value = 'processing'
  }
}

async function submitTransfer() {
  clearMessages()

  if (submittingTransfer.value) return

  if (transferIsPending.value || transferIsSuccessful.value) {
    errorMessage.value =
      'This transfer already has a status. Check it before making another transfer.'
    return
  }

  if (!verifiedAccount.value) {
    errorMessage.value = 'Please verify the recipient account first.'
    return
  }

  if (
    amount.value === null ||
    !Number.isFinite(amount.value) ||
    amount.value < MIN_TRANSFER
  ) {
    errorMessage.value = 'The minimum transfer amount is ₦100.'
    return
  }

  if (!Number.isInteger(amount.value)) {
    errorMessage.value = 'Enter a whole-number amount in naira.'
    return
  }

  if (!/^\d{6}$/.test(transactionPin.value)) {
    errorMessage.value = 'Enter your valid 6-digit transaction PIN.'
    return
  }

  submittingTransfer.value = true

  try {
    const attempt = getOrCreateAttempt()

    const { data, error } = await supabase.functions.invoke(
      'bank-transfer',
      {
        body: {
          action: 'submit_transfer',
          account_number: verifiedAccount.value.account_number,
          bank_code: verifiedAccount.value.bank_code,
          bank_name: selectedBank.value?.name ?? '',
          amount: amount.value,
          pin: transactionPin.value,
          idempotency_key: attempt.idempotencyKey,
        },
      },
    )

    // The request may have reached the server even if the client
    // received a network error. Keep the same idempotency key.
    if (error) {
      console.error('Transfer request error:', error)

      errorMessage.value =
        'We could not confirm the transfer response. Do not create another transfer. Retry this same request or check your transfer status.'

      return
    }

    if (!data?.success) {
      const transfer = getTransferFromResponse(data)

      if (transfer?.reference || transfer?.status) {
        applyTransferResponse(data)
        return
      }

      errorMessage.value =
        data?.error || 'We could not submit your transfer.'
      return
    }

    applyTransferResponse(data)

    if (!transferReference.value) {
      errorMessage.value =
        'The server responded, but no transfer reference was returned. Contact support before trying again.'
    }
  } catch (error) {
    console.error('Transfer submission failed:', error)

    errorMessage.value =
      'We could not confirm the transfer response. Keep this page open and do not submit a different transfer.'
  } finally {
    submittingTransfer.value = false
  }
}

async function checkTransferStatus() {
  clearMessages()

  if (!transferReference.value) {
    errorMessage.value = 'No transfer reference is available to check.'
    return
  }

  if (checkingTransfer.value) return

  checkingTransfer.value = true

  try {
    const { data, error } = await supabase.functions.invoke(
      'bank-transfer',
      {
        body: {
          action: 'verify_transfer',
          reference: transferReference.value,
        },
      },
    )

    if (error) throw error

    if (!data?.success) {
      throw new Error(
        data?.error || 'Unable to check transfer status.',
      )
    }

    applyTransferResponse(data)

    if (!transferIsSuccessful.value && !transferIsFailed.value) {
      transferMessage.value =
        'The transfer is still being processed. Check again shortly.'
    }
  } catch (error) {
    console.error('Transfer status check failed:', error)

    errorMessage.value =
      error instanceof Error
        ? error.message
        : 'Unable to check transfer status. Please try again.'
  } finally {
    checkingTransfer.value = false
  }
}

onMounted(() => {
  loadBanks()
})
</script>



<template>
  <div class="bank-transfer-page">
    <div class="page-header">
  <div>
    <span class="eyebrow">PAYMENTS</span>
    <h1>Bank Transfer</h1>
    <p>Send money directly to any Nigerian bank account.</p>
  </div>

  <div class="header-actions">
    <button
      type="button"
      class="back-dashboard-button"
      @click="goToDashboard"
    >
      ← Back to Dashboard
    </button>

    <div class="header-icon">
      <span>↗</span>
    </div>
  </div>
</div>

    <div class="transfer-layout">
      <section class="transfer-card">
        <div class="card-heading">
          <div>
            <h2>Recipient Details</h2>
            <p>Enter the bank details of the person you're paying.</p>
          </div>
          <span class="step-number">01</span>
        </div>

        <div v-if="loadingBanks" class="loading-box">
          <span class="spinner"></span>
          <span>Loading Nigerian banks...</span>
        </div>

        <template v-else>
          <div class="form-group">
            <label for="bank">Select Bank</label>
            <select
              id="bank"
              v-model="selectedBankCode"
              @change="resetVerification"
            >
              <option value="" disabled>Select recipient's bank</option>
              <option
                v-for="bank in banks"
                :key="bank.code"
                :value="bank.code"
              >
                {{ bank.name }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label for="account">Account Number</label>
            <input
              id="account"
              v-model="accountNumber"
              type="text"
              inputmode="numeric"
              maxlength="10"
              placeholder="Enter 10-digit account number"
              autocomplete="off"
              @input="
                accountNumber = accountNumber.replace(/\D/g, '').slice(0, 10);
                resetVerification()
              "
            />
            <small>Enter the recipient's 10-digit bank account number.</small>
          </div>

          <button
            class="verify-button"
            type="button"
            :disabled="!canVerify"
            @click="verifyAccount"
          >
            <span v-if="verifyingAccount" class="spinner"></span>
            {{ verifyingAccount ? 'Verifying account...' : 'Verify Account' }}
          </button>
        </template>

        <div v-if="verifiedAccount" class="verified-box">
          <div class="verified-icon">✓</div>
          <div>
            <span class="verified-label">ACCOUNT VERIFIED</span>
            <h3>{{ verifiedAccount.account_name }}</h3>
            <p>{{ verifiedAccount.account_number }}</p>
            <p>{{ selectedBank?.name }}</p>
          </div>
        </div>

        <div v-if="successMessage" class="success-message">
          ✓ {{ successMessage }}
        </div>

        <div v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>

        <div class="divider"></div>

        <div class="card-heading amount-heading">
          <div>
            <h2>Transfer Amount</h2>
            <p>How much would you like to send?</p>
          </div>
          <span class="step-number">02</span>
        </div>

        <div class="form-group">
          <label for="amount">Amount (NGN)</label>
          <div class="amount-input">
            <span>₦</span>
            <input
              id="amount"
              v-model.number="amount"
              type="number"
              min="100"
              step="1"
              placeholder="0.00"
              @input="
                showSummary = false;
                transactionPin = ''
              "
            />
          </div>
          <small>Minimum transfer amount: ₦100.</small>
        </div>

        <div class="quick-amounts">
          <button
            v-for="value in [500, 1000, 2000, 5000]"
            :key="value"
            type="button"
            @click="
              amount = value;
              showSummary = false;
              transactionPin = '';
              clearMessages()
            "
          >
            ₦{{ value.toLocaleString('en-NG') }}
          </button>
        </div>

        <button
          class="continue-button"
          type="button"
          :disabled="!canContinue"
          @click="continueToSummary"
        >
          Continue
          <span>→</span>
        </button>

        <p class="security-note">
          🔒 Your recipient's account details are verified securely.
        </p>
      </section>

      <aside class="side-panel">
        <div class="side-card">
          <div class="side-icon">🏦</div>
          <h3>Send to any bank</h3>
          <p>
            Transfer to supported Nigerian banks using verified recipient
            details.
          </p>
        </div>

        <div class="side-card">
          <div class="side-icon">🛡️</div>
          <h3>Account verification</h3>
          <p>
            We check the recipient's account details before preparing your
            transfer.
          </p>
        </div>

        <div class="side-card summary-card" v-if="showSummary">
          <span class="eyebrow">TRANSFER SUMMARY</span>
          <h3>Review your transfer</h3>

          <div class="summary-row">
            <span>Recipient</span>
            <strong>{{ verifiedAccount?.account_name }}</strong>
          </div>

          <div class="summary-row">
            <span>Account Number</span>
            <strong>{{ verifiedAccount?.account_number }}</strong>
          </div>

          <div class="summary-row">
            <span>Bank</span>
            <strong>{{ selectedBank?.name }}</strong>
          </div>

          <div class="summary-row">
            <span>Amount</span>
            <strong>{{ formattedAmount }}</strong>
          </div>

          <div class="summary-total">
            <span>Transfer amount</span>
            <strong>{{ formattedAmount }}</strong>
          </div>

          <!-- Transfer status -->
          <div v-if="transferMessage" class="transfer-status-message">
            <strong>
              {{
                transferIsSuccessful
                  ? 'Transfer successful'
                  : transferIsFailed
                    ? 'Transfer failed'
                    : 'Transfer processing'
              }}
            </strong>
            <p>{{ transferMessage }}</p>
          </div>

          <!-- Transfer reference -->
          <div v-if="transferReference" class="summary-row">
            <span>Transfer Reference</span>
            <strong>{{ transferReference }}</strong>
          </div>

          <!-- PIN input -->
          <div
            class="pin-section"
            v-if="!transferIsPending && !transferIsSuccessful"
          >
            <label for="transaction-pin">Transaction PIN</label>
            <input
              id="transaction-pin"
              v-model="transactionPin"
              type="password"
              inputmode="numeric"
              maxlength="6"
              autocomplete="off"
              placeholder="Enter your 6-digit PIN"
              @input="
                transactionPin = transactionPin.replace(/\D/g, '').slice(0, 6);
                clearMessages()
              "
            />
            <small>
              Enter your MufasirPay transaction PIN to authorize this transfer.
            </small>
          </div>

          <!-- Submit transfer -->
          <button
            v-if="!transferIsPending && !transferIsSuccessful"
            class="send-transfer-button"
            type="button"
            :disabled="!canSubmitTransfer"
            @click="submitTransfer"
          >
            <span v-if="submittingTransfer" class="spinner"></span>
            {{ submittingTransfer ? 'Submitting...' : 'Confirm & Send' }}
          </button>

          <!-- Check transfer status -->
          <button
            v-if="transferReference && !transferIsSuccessful && !transferIsFailed"
            class="send-transfer-button"
            type="button"
            :disabled="checkingTransfer"
            @click="checkTransferStatus"
          >
            <span v-if="checkingTransfer" class="spinner"></span>
            {{ checkingTransfer ? 'Checking...' : 'Check Transfer Status' }}
          </button>

          <p class="summary-notice" v-if="!transferIsSuccessful">
            Do not submit another transfer while this request is processing.
          </p>

          <button
            v-if="!transferIsPending && !transferIsSuccessful"
            class="edit-button"
            type="button"
            @click="editTransfer"
          >
            Edit details
          </button>
        </div>
      </aside>
    </div>
  </div>
</template>


<style scoped>
.bank-transfer-page {
  --mp-green: #16a34a;
  --mp-green-dark: #15803d;
  --mp-green-light: #f0fdf4;
  --mp-green-border: #bbf7d0;
  --mp-text: #172033;
  --mp-muted: #8992a5;

  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 28px;
  color: var(--mp-text);
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 30px;
}

.eyebrow {
  color: var(--mp-green);
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 1.5px;
}

.page-header h1 {
  margin: 8px 0;
  font-size: 30px;
  font-weight: 800;
}

.page-header p,
.card-heading p {
  margin: 0;
  color: var(--mp-muted);
  font-size: 14px;
}

.header-icon {
  width: 55px;
  height: 55px;
  display: grid;
  place-items: center;
  border-radius: 16px;
  background: var(--mp-green-light);
  color: var(--mp-green);
  font-size: 28px;
  font-weight: 800;
}

.transfer-layout {
  display: grid;
  grid-template-columns: minmax(0, 1.6fr) minmax(260px, 0.9fr);
  gap: 24px;
  align-items: start;
}

.transfer-card,
.side-card {
  background: #fff;
  border: 1px solid #edf0f5;
  border-radius: 18px;
  box-shadow: 0 8px 30px rgba(25, 45, 90, 0.04);
}

.transfer-card {
  padding: 28px;
}

.card-heading {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
}

.card-heading h2 {
  margin: 0 0 7px;
  font-size: 18px;
  font-weight: 750;
}

.step-number {
  width: 34px;
  height: 34px;
  display: grid;
  place-items: center;
  border-radius: 10px;
  background: var(--mp-green-light);
  color: var(--mp-green-dark);
  font-size: 13px;
  font-weight: 800;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 9px;
  color: #354057;
  font-size: 13px;
  font-weight: 700;
}

.form-group select,
.form-group input {
  width: 100%;
  height: 52px;
  padding: 0 15px;
  border: 1px solid #e4e8f0;
  border-radius: 11px;
  outline: none;
  background: #fff;
  color: var(--mp-text);
  font-size: 14px;
  transition: border 0.2s, box-shadow 0.2s;
}

.form-group select:focus,
.form-group input:focus {
  border-color: var(--mp-green);
  box-shadow: 0 0 0 3px rgba(22, 163, 74, 0.09);
}

.form-group small {
  display: block;
  margin-top: 8px;
  color: #98a0af;
  font-size: 11px;
}

.verify-button,
.continue-button {
  width: 100%;
  min-height: 50px;
  border: none;
  border-radius: 11px;
  background: var(--mp-green);
  color: white;
  font-size: 14px;
  font-weight: 750;
  cursor: pointer;
  transition: 0.2s;
}

.verify-button:hover,
.continue-button:hover {
  background: var(--mp-green-dark);
}

.verify-button:disabled,
.continue-button:disabled {
  background: #a7d9b5;
  cursor: not-allowed;
}

.verified-box {
  display: flex;
  gap: 14px;
  align-items: center;
  margin-top: 20px;
  padding: 17px;
  border: 1px solid var(--mp-green-border);
  border-radius: 12px;
  background: var(--mp-green-light);
}

.verified-icon {
  width: 38px;
  height: 38px;
  display: grid;
  flex-shrink: 0;
  place-items: center;
  border-radius: 50%;
  background: #dcfce7;
  color: var(--mp-green-dark);
  font-size: 20px;
  font-weight: 900;
}

.verified-label {
  color: var(--mp-green-dark);
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 1px;
}

.verified-box h3 {
  margin: 5px 0;
  font-size: 15px;
}

.verified-box p {
  margin: 3px 0;
  color: #69768b;
  font-size: 12px;
}

.success-message,
.error-message {
  margin-top: 15px;
  padding: 12px;
  border-radius: 9px;
  font-size: 13px;
}

.success-message {
  background: var(--mp-green-light);
  color: var(--mp-green-dark);
}

.error-message {
  background: #fff1f1;
  color: #c33c3c;
}

.divider {
  height: 1px;
  margin: 28px 0;
  background: #edf0f5;
}

.amount-heading {
  margin-bottom: 22px;
}

.amount-input {
  display: flex;
  align-items: center;
  height: 58px;
  padding: 0 15px;
  border: 1px solid #e4e8f0;
  border-radius: 11px;
  transition: border 0.2s, box-shadow 0.2s;
}

.amount-input:focus-within {
  border-color: var(--mp-green);
  box-shadow: 0 0 0 3px rgba(22, 163, 74, 0.09);
}

.amount-input span {
  color: var(--mp-green);
  font-size: 20px;
  font-weight: 800;
}

.amount-input input {
  height: 100%;
  border: none;
  font-size: 20px;
  font-weight: 750;
}

.amount-input input:focus {
  outline: none;
  box-shadow: none;
}

.quick-amounts {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 9px;
  margin-bottom: 23px;
}

.quick-amounts button {
  padding: 11px 5px;
  border: 1px solid #e4e8f0;
  border-radius: 9px;
  background: #fff;
  color: #47536a;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: 0.2s;
}

.quick-amounts button:hover {
  border-color: var(--mp-green);
  background: var(--mp-green-light);
  color: var(--mp-green-dark);
}

.continue-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  font-size: 15px;
}

.continue-button span {
  font-size: 20px;
}

.security-note {
  margin: 16px 0 0;
  color: #929bad;
  font-size: 11px;
  text-align: center;
}

.side-panel {
  display: grid;
  gap: 16px;
}

.side-card {
  padding: 22px;
}

.side-icon {
  width: 43px;
  height: 43px;
  display: grid;
  place-items: center;
  border-radius: 12px;
  background: var(--mp-green-light);
  font-size: 21px;
}

.side-card h3 {
  margin: 15px 0 8px;
  font-size: 15px;
}

.side-card p {
  margin: 0;
  color: var(--mp-muted);
  font-size: 12px;
  line-height: 1.7;
}

.summary-card {
  border-color: var(--mp-green-border);
}

.summary-card .eyebrow {
  font-size: 10px;
}

.summary-card h3 {
  margin: 10px 0 20px;
  font-size: 18px;
}

.summary-row,
.summary-total {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 12px 0;
  border-bottom: 1px solid #edf0f5;
}

.summary-row span,
.summary-total span {
  color: var(--mp-muted);
  font-size: 11px;
}

.summary-row strong,
.summary-total strong {
  overflow-wrap: anywhere;
  font-size: 13px;
}

.summary-total strong {
  color: var(--mp-green-dark);
  font-size: 19px;
}

.pin-section {
  margin-top: 22px;
}

.pin-section label {
  display: block;
  margin-bottom: 9px;
  color: #354057;
  font-size: 13px;
  font-weight: 700;
}

.pin-section input {
  width: 100%;
  height: 52px;
  padding: 0 15px;
  border: 1px solid #e4e8f0;
  border-radius: 11px;
  outline: none;
  background: #fff;
  color: var(--mp-text);
  font-size: 18px;
  letter-spacing: 6px;
  transition: border 0.2s, box-shadow 0.2s;
}

.pin-section input:focus {
  border-color: var(--mp-green);
  box-shadow: 0 0 0 3px rgba(22, 163, 74, 0.09);
}

.pin-section small {
  display: block;
  margin-top: 8px;
  color: var(--mp-muted);
  font-size: 11px;
  line-height: 1.6;
}

.send-transfer-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
  min-height: 50px;
  margin-top: 18px;
  border: none;
  border-radius: 11px;
  background: var(--mp-green);
  color: white;
  font-size: 14px;
  font-weight: 750;
  cursor: pointer;
  transition: 0.2s;
}

.send-transfer-button:hover:not(:disabled) {
  background: var(--mp-green-dark);
}

.send-transfer-button:disabled {
  background: #a7d9b5;
  cursor: not-allowed;
}

.summary-notice {
  margin: 15px 0 !important;
  color: #b16c18 !important;
}

.edit-button {
  width: 100%;
  padding: 12px;
  border: 1px solid var(--mp-green-border);
  border-radius: 9px;
  background: var(--mp-green-light);
  color: var(--mp-green-dark);
  font-weight: 700;
  cursor: pointer;
  transition: 0.2s;
}

.edit-button:hover {
  background: #dcfce7;
}

.loading-box {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px 0;
  color: var(--mp-muted);
  font-size: 13px;
}

.spinner {
  display: inline-block;
  width: 17px;
  height: 17px;
  border: 2px solid rgba(255, 255, 255, 0.4);
  border-top-color: currentColor;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

.loading-box .spinner {
  border-color: var(--mp-green-border);
  border-top-color: var(--mp-green);
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 850px) {
  .transfer-layout {
    grid-template-columns: 1fr;
  }

  .side-panel {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .summary-card {
    grid-column: 1 / -1;
  }
}

@media (max-width: 560px) {
  .bank-transfer-page {
    padding: 17px;
  }

  .page-header h1 {
    font-size: 25px;
  }

  .transfer-card {
    padding: 19px;
  }

  .side-panel {
    grid-template-columns: 1fr;
  }

  .summary-card {
    grid-column: auto;
  }

  .quick-amounts {
    grid-template-columns: repeat(2, 1fr);
  }
}

.transfer-status-message {
  margin-top: 18px;
  padding: 14px;
  border: 1px solid #bbf7d0;
  border-radius: 11px;
  background: #f0fdf4;
  color: #166534;
}

.transfer-status-message strong {
  display: block;
  margin-bottom: 6px;
  font-size: 13px;
}

.transfer-status-message p {
  margin: 0;
  font-size: 12px;
  line-height: 1.6;
  overflow-wrap: anywhere;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 14px;
}

.back-dashboard-button {
  padding: 12px 18px;
  border: 1px solid #bbf7d0;
  border-radius: 10px;
  background: #f0fdf4;
  color: #15803d;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: 0.2s ease;
}

.back-dashboard-button:hover {
  background: #dcfce7;
}

@media (max-width: 560px) {
  .header-actions {
    flex-direction: column-reverse;
    align-items: flex-end;
    gap: 10px;
  }

  .back-dashboard-button {
    padding: 10px 12px;
    font-size: 11px;
  }
}
</style>

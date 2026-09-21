<template>
  <div class="bills-page">

    <!-- SIDEBAR -->
    <aside
      class="sidebar"
      :class="{ open: sidebarOpen }"
    >
      <div class="sidebar-brand">
        <div class="brand-icon">M</div>

        <div>
          <h1>MufasirPay</h1>
          <span>Digital Banking</span>
        </div>
      </div>

      <nav class="sidebar-nav">

        <button
          class="nav-item"
          type="button"
          @click="go('/dashboard')"
        >
          <span class="nav-icon">⌂</span>
          <span>Dashboard</span>
        </button>

        <button
          class="nav-item"
          type="button"
          @click="go('/wallet')"
        >
          <span class="nav-icon">₦</span>
          <span>Wallet</span>
        </button>

        <button
          class="nav-item"
          type="button"
          @click="go('/transfer')"
        >
          <span class="nav-icon">⇄</span>
          <span>Transfer</span>
        </button>

        <button
          class="nav-item"
          type="button"
          @click="go('/airtime')"
        >
          <span class="nav-icon">☎</span>
          <span>Airtime & Data</span>
        </button>

        <button
          class="nav-item active"
          type="button"
        >
          <span class="nav-icon">▣</span>
          <span>Pay Bills</span>
        </button>

        <button
          class="nav-item"
          type="button"
          @click="go('/transactions')"
        >
          <span class="nav-icon">☷</span>
          <span>Transactions</span>
        </button>

        <button
          class="nav-item"
          type="button"
          @click="go('/profile')"
        >
          <span class="nav-icon">◉</span>
          <span>Profile</span>
        </button>

      </nav>

      <div class="sidebar-bottom">
        <button
          class="logout-side-btn"
          type="button"
          @click="logout"
        >
          <span class="nav-icon">↪</span>
          <span>Logout</span>
        </button>
      </div>
    </aside>

    <!-- MOBILE OVERLAY -->
    <div
      v-if="sidebarOpen"
      class="overlay"
      @click="sidebarOpen = false"
    ></div>

    <!-- MOBILE MENU -->
    <button
      type="button"
      class="menu-btn"
      @click="sidebarOpen = !sidebarOpen"
    >
      ☰
    </button>

    <!-- MAIN -->
    <div class="main-area">

      <!-- TOPBAR -->
      <header class="topbar">

        <div class="topbar-title">
          <h2>Pay Bills</h2>

          <p>
            Pay your bills directly from your wallet
          </p>
        </div>

        <div class="topbar-user">

          <div class="top-avatar">
            {{ initials }}
          </div>

          <div class="top-user-info">
            <strong>
              {{ fullName || 'User' }}
            </strong>

            <span>
              {{ email }}
            </span>
          </div>

        </div>

      </header>


      <main class="content">

        <!-- BALANCE -->
        <section class="balance-card">

          <div>
            <p>Available Balance</p>

            <h1>
              ₦{{ formattedBalance }}
            </h1>
          </div>

          <div class="wallet-icon">
            ₦
          </div>

        </section>


        <!-- INTRO -->
        <section class="intro">

          <h1>
            Bill Payments
          </h1>

          <p>
            Choose the bill you want to pay.
          </p>

        </section>


        <!-- BILL TYPES -->
        <section class="bill-grid">

          <button
            type="button"
            class="bill-card"
            :class="{
              selected:
                selectedBill === 'electricity'
            }"
            @click="
              selectBill('electricity')
            "
          >

            <div
              class="bill-icon electricity"
            >
              ⚡
            </div>

            <div class="bill-info">

              <h3>
                Electricity
              </h3>

              <p>
                AEDC prepaid & postpaid
              </p>

            </div>

            <span class="arrow">
              →
            </span>

          </button>


          <button
            type="button"
            class="bill-card"
            :class="{
              selected:
                selectedBill === 'cable'
            }"
            @click="
              selectBill('cable')
            "
          >

            <div
              class="bill-icon cable"
            >
              ▣
            </div>

            <div class="bill-info">

              <h3>
                Cable TV
              </h3>

              <p>
                DStv & GOtv subscriptions
              </p>

            </div>

            <span class="arrow">
              →
            </span>

          </button>

        </section>


        <!-- PAYMENT FORM -->
        <section
          v-if="selectedBill"
          class="payment-card"
        >

          <div class="payment-header">

            <div>

              <h2>
                {{
                  selectedBill ===
                  'electricity'
                    ? 'Electricity Payment'
                    : 'Cable TV Payment'
                }}
              </h2>

              <p>
                Verify the customer before making payment.
              </p>

            </div>

            <button
              type="button"
              class="change-btn"
              @click="resetForm"
            >
              Change
            </button>

          </div>


          <!-- ELECTRICITY -->
          <template
            v-if="
              selectedBill ===
              'electricity'
            "
          >

            <div class="field">

              <label>
                Electricity Provider
              </label>

              <select
                v-model="provider"
              >

                <option value="">
                  Select electricity provider
                </option>

                <option value="aedc">
                  AEDC - Abuja Electricity
                </option>

              </select>

            </div>


            <div class="field">

              <label>
                Meter Type
              </label>

              <select
                v-model="meterType"
              >

                <option value="">
                  Select meter type
                </option>

                <option value="prepaid">
                  Prepaid
                </option>

                <option value="postpaid">
                  Postpaid
                </option>

              </select>

            </div>

          </template>


          <!-- CABLE -->
          <template v-else>

            <div class="field">

              <label>
                TV Provider
              </label>

              <select
                v-model="provider"
                @change="
                  loadVariations
                "
              >

                <option value="">
                  Select TV provider
                </option>

                <option value="dstv">
                  DStv
                </option>

                <option value="gotv">
                  GOtv
                </option>

              </select>

            </div>


            <div
              v-if="provider"
              class="field"
            >

              <label>
                Subscription Plan
              </label>

              <select
                v-model="variationCode"
              >

                <option value="">
                  Select subscription plan
                </option>

                <option
                  v-for="variation in variations"
                  :key="
                    variation.variation_code
                  "
                  :value="
                    variation.variation_code
                  "
                >
                  {{
                    variation.name
                  }}
                </option>

              </select>

            </div>

          </template>


          <!-- CUSTOMER NUMBER -->
          <div class="field">

            <label>
              {{
                selectedBill ===
                'electricity'
                  ? 'Meter Number'
                  : 'Smartcard / IUC Number'
              }}
            </label>

            <input
              v-model="customerNumber"
              type="text"
              inputmode="numeric"
              :placeholder="
                selectedBill ===
                'electricity'
                  ? 'Enter meter number'
                  : 'Enter smartcard / IUC number'
              "
            />

            <small>
              {{
                selectedBill ===
                'electricity'
                  ? 'Enter the customer meter number.'
                  : 'Enter the customer smartcard/IUC number.'
              }}
            </small>

          </div>


          <!-- PHONE -->
          <div class="field">

            <label>
              Phone Number
            </label>

            <input
              v-model="phone"
              type="tel"
              inputmode="numeric"
              maxlength="11"
              placeholder="08012345678"
              @input="
                phone = phone
                  .replace(/\D/g, '')
                  .slice(0, 11)
              "
            />

          </div>


          <!-- VERIFY -->
          <button
            type="button"
            class="verify-btn"
            :disabled="isVerifying"
            @click="verifyCustomer"
          >
            {{
              isVerifying
                ? 'Verifying...'
                : 'Verify Customer'
            }}
          </button>


          <!-- VERIFIED -->
          <div
            v-if="verifiedCustomer"
            class="verified-card"
          >

            <div class="verified-icon">
              ✓
            </div>

            <div>

              <strong>
                {{
                  verifiedCustomer.Customer_Name ||
                  verifiedCustomer.name ||
                  'Customer Verified'
                }}
              </strong>

              <p>
                Customer verification successful.
              </p>

            </div>

          </div>


          <!-- AMOUNT -->
          <div class="field">

            <label>
              Amount
            </label>

            <div class="amount-input">

              <span>₦</span>

              <input
                v-model.number="amount"
                type="number"
                min="100"
                placeholder="Enter amount"
              />

            </div>

          </div>


          <!-- QUICK AMOUNTS -->
          <div class="field">

            <label>
              Quick Amount
            </label>

            <div class="quick-grid">

              <button
                v-for="option in quickAmounts"
                :key="option"
                type="button"
                :class="{
                  active:
                    amount === option
                }"
                @click="
                  amount = option
                "
              >
                ₦{{ option.toLocaleString('en-NG') }}
              </button>

            </div>

          </div>


          <!-- NOTICE -->
          <div class="notice">

            <span>
              ℹ
            </span>

            <p>
              Your wallet amount is reserved during
              processing. Failed transactions are refunded.
            </p>

          </div>


          <!-- ERROR -->
          <div
            v-if="errorMessage"
            class="message error-message"
          >
            ⚠ {{ errorMessage }}
          </div>


          <!-- SUCCESS -->
          <div
            v-if="successMessage"
            class="message success-message"
          >

            ✓ {{ successMessage }}

            <div
              v-if="token"
              class="token-box"
            >

              <span>
                Electricity Token
              </span>

              <strong>
                {{ token }}
              </strong>

            </div>

          </div>


          <!-- PAY -->
          <button
            type="button"
            class="pay-btn"
            :disabled="
              isProcessing ||
              !verifiedCustomer
            "
            @click="payBill"
          >
            {{
              isProcessing
                ? 'Processing Payment...'
                : 'Pay Bill'
            }}
          </button>

        </section>


        <!-- EMPTY -->
        <section
          v-else
          class="empty-card"
        >

          <div class="empty-icon">
            ▣
          </div>

          <h2>
            Select a bill category
          </h2>

          <p>
            Choose Electricity or Cable TV to get started.
          </p>

        </section>

      </main>

    </div>

  </div>
</template>


<script setup lang="ts">

import {
  computed,
  onMounted,
  ref
} from 'vue'

import {
  useRouter
} from 'vue-router'

import {
  supabase
} from '../lib/supabase'


const router =
  useRouter()


// ----------------------------------
// SIDEBAR
// ----------------------------------

const sidebarOpen =
  ref(false)


function go(path: string) {

  sidebarOpen.value = false

  router.push(path)

}


async function logout() {

  try {

    await supabase.auth.signOut()

    router.push('/login')

  } catch (error) {

    console.error(
      'Logout error:',
      error
    )

  }

}


// ----------------------------------
// USER
// ----------------------------------

const fullName =
  ref('')

const email =
  ref('')

const phone =
  ref('')

const balance =
  ref(0)


// ----------------------------------
// BILL STATE
// ----------------------------------

const selectedBill =
  ref('')

const provider =
  ref('')

const meterType =
  ref('')

const customerNumber =
  ref('')

const variationCode =
  ref('')

const amount =
  ref<number | null>(100)

const variations =
  ref<any[]>([])

const verifiedCustomer =
  ref<any | null>(null)

const token =
  ref('')

const isVerifying =
  ref(false)

const isProcessing =
  ref(false)

const errorMessage =
  ref('')

const successMessage =
  ref('')


// ----------------------------------
// QUICK AMOUNTS
// ----------------------------------

const quickAmounts = [
  500,
  1000,
  2000,
  5000,
  10000,
  20000
]


// ----------------------------------
// FORMATTED BALANCE
// ----------------------------------

const formattedBalance =
  computed(() => {

    return balance.value.toLocaleString(
      'en-NG',
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }
    )

  })


// ----------------------------------
// INITIALS
// ----------------------------------

const initials =
  computed(() => {

    const name =
      fullName.value.trim()

    if (!name) {
      return 'M'
    }

    const parts =
      name.split(/\s+/)

    if (parts.length === 1) {

      return parts[0]
        .charAt(0)
        .toUpperCase()

    }

    return (
      parts[0]
        .charAt(0) +
      parts[parts.length - 1]
        .charAt(0)
    ).toUpperCase()

  })


// ----------------------------------
// LOAD USER
// ----------------------------------

async function loadUser() {

  try {

    const {
      data: {
        session
      }
    } =
      await supabase.auth.getSession()


    if (!session?.user) {

      router.push('/login')

      return

    }


    email.value =
      session.user.email || ''


    const {
      data: profile
    } =
      await supabase
        .from('profiles')
        .select(
          'full_name, phone'
        )
        .eq(
          'id',
          session.user.id
        )
        .single()


    fullName.value =
      profile?.full_name || ''

    phone.value =
      profile?.phone || ''


    const {
      data: wallet
    } =
      await supabase
        .from('wallets')
        .select('balance')
        .eq(
          'user_id',
          session.user.id
        )
        .single()


    balance.value =
      Number(
        wallet?.balance || 0
      )

  } catch (error) {

    console.error(
      'Load user error:',
      error
    )

  }

}


// ----------------------------------
// GET EDGE FUNCTION ERROR
// ----------------------------------

async function getFunctionError(
  error: any
) {

  try {

    if (
      error?.context &&
      typeof error.context.json ===
        'function'
    ) {

      const body =
        await error.context.json()

      return (
        body?.message ||
        body?.error ||
        error?.message ||
        'Request failed.'
      )

    }

  } catch {
    // Use fallback
  }

  return (
    error?.message ||
    'Request failed.'
  )

}


// ----------------------------------
// SET FUNCTION AUTH
// ----------------------------------

async function setFunctionAuth() {

  const {
    data: {
      session
    }
  } =
    await supabase.auth.getSession()


  if (
    !session?.access_token
  ) {

    await supabase.auth.signOut()

    router.push('/login')

    throw new Error(
      'Your session has expired. Please log in again.'
    )

  }


  supabase.functions.setAuth(
    session.access_token
  )

}


// ----------------------------------
// SELECT BILL
// ----------------------------------

function selectBill(
  bill: string
) {

  selectedBill.value =
    bill

  provider.value =
    ''

  meterType.value =
    ''

  customerNumber.value =
    ''

  variationCode.value =
    ''

  variations.value =
    []

  verifiedCustomer.value =
    null

  token.value =
    ''

  errorMessage.value =
    ''

  successMessage.value =
    ''

}


// ----------------------------------
// RESET
// ----------------------------------

function resetForm() {

  selectedBill.value =
    ''

  provider.value =
    ''

  meterType.value =
    ''

  customerNumber.value =
    ''

  variationCode.value =
    ''

  variations.value =
    []

  verifiedCustomer.value =
    null

  token.value =
    ''

  errorMessage.value =
    ''

  successMessage.value =
    ''

}


// ----------------------------------
// LOAD TV VARIATIONS
// ----------------------------------

async function loadVariations() {

  variations.value =
    []

  variationCode.value =
    ''

  if (!provider.value) {
    return
  }


  errorMessage.value = ''


  try {

    await setFunctionAuth()


    const {
      data,
      error
    } =
      await supabase.functions.invoke(
        'bills',
        {
          body: {
            action:
              'variations',

            provider:
              provider.value
          }
        }
      )


    if (error) {

      throw new Error(
        await getFunctionError(error)
      )

    }


    if (
      !data?.success
    ) {

      throw new Error(
        data?.message ||
        'Unable to load TV plans.'
      )

    }


    variations.value =
      data.variations || []


  } catch (error: any) {

    console.error(
      'Variation error:',
      error
    )

    errorMessage.value =
      error?.message ||
      'Unable to load subscription plans.'

  }

}


// ----------------------------------
// VERIFY CUSTOMER
// ----------------------------------

async function verifyCustomer() {

  errorMessage.value = ''

  successMessage.value = ''

  verifiedCustomer.value =
    null

  token.value = ''


  if (!provider.value) {

    errorMessage.value =
      'Please select a provider.'

    return

  }


  if (
    selectedBill.value ===
      'electricity' &&
    !meterType.value
  ) {

    errorMessage.value =
      'Please select prepaid or postpaid.'

    return

  }


  if (
    selectedBill.value ===
      'cable' &&
    !variationCode.value
  ) {

    errorMessage.value =
      'Please select a subscription plan.'

    return

  }


  if (
    !customerNumber.value.trim()
  ) {

    errorMessage.value =
      'Please enter the customer number.'

    return

  }


  isVerifying.value =
    true


  try {

    await setFunctionAuth()


    const {
      data,
      error
    } =
      await supabase.functions.invoke(
        'bills',
        {
          body: {

            action:
              'verify',

            category:
              selectedBill.value,

            provider:
              provider.value,

            customerNumber:
              customerNumber.value.trim(),

            meterType:
              meterType.value

          }
        }
      )


    if (error) {

      throw new Error(
        await getFunctionError(error)
      )

    }


    if (
      !data?.success
    ) {

      throw new Error(
        data?.message ||
        'Customer verification failed.'
      )

    }


    verifiedCustomer.value =
      data.verification || {}


  } catch (error: any) {

    console.error(
      'Verification error:',
      error
    )

    errorMessage.value =
      error?.message ||
      'Unable to verify customer.'

  } finally {

    isVerifying.value =
      false

  }

}


// ----------------------------------
// PAY BILL
// ----------------------------------

async function payBill() {

  errorMessage.value = ''

  successMessage.value = ''

  token.value = ''


  const paymentAmount =
    Number(amount.value)


  if (
    !verifiedCustomer.value
  ) {

    errorMessage.value =
      'Please verify the customer first.'

    return

  }


  if (
    !Number.isFinite(
      paymentAmount
    ) ||
    paymentAmount < 100
  ) {

    errorMessage.value =
      'Minimum payment amount is ₦100.'

    return

  }


  if (
    paymentAmount >
    balance.value
  ) {

    errorMessage.value =
      'Insufficient wallet balance.'

    return

  }


  if (
    selectedBill.value ===
      'cable' &&
    !variationCode.value
  ) {

    errorMessage.value =
      'Please select a subscription plan.'

    return

  }


  isProcessing.value =
    true


  try {

    await setFunctionAuth()


    const {
      data,
      error
    } =
      await supabase.functions.invoke(
        'bills',
        {
          body: {

            action:
              'pay',

            category:
              selectedBill.value,

            provider:
              provider.value,

            customerNumber:
              customerNumber.value.trim(),

            phone:
              phone.value,

            amount:
              paymentAmount,

            meterType:
              meterType.value,

            variationCode:
              variationCode.value

          }
        }
      )


    if (error) {

      throw new Error(
        await getFunctionError(error)
      )

    }


    if (
      !data?.success
    ) {

      throw new Error(
        data?.message ||
        'Bill payment failed.'
      )

    }


    if (
      data.status ===
        'pending'
    ) {

      successMessage.value =
        data.message ||
        'Your bill payment is being processed.'

      await loadUser()

      return

    }


    successMessage.value =
      data.message ||
      'Bill payment successful.'


    token.value =
      data.token ||
      ''


    await loadUser()


    if (
      selectedBill.value ===
        'electricity'
    ) {

      verifiedCustomer.value =
        null

    }

  } catch (error: any) {

    console.error(
      'Bill payment error:',
      error
    )

    errorMessage.value =
      error?.message ||
      'Unable to complete bill payment.'

  } finally {

    isProcessing.value =
      false

  }

}


// ----------------------------------
// START
// ----------------------------------

onMounted(() => {

  loadUser()

})

</script>

<style scoped>

* {
  box-sizing: border-box;
}

.bills-page {
  min-height: 100vh;

  background: #f7faf8;

  color: #13231d;

  font-family:
    Inter,
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    sans-serif;
}


/* =========================
   SIDEBAR
========================= */

.sidebar {
  position: fixed;

  left: 0;
  top: 0;
  bottom: 0;

  width: 250px;
  height: 100vh;

  background:
    linear-gradient(
      180deg,
      #063b2b 0%,
      #042f24 100%
    );

  color: white;

  display: flex;
  flex-direction: column;

  z-index: 1000;

  transition:
    transform 0.3s ease;

  padding:
    24px 15px;

  box-shadow:
    8px 0 30px
    rgba(
      7,
      67,
      47,
      0.08
    );
}


/* =========================
   BRAND / LOGO
========================= */

.sidebar-brand {
  padding:
    5px 8px 28px;

  display: flex;
  align-items: center;

  gap: 12px;

  margin-bottom: 14px;

  border-bottom: none;
}

.brand-icon {
  width: 46px;
  height: 46px;

  flex-shrink: 0;

  border-radius: 15px;

  background:
    linear-gradient(
      145deg,
      #e1fff1 0%,
      #77e7aa 42%,
      #18b875 72%,
      #08784f 100%
    );

  color: #063b2b;

  display: flex;
  align-items: center;
  justify-content: center;

  position: relative;

  overflow: hidden;

  font-size: 24px;

  font-weight: 950;

  letter-spacing: -2px;

  box-shadow:
    0 10px 25px
    rgba(
      60,
      220,
      145,
      0.22
    ),

    inset 0 1px 0
    rgba(
      255,
      255,
      255,
      0.75
    );
}

.brand-icon::before {
  content: "";

  position: absolute;

  width: 28px;
  height: 10px;

  top: 6px;
  left: 8px;

  border-radius: 20px;

  border-top:
    4px solid
    rgba(
      255,
      255,
      255,
      0.9
    );

  transform:
    rotate(-25deg);

  opacity: 0.9;
}

.brand-icon::after {
  content: "";

  position: absolute;

  width: 17px;
  height: 8px;

  right: 5px;
  bottom: 7px;

  border-radius: 8px;

  background: #046b47;

  transform:
    rotate(-30deg);

  box-shadow:
    0 2px 5px
    rgba(
      0,
      0,
      0,
      0.12
    );
}

.sidebar-brand h1 {
  margin: 0;

  color: white;

  font-size: 18px;

  line-height: 1.05;

  letter-spacing:
    -0.45px;
}

.sidebar-brand span {
  display: block;

  margin-top: 5px;

  color: #9bc1b1;

  font-size: 10px;

  letter-spacing:
    0.35px;
}


/* =========================
   NAVIGATION
========================= */

.sidebar-nav {
  padding:
    0;

  display: flex;
  flex-direction: column;

  gap: 6px;
}

.nav-item,
.logout-side-btn {
  width: 100%;

  border: none;

  background: transparent;

  color: #b4cfc3;

  padding:
    13px 14px;

  border-radius: 12px;

  display: flex;
  align-items: center;

  gap: 13px;

  cursor: pointer;

  text-align: left;

  font-size: 13.5px;

  font-weight: 650;

  transition:
    background 0.2s ease,
    color 0.2s ease,
    transform 0.2s ease;
}

.nav-item:hover,
.logout-side-btn:hover {
  background:
    rgba(
      91,
      224,
      155,
      0.08
    );

  color: white;

  transform:
    translateX(2px);
}

.nav-item.active {
  background:
    linear-gradient(
      135deg,
      #0eaa69,
      #087b51
    );

  color: white;

  box-shadow:
    0 8px 18px
    rgba(
      7,
      129,
      81,
      0.22
    );
}

.nav-icon {
  width: 22px;

  display: inline-flex;

  justify-content: center;

  color: #7ee6ae;

  font-size: 17px;
}

.nav-item.active .nav-icon {
  color: white;
}

.sidebar-bottom {
  margin-top: auto;

  padding:
    15px 0 0;

  border-top:
    1px solid
    rgba(
      255,
      255,
      255,
      0.08
    );
}


/* =========================
   MAIN
========================= */

.main-area {
  margin-left: 250px;

  min-height: 100vh;

  background: #f7faf8;
}


/* =========================
   TOPBAR
========================= */

.topbar {
  height: 78px;

  background:
    rgba(
      255,
      255,
      255,
      0.96
    );

  border-bottom:
    1px solid
    #e6eee9;

  padding:
    0 30px;

  display: flex;
  align-items: center;

  gap: 20px;

  position: sticky;

  top: 0;

  z-index: 100;

  backdrop-filter:
    blur(10px);
}

.menu-btn {
  display: none;

  border: none;

  background:
    #eaf8f1;

  color:
    #087b51;

  width: 40px;
  height: 40px;

  border-radius: 11px;

  cursor: pointer;

  font-size: 20px;
}

.topbar-title {
  margin-right: auto;
}

.topbar-title h2 {
  margin: 0;

  font-size: 21px;

  letter-spacing:
    -0.4px;

  color: #162a21;
}

.topbar-title p {
  margin:
    3px 0 0;

  color: #7b8b84;

  font-size: 11px;
}

.topbar-user {
  display: flex;

  align-items: center;

  gap: 10px;
}

.top-avatar {
  width: 42px;
  height: 42px;

  border-radius: 13px;

  background:
    linear-gradient(
      135deg,
      #d8fff0,
      #61dc9b
    );

  color: #087b51;

  display: flex;

  align-items: center;
  justify-content: center;

  font-weight: 800;

  box-shadow:
    0 6px 15px
    rgba(
      19,
      153,
      95,
      0.13
    );
}

.top-user-info strong {
  display: block;

  font-size: 12px;

  color: #1a2d24;
}

.top-user-info span {
  display: block;

  margin-top: 2px;

  color: #7b8b84;

  font-size: 10px;
}


/* =========================
   CONTENT
========================= */

.content {
  width:
    min(
      1000px,
      94%
    );

  margin:
    30px auto 60px;
}


/* =========================
   BALANCE
========================= */

.balance-card {
  background:
    linear-gradient(
      135deg,
      #07593f 0%,
      #0a8754 48%,
      #16b66e 100%
    );

  color: white;

  padding:
    28px 30px;

  border-radius: 24px;

  display: flex;

  align-items: center;

  justify-content: space-between;

  margin-bottom: 28px;

  position: relative;

  overflow: hidden;

  box-shadow:
    0 18px 40px
    rgba(
      8,
      126,
      81,
      0.18
    );
}

.balance-card::before {
  content: "";

  position: absolute;

  width: 250px;
  height: 250px;

  border-radius: 50%;

  right: -80px;
  top: -120px;

  background:
    rgba(
      255,
      255,
      255,
      0.08
    );
}

.balance-card::after {
  content: "";

  position: absolute;

  width: 160px;
  height: 160px;

  border-radius: 50%;

  right: 100px;
  bottom: -110px;

  background:
    rgba(
      255,
      255,
      255,
      0.05
    );
}

.balance-card > div:first-child,
.wallet-icon {
  position: relative;

  z-index: 2;
}

.balance-card p {
  margin:
    0 0 7px;

  color:
    rgba(
      255,
      255,
      255,
      0.78
    );

  font-size: 12px;
}

.balance-card h1 {
  margin: 0;

  font-size: 34px;

  letter-spacing:
    -1px;
}

.wallet-icon {
  width: 78px;
  height: 68px;

  border-radius: 18px;

  background:
    rgba(
      255,
      255,
      255,
      0.15
    );

  border:
    1px solid
    rgba(
      255,
      255,
      255,
      0.22
    );

  display: flex;

  align-items: center;
  justify-content: center;

  font-size: 29px;

  font-weight: 800;

  backdrop-filter:
    blur(8px);

  box-shadow:
    0 14px 28px
    rgba(
      0,
      0,
      0,
      0.08
    );
}


/* =========================
   INTRO
========================= */

.intro {
  margin-bottom: 20px;
}

.intro h1 {
  margin: 0;

  font-size: 24px;

  color: #15291f;

  letter-spacing:
    -0.45px;
}

.intro p {
  margin:
    7px 0 0;

  color: #7d8c85;

  font-size: 12px;
}


/* =========================
   BILL GRID
========================= */

.bill-grid {
  display: grid;

  grid-template-columns:
    repeat(2, 1fr);

  gap: 16px;
}

.bill-card {
  width: 100%;

  border:
    1px solid
    #e3eee8;

  background: white;

  border-radius: 18px;

  padding: 22px;

  display: flex;

  align-items: center;

  gap: 15px;

  cursor: pointer;

  text-align: left;

  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    border-color 0.2s ease,
    background 0.2s ease;

  box-shadow:
    0 7px 22px
    rgba(
      9,
      71,
      46,
      0.045
    );
}

.bill-card:hover {
  border-color:
    #a9dcc1;

  transform:
    translateY(-3px);

  box-shadow:
    0 13px 28px
    rgba(
      9,
      92,
      61,
      0.08
    );
}

.bill-card.selected {
  border-color:
    #0eaa69;

  background:
    #effaf4;

  box-shadow:
    0 10px 24px
    rgba(
      10,
      155,
      97,
      0.08
    );
}

.bill-icon {
  width: 52px;
  height: 52px;

  min-width: 52px;

  border-radius: 15px;

  display: flex;

  align-items: center;
  justify-content: center;

  font-size: 22px;
}

.bill-icon.electricity {
  background:
    #fff4d9;

  color:
    #d18a12;
}

.bill-icon.cable {
  background:
    #eaf8f1;

  color:
    #0a8958;
}

.bill-info {
  flex: 1;
}

.bill-info h3 {
  margin: 0;

  font-size: 15px;

  color: #172c22;
}

.bill-info p {
  margin:
    5px 0 0;

  color: #7c8b84;

  font-size: 11px;

  line-height: 1.45;
}

.arrow {
  color:
    #809089;

  font-size:
    20px;

  transition:
    transform 0.2s ease,
    color 0.2s ease;
}

.bill-card:hover .arrow {
  color:
    #0a9760;

  transform:
    translateX(3px);
}


/* =========================
   PAYMENT
========================= */

.payment-card {
  background: white;

  border-radius: 22px;

  padding: 30px;

  margin-top: 24px;

  border:
    1px solid
    #e7f1eb;

  box-shadow:
    0 10px 30px
    rgba(
      8,
      74,
      49,
      0.05
    );
}

.payment-header {
  display: flex;

  align-items:
    flex-start;

  justify-content:
    space-between;

  gap: 20px;

  margin-bottom: 25px;
}

.payment-header h2 {
  margin: 0;

  font-size: 21px;

  color: #162a21;
}

.payment-header p {
  margin:
    5px 0 0;

  color: #7d8c85;

  font-size: 12px;
}

.change-btn {
  border:
    1px solid
    #cfe7da;

  background:
    #f5fcf8;

  color:
    #087b51;

  padding:
    9px 13px;

  border-radius:
    9px;

  cursor:
    pointer;

  font-weight:
    800;

  font-size:
    11px;

  transition:
    background 0.2s ease;
}

.change-btn:hover {
  background:
    #eaf8f1;
}


/* =========================
   FIELDS
========================= */

.field {
  margin-bottom:
    20px;
}

.field label {
  display: block;

  margin-bottom:
    8px;

  font-size:
    12px;

  font-weight:
    750;

  color:
    #294037;
}

.field input,
.field select {
  width: 100%;

  padding:
    14px;

  border:
    1px solid
    #dce9e1;

  border-radius:
    11px;

  font-size:
    13px;

  outline:
    none;

  background:
    white;

  color:
    #193028;

  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.field input::placeholder {
  color:
    #a2afa8;
}

.field input:focus,
.field select:focus {
  border-color:
    #0a9b61;

  box-shadow:
    0 0 0 3px
    rgba(
      10,
      155,
      97,
      0.09
    );
}

.field small {
  display:
    block;

  margin-top:
    6px;

  color:
    #93a099;

  font-size:
    10px;
}


/* =========================
   VERIFY
========================= */

.verify-btn {
  width: 100%;

  padding:
    14px;

  border:
    1px solid
    #0aa263;

  background:
    #f3fbf7;

  color:
    #087b51;

  border-radius:
    11px;

  cursor:
    pointer;

  font-weight:
    800;

  font-size:
    13px;

  margin-bottom:
    20px;

  transition:
    background 0.2s ease,
    transform 0.2s ease;
}

.verify-btn:hover:not(:disabled) {
  background:
    #e6f8ee;

  transform:
    translateY(-1px);
}

.verify-btn:disabled {
  opacity:
    .6;

  cursor:
    not-allowed;
}


/* =========================
   VERIFIED
========================= */

.verified-card {
  padding:
    15px;

  margin-bottom:
    20px;

  border:
    1px solid
    #bfe8d1;

  background:
    #eefaf4;

  border-radius:
    12px;

  display:
    flex;

  align-items:
    center;

  gap:
    12px;

  color:
    #08784f;
}

.verified-icon {
  width:
    34px;

  height:
    34px;

  border-radius:
    50%;

  background:
    #0eaa69;

  color:
    white;

  display:
    flex;

  align-items:
    center;

  justify-content:
    center;
}

.verified-card p {
  margin:
    3px 0 0;

  font-size:
    11px;

  color:
    #6f867a;
}


/* =========================
   AMOUNT
========================= */

.amount-input {
  display:
    flex;

  align-items:
    center;

  border:
    1px solid
    #dce9e1;

  border-radius:
    11px;

  overflow:
    hidden;

  background:
    white;

  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.amount-input:focus-within {
  border-color:
    #0a9b61;

  box-shadow:
    0 0 0 3px
    rgba(
      10,
      155,
      97,
      0.09
    );
}

.amount-input span {
  padding-left:
    15px;

  color:
    #0a8f5a;

  font-weight:
    800;
}

.amount-input input {
  border:
    none;

  box-shadow:
    none;

  outline:
    none;

  background:
    transparent;
}

.quick-grid {
  display:
    grid;

  grid-template-columns:
    repeat(6, 1fr);

  gap:
    8px;
}

.quick-grid button {
  border:
    1px solid
    #dcebe3;

  background:
    #fbfdfc;

  color:
    #385148;

  padding:
    11px 6px;

  border-radius:
    9px;

  cursor:
    pointer;

  font-size:
    11px;

  font-weight:
    750;

  transition:
    background 0.2s ease,
    color 0.2s ease,
    border-color 0.2s ease;
}

.quick-grid button:hover {
  background:
    #f0faf5;

  border-color:
    #a9dcc1;
}

.quick-grid button.active {
  background:
    #e7f8ef;

  color:
    #087b51;

  border-color:
    #0eaa69;
}


/* =========================
   NOTICE
========================= */

.notice {
  display:
    flex;

  gap:
    10px;

  padding:
    13px 15px;

  background:
    #f1f9f5;

  border:
    1px solid
    #deeee5;

  border-radius:
    11px;

  margin-bottom:
    18px;

  color:
    #60766b;

  font-size:
    12px;
}

.notice p {
  margin:
    0;

  line-height:
    1.5;
}


/* =========================
   MESSAGES
========================= */

.message {
  padding:
    13px 15px;

  border-radius:
    10px;

  margin-bottom:
    15px;

  font-size:
    12px;
}

.error-message {
  background:
    #fff2f0;

  border:
    1px solid
    #ffd8d2;

  color:
    #c45244;
}

.success-message {
  background:
    #eafaf2;

  border:
    1px solid
    #c8edd9;

  color:
    #078052;
}


/* =========================
   TOKEN
========================= */

.token-box {
  margin-top:
    12px;

  padding:
    15px;

  background:
    #fbfdfc;

  border:
    1px dashed
    #0eaa69;

  border-radius:
    10px;
}

.token-box span {
  display:
    block;

  font-size:
    10px;

  color:
    #7e8d86;

  margin-bottom:
    5px;
}

.token-box strong {
  font-size:
    18px;

  letter-spacing:
    1px;

  color:
    #14583e;

  word-break:
    break-all;
}


/* =========================
   PAY BUTTON
========================= */

.pay-btn {
  width:
    100%;

  border:
    none;

  background:
    linear-gradient(
      135deg,
      #0ea96a,
      #078253
    );

  color:
    white;

  padding:
    15px;

  border-radius:
    12px;

  cursor:
    pointer;

  font-weight:
    800;

  font-size:
    14px;

  box-shadow:
    0 10px 22px
    rgba(
      8,
      139,
      84,
      0.17
    );

  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.pay-btn:hover:not(:disabled) {
  background:
    linear-gradient(
      135deg,
      #12b573,
      #087b51
    );

  transform:
    translateY(-1px);

  box-shadow:
    0 14px 25px
    rgba(
      8,
      139,
      84,
      0.22
    );
}

.pay-btn:disabled {
  opacity:
    .65;

  cursor:
    not-allowed;

  box-shadow:
    none;
}


/* =========================
   EMPTY
========================= */

.empty-card {
  margin-top:
    24px;

  background:
    white;

  border-radius:
    20px;

  padding:
    50px 25px;

  text-align:
    center;

  border:
    1px solid
    #e7f1eb;

  box-shadow:
    0 10px 30px
    rgba(
      8,
      74,
      49,
      0.04
    );
}

.empty-icon {
  width:
    70px;

  height:
    70px;

  margin:
    0 auto 15px;

  border-radius:
    20px;

  background:
    #e8f8f0;

  color:
    #0a945c;

  display:
    flex;

  align-items:
    center;

  justify-content:
    center;

  font-size:
    28px;
}

.empty-card h2 {
  margin:
    0;

  color:
    #172b22;
}

.empty-card p {
  margin:
    7px 0 0;

  color:
    #7d8c85;

  font-size:
    12px;
}


/* =========================
   MOBILE
========================= */

.overlay {
  display:
    none;
}

@media (max-width: 900px) {

  .sidebar {
    transform:
      translateX(-100%);
  }

  .sidebar.open {
    transform:
      translateX(0);
  }

  .main-area {
    margin-left:
      0;
  }

  .menu-btn {
    display:
      flex;

    align-items:
      center;

    justify-content:
      center;

    background:
      #eaf8f1;

    color:
      #087b51;
  }

  .overlay {
    display:
      block;

    position:
      fixed;

    inset:
      0;

    background:
      rgba(
        0,
        0,
        0,
        0.35
      );

    z-index:
      999;
  }

  .topbar {
    padding:
      0 20px;
  }

}

@media (max-width: 700px) {

  .content {
    width:
      94%;
  }

  .bill-grid {
    grid-template-columns:
      1fr;
  }

  .quick-grid {
    grid-template-columns:
      repeat(
        3,
        1fr
      );
  }

  .payment-card {
    padding:
      22px;
  }

  .payment-header {
    flex-direction:
      column;
  }

  .top-user-info {
    display:
      none;
  }

}

@media (max-width: 480px) {

  .topbar {
    padding:
      0 15px;
  }

  .topbar-title h2 {
    font-size:
      17px;
  }

  .topbar-title p {
    display:
      none;
  }

  .balance-card h1 {
    font-size:
      27px;
  }

  .wallet-icon {
    display:
      none;
  }

  .quick-grid {
    grid-template-columns:
      repeat(
        2,
        1fr
      );
  }

}
</style>
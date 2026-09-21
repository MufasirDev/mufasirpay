```vue
<template>
  <div class="wallet-page">


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
          type="button"
          class="nav-item"
          @click="go('/dashboard')"
        >
          <span class="nav-icon">⌂</span>
          <span>Dashboard</span>
        </button>

        <button
          type="button"
          class="nav-item active"
        >
          <span class="nav-icon">₦</span>
          <span>Wallet</span>
        </button>

        <button
          type="button"
          class="nav-item"
          @click="go('/transfer')"
        >
          <span class="nav-icon">⇄</span>
          <span>Transfer</span>
        </button>

        <button
          type="button"
          class="nav-item"
          @click="go('/airtime')"
        >
          <span class="nav-icon">☎</span>
          <span>Airtime & Data</span>
        </button>

        <button
          type="button"
          class="nav-item"
          @click="go('/bills')"
        >
          <span class="nav-icon">▣</span>
          <span>Pay Bills</span>
        </button>

        <button
          type="button"
          class="nav-item"
          @click="go('/transactions')"
        >
          <span class="nav-icon">☷</span>
          <span>Transactions</span>
        </button>

        <button
          type="button"
          class="nav-item"
          @click="go('/profile')"
        >
          <span class="nav-icon">◉</span>
          <span>Profile</span>
        </button>
      </nav>

      <div class="sidebar-bottom">
        <button
          type="button"
          class="logout-side-btn"
          @click="logout"
        >
          <span class="nav-icon">↪</span>
          <span>Logout</span>
        </button>
      </div>
    </aside>

    <div
      v-if="sidebarOpen"
      class="overlay"
      @click="sidebarOpen = false"
    ></div>

    
    <button
      type="button"
      class="menu-btn"
      @click="sidebarOpen = !sidebarOpen"
    >
      ☰
    </button>

  
    <main class="main-content">

      <!-- BALANCE -->
      <section class="balance-card">
        <div>
          <span>Available Balance</span>

          <h2>
            ₦{{ formattedBalance }}
          </h2>

          <p>
            Account Number:
            <strong>{{ accountNumber }}</strong>
          </p>
        </div>

        <div class="balance-icon">
          ₦
        </div>
      </section>

    
      <section class="fund-card">

        <h2>Add Money</h2>

        <p class="description">
          Choose an amount or enter your own amount.
        </p>

        <!-- QUICK AMOUNTS -->
        <div class="quick-amounts">
          <button
            v-for="amount in quickAmounts"
            :key="amount"
            type="button"
            @click="
              amountInput = String(amount)
            "
            :class="{
              selected:
                amountInput === String(amount)
            }"
          >
            ₦{{ amount.toLocaleString('en-NG') }}
          </button>
        </div>

        <!-- AMOUNT -->
        <label for="amount">
          Amount
        </label>

        <div class="amount-input">
          <span>₦</span>

          <input
            id="amount"
            v-model="amountInput"
            type="number"
            min="100"
            step="0.01"
            placeholder="Enter amount"
          />
        </div>

        <p class="minimum">
          Minimum amount: ₦100
        </p>

        <div
          v-if="errorMessage"
          class="message error"
        >
          {{ errorMessage }}
        </div>

        <div
          v-if="successMessage"
          class="message success"
        >
          {{ successMessage }}
        </div>

        <button
          type="button"
          class="fund-button"
          :disabled="loading || verifying"
          @click="startPayment"
        >
          <span v-if="loading">
            Preparing payment...
          </span>

          <span v-else-if="verifying">
            Checking payment...
          </span>

          <span v-else>
            Fund Wallet →
          </span>
        </button>

        <button
          v-if="paymentReference"
          type="button"
          class="verify-button"
          :disabled="verifying"
          @click="verifyPayment"
        >
          {{
            verifying
              ? 'Checking...'
              : 'I Have Completed Payment'
          }}
        </button>

        <p class="secure-text">
          🔒 Payments are securely processed by Paystack.
        </p>

      </section>

    </main>
  </div>
</template>

<script setup lang="ts">

import {
  ref,
  computed,
  onMounted
} from 'vue'

import {
  useRouter
} from 'vue-router'

import {
  supabase
} from '../lib/supabase'

import Paystack from '@paystack/inline-js'

const router = useRouter()


const sidebarOpen = ref(false)

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
// STATE
// ----------------------------------

const loading = ref(false)
const verifying = ref(false)

const amountInput = ref('')
const accountNumber = ref('')
const balance = ref(0)

const paymentReference = ref('')
const accessCode = ref('')

const errorMessage = ref('')
const successMessage = ref('')

const quickAmounts = [
  1000,
  2000,
  5000,
  10000,
  20000
]


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


const loadWallet =
  async () => {

    try {

      const {
        data: {
          user
        }
      } =
        await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }


      const {
        data: profile
      } =
        await supabase
          .from('profiles')
          .select('account_number')
          .eq(
            'id',
            user.id
          )
          .single()

      accountNumber.value =
        profile?.account_number ||
        'Not assigned'

      
      const {
        data: wallet
      } =
        await supabase
          .from('wallets')
          .select('balance')
          .eq(
            'user_id',
            user.id
          )
          .single()

      balance.value =
        Number(
          wallet?.balance || 0
        )

    
      const {
        data: pendingPayment
      } =
        await supabase
          .from('transactions')
          .select('reference')
          .eq(
            'receiver_id',
            user.id
          )
          .eq(
            'type',
            'fund_wallet'
          )
          .eq(
            'status',
            'pending'
          )
          .order(
            'created_at',
            {
              ascending: false
            }
          )
          .limit(1)
          .maybeSingle()

      if (
        pendingPayment?.reference
      ) {
        paymentReference.value =
          pendingPayment.reference
      }

    } catch (error) {

      console.error(
        'Wallet loading error:',
        error
      )

    }

  }


const getFunctionErrorMessage =
  async (
    error: any
  ) => {

    if (
      error?.context &&
      typeof error.context.json ===
        'function'
    ) {

      try {

        const body =
          await error.context.json()

        if (body?.error) {
          return body.error
        }

        if (body?.message) {
          return body.message
        }

      } catch {
        // Use normal error below.
      }

    }

    return (
      error?.message ||
      'Unable to process request.'
    )
  }



const startPayment =
  async () => {

    errorMessage.value = ''
    successMessage.value = ''

    const amount =
      Number(
        amountInput.value
      )

    if (
      !Number.isFinite(amount) ||
      amount < 100
    ) {

      errorMessage.value =
        'Please enter an amount of at least ₦100.'

      return
    }

    loading.value = true

    try {

      const {
        data,
        error
      } =
        await supabase.functions.invoke(
          'fund-wallet',
          {
            body: {
              action:
                'initialize',

              amountNaira:
                amount
            }
          }
        )

      if (error) {

        const message =
          await getFunctionErrorMessage(
            error
          )

        throw new Error(
          message
        )
      }

      if (!data) {

        throw new Error(
          'No response was received from fund-wallet.'
        )
      }

      if (!data.access_code) {

        throw new Error(
          data.error ||
          'Unable to start payment.'
        )
      }

      paymentReference.value =
        data.reference || ''

      accessCode.value =
        data.access_code || ''

      const popup =
        new Paystack()

      popup.resumeTransaction(
        data.access_code
      )

      successMessage.value =
        'Payment window opened. Complete the payment, then click "I Have Completed Payment".'

    } catch (error: any) {

      console.error(
        'Fund wallet error:',
        error
      )

      errorMessage.value =
        error?.message ||
        'Unable to start payment.'

    } finally {

      loading.value = false

    }

  }


const verifyPayment =
  async () => {

    if (
      !paymentReference.value
    ) {

      errorMessage.value =
        'No payment reference found.'

      return
    }

    errorMessage.value = ''
    successMessage.value = ''

    verifying.value = true

    try {

      const {
        data,
        error
      } =
        await supabase.functions.invoke(
          'fund-wallet',
          {
            body: {
              action:
                'verify',

              reference:
                paymentReference.value
            }
          }
        )

      if (error) {

        const message =
          await getFunctionErrorMessage(
            error
          )

        throw new Error(
          message
        )
      }

      if (!data) {

        throw new Error(
          'No response was received from fund-wallet.'
        )
      }

      if (!data.success) {

        throw new Error(
          data.error ||
          'Payment has not been completed.'
        )
      }

      await loadWallet()

      successMessage.value =
        'Payment successful! Your wallet has been funded.'

      amountInput.value = ''

      paymentReference.value = ''

      accessCode.value = ''

    } catch (error: any) {

      console.error(
        'Payment verification error:',
        error
      )

      errorMessage.value =
        error?.message ||
        'Payment could not be verified yet.'

    } finally {

      verifying.value = false

    }

  }


onMounted(() => {
  loadWallet()
})

</script>

<style scoped>

* {
  box-sizing: border-box;
}

.wallet-page {
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

  padding: 24px 15px;

  box-shadow:
    8px 0 30px
    rgba(7, 67, 47, 0.08);

  transition:
    transform 0.3s ease;
}


/* =========================
   BRAND
========================= */

.sidebar-brand {
  display: flex;
  align-items: center;

  gap: 12px;

  padding:
    6px 8px 26px;

  margin-bottom: 16px;

  border-bottom: none;
}

.brand-icon {
  width: 44px;
  height: 44px;

  border-radius: 14px;

  background:
    linear-gradient(
      135deg,
      #d8fff0 0%,
      #62df9b 45%,
      #10a96a 100%
    );

  color: #063b2b;

  display: flex;
  align-items: center;
  justify-content: center;

  position: relative;

  font-size: 23px;
  font-weight: 900;

  box-shadow:
    0 8px 20px
    rgba(68, 218, 147, 0.18);

  overflow: hidden;
}

.brand-icon::before {
  content: "";

  position: absolute;

  width: 19px;
  height: 8px;

  background: white;

  border-radius: 8px;

  transform:
    rotate(-45deg)
    translate(-2px, -5px);

  opacity: 0.95;
}

.brand-icon::after {
  content: "";

  position: absolute;

  width: 14px;
  height: 7px;

  right: 5px;
  bottom: 8px;

  border-radius: 4px;

  background: #08784f;

  transform:
    rotate(-32deg);
}

.brand-icon {
  isolation: isolate;
}

.sidebar-brand h1 {
  margin: 0;

  font-size: 18px;

  line-height: 1.1;

  letter-spacing:
    -0.4px;
}

.sidebar-brand span {
  display: block;

  margin-top: 4px;

  color: #9bc1b1;

  font-size: 10px;

  letter-spacing:
    0.25px;
}


/* =========================
   NAVIGATION
========================= */

.sidebar-nav {
  display: flex;
  flex-direction: column;

  gap: 6px;

  padding:
    0;
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

  color: #f2fff8;

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
   MOBILE MENU
========================= */

.menu-btn {
  display: none;

  position: fixed;

  top: 16px;
  left: 16px;

  width: 42px;
  height: 42px;

  border: none;

  border-radius: 12px;

  background: #063b2b;

  color: white;

  cursor: pointer;

  font-size: 20px;

  z-index: 1100;

  align-items: center;
  justify-content: center;

  box-shadow:
    0 8px 20px
    rgba(
      5,
      60,
      42,
      0.18
    );
}

.overlay {
  position: fixed;

  inset: 0;

  background:
    rgba(
      0,
      0,
      0,
      0.38
    );

  z-index: 999;
}


/* =========================
   MAIN
========================= */

.main-content {
  margin-left: 250px;

  width:
    calc(
      100% - 250px
    );

  min-height: 100vh;

  padding:
    32px 42px 60px;
}


/* =========================
   BALANCE CARD
========================= */

.balance-card {
  max-width: 900px;

  margin:
    0 auto 24px;

  min-height: 210px;

  padding:
    31px 32px;

  border-radius: 24px;

  background:
    linear-gradient(
      135deg,
      #07593f 0%,
      #0a8754 48%,
      #16b66e 100%
    );

  color: white;

  display: flex;

  align-items: center;

  justify-content: space-between;

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

  width: 270px;
  height: 270px;

  border-radius: 50%;

  right: -90px;
  top: -130px;

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

  width: 180px;
  height: 180px;

  border-radius: 50%;

  right: 80px;
  bottom: -120px;

  background:
    rgba(
      255,
      255,
      255,
      0.055
    );
}

.balance-card > div:first-child {
  position: relative;

  z-index: 2;
}

.balance-card > span,
.balance-card > div:first-child > span {
  display: inline-block;

  color:
    rgba(
      255,
      255,
      255,
      0.8
    );

  font-size: 12px;

  font-weight: 600;
}

.balance-card h2 {
  margin:
    9px 0 12px;

  font-size: 40px;

  line-height: 1;

  letter-spacing:
    -1.2px;
}

.balance-card p {
  margin: 0;

  color:
    rgba(
      255,
      255,
      255,
      0.77
    );

  font-size: 11px;
}

.balance-card p strong {
  color: white;

  letter-spacing:
    0.5px;
}

.balance-icon {
  width: 82px;
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

  position: relative;

  z-index: 2;

  backdrop-filter:
    blur(8px);

  box-shadow:
    0 15px 30px
    rgba(
      0,
      0,
      0,
      0.08
    );

  font-size: 30px;

  font-weight: 800;
}

.balance-icon::after {
  content: "";

  position: absolute;

  width: 22px;
  height: 15px;

  right: 17px;
  top: 26px;

  border-radius:
    4px 7px 7px 4px;

  background:
    rgba(
      255,
      255,
      255,
      0.85
    );
}


/* =========================
   FUND CARD
========================= */

.fund-card {
  max-width: 900px;

  margin:
    0 auto;

  background: white;

  padding:
    31px;

  border-radius: 22px;

  border:
    1px solid
    #e7f1eb;

  box-shadow:
    0 9px 30px
    rgba(
      8,
      74,
      49,
      0.05
    );
}

.fund-card h2 {
  margin:
    0 0 7px;

  color: #14271f;

  font-size: 22px;

  letter-spacing:
    -0.4px;
}

.description {
  margin:
    0;

  color: #7e8c85;

  font-size: 12px;
}


/* =========================
   QUICK AMOUNTS
========================= */

.quick-amounts {
  display: grid;

  grid-template-columns:
    repeat(5, 1fr);

  gap: 10px;

  margin:
    24px 0 25px;
}

.quick-amounts button {
  border:
    1px solid
    #dcebe3;

  background:
    #fbfdfc;

  padding:
    11px 10px;

  border-radius: 11px;

  cursor: pointer;

  color: #355148;

  font-size: 12px;

  font-weight: 700;

  transition:
    background 0.2s ease,
    color 0.2s ease,
    border-color 0.2s ease,
    transform 0.2s ease;
}

.quick-amounts button:hover {
  transform:
    translateY(-1px);

  border-color:
    #a7dcc1;

  background:
    #f2fbf6;
}

.quick-amounts button.selected {
  background:
    linear-gradient(
      135deg,
      #0ea96a,
      #078253
    );

  color: white;

  border-color:
    #0b9860;

  box-shadow:
    0 8px 18px
    rgba(
      10,
      145,
      89,
      0.15
    );
}


/* =========================
   FORM
========================= */

.fund-card label {
  display: block;

  margin-bottom: 8px;

  font-weight: 700;

  font-size: 12px;

  color: #243a31;
}

.amount-input {
  display: flex;

  align-items: center;

  border:
    1px solid
    #dce9e1;

  border-radius: 12px;

  overflow: hidden;

  background: #fff;

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
      0.1
    );
}

.amount-input span {
  padding-left: 16px;

  font-weight: 800;

  color:
    #0a8f5a;
}

.amount-input input {
  width: 100%;

  border: none;

  outline: none;

  padding:
    15px;

  font-size: 18px;

  color:
    #172a21;

  background: transparent;
}

.amount-input input::placeholder {
  color: #a4b0aa;
}

.minimum {
  color: #85928c;

  font-size: 11px;

  margin:
    8px 0 0;
}


/* =========================
   MESSAGES
========================= */

.message {
  padding:
    13px 14px;

  border-radius: 11px;

  margin:
    18px 0;

  font-size: 12px;

  line-height: 1.5;
}

.error {
  background:
    #fff2f0;

  color:
    #c45244;

  border:
    1px solid
    #ffd8d2;
}

.success {
  background:
    #eafaf2;

  color:
    #078052;

  border:
    1px solid
    #c8edd9;
}


/* =========================
   BUTTONS
========================= */

.fund-button,
.verify-button {
  width: 100%;

  padding:
    14px;

  border-radius: 11px;

  cursor: pointer;

  font-weight: 800;

  font-size: 13px;

  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    background 0.2s ease;
}

.fund-button {
  border: none;

  background:
    linear-gradient(
      135deg,
      #0ea96a,
      #078253
    );

  color: white;

  margin-top: 17px;

  box-shadow:
    0 10px 22px
    rgba(
      8,
      139,
      84,
      0.17
    );
}

.fund-button:hover:not(:disabled) {
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

.fund-button:disabled,
.verify-button:disabled {
  opacity: 0.58;

  cursor: not-allowed;
}

.verify-button {
  margin-top: 11px;

  background:
    #f2fbf6;

  border:
    1px solid
    #a8dcc1;

  color:
    #087b51;
}

.verify-button:hover:not(:disabled) {
  background:
    #e7f8ef;
}


/* =========================
   SECURITY
========================= */

.secure-text {
  text-align: center;

  margin:
    19px 0 0;

  color: #829089;

  font-size: 11px;
}


/* =========================
   RESPONSIVE
========================= */

@media (max-width: 1050px) {

  .quick-amounts {
    grid-template-columns:
      repeat(3, 1fr);
  }

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

  .main-content {
    margin-left: 0;

    width: 100%;

    padding:
      78px 24px 50px;
  }

  .menu-btn {
    display: flex;
  }

}


@media (max-width: 650px) {

  .main-content {
    padding:
      75px 16px 40px;
  }

  .balance-card,
  .fund-card {
    padding:
      24px 20px;
  }

  .balance-card {
    min-height:
      auto;
  }

  .balance-card h2 {
    font-size: 31px;
  }

  .balance-icon {
    display: none;
  }

  .quick-amounts {
    grid-template-columns:
      repeat(2, 1fr);
  }

}


@media (max-width: 420px) {

  .quick-amounts {
    grid-template-columns:
      1fr 1fr;
  }

  .quick-amounts button {
    padding:
      10px 7px;

    font-size: 11px;
  }

}

</style>
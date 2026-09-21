```vue
<template>
  <div class="transfer-page">

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
          class="nav-item"
          @click="go('/wallet')"
        >
          <span class="nav-icon">₦</span>
          <span>Wallet</span>
        </button>

        <button
          type="button"
          class="nav-item active"
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

      <div class="balance-card">

        <div>
          <p>Available Balance</p>

          <h2>
            ₦{{ formattedBalance }}
          </h2>
        </div>

        <div class="balance-icon">
          ₦
        </div>

      </div>


      <div class="transfer-card">

        <h2>Send Money</h2>

        <p class="description">
          Enter the recipient's 10-digit MufasirPay account number.
        </p>


        <form @submit.prevent="transferMoney">

          <div class="form-group">

            <label>
              Recipient Account Number
            </label>

            <input
              v-model="receiverAccountNumber"
              type="text"
              inputmode="numeric"
              maxlength="10"
              autocomplete="off"
              placeholder="Enter 10-digit account number"
              required
              @input="cleanAccountNumber"
            />

            <small class="input-hint">
              Enter the account number of the person receiving the money.
            </small>

          </div>


          
          <div class="form-group">

            <label>
              Amount
            </label>

            <div class="amount-input">

              <span>₦</span>

              <input
                v-model="amountInput"
                type="number"
                min="100"
                step="0.01"
                placeholder="Enter amount"
                required
              />

            </div>

          </div>


          <p class="minimum">
            Minimum transfer: ₦100
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
            type="submit"
            class="transfer-button"
            :disabled="loading"
          >

            <span v-if="loading">
              Processing Transfer...
            </span>

            <span v-else>
              Send Money →
            </span>

          </button>

        </form>



        <div class="security-note">

          <span>🔒</span>

          <p>
            Transfers are processed securely through
            MufasirPay's server-side transaction system.
          </p>

        </div>

      </div>

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



const loading =
  ref(false)

const receiverAccountNumber =
  ref('')

const amountInput =
  ref('')

const balance =
  ref(0)

const errorMessage =
  ref('')

const successMessage =
  ref('')




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




const cleanAccountNumber = () => {

  receiverAccountNumber.value =
    receiverAccountNumber.value
      .replace(/\D/g, '')
      .slice(0, 10)

}



const getFunctionErrorMessage =
  async (error: any) => {

    if (
      error?.context &&
      typeof error.context.json === 'function'
    ) {

      try {

        const responseBody =
          await error.context.json()

        if (
          responseBody?.error
        ) {

          return responseBody.error

        }

        if (
          responseBody?.message
        ) {

          return responseBody.message

        }

      } catch {
        // Ignore JSON parsing failure
      }

    }


    return (
      error?.message ||
      'Unable to complete transfer.'
    )

  }




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
        data: wallet,
        error
      } =
        await supabase
          .from('wallets')
          .select('balance')
          .eq(
            'user_id',
            user.id
          )
          .single()


      if (error) {

        console.error(
          'Wallet loading error:',
          error
        )

        return

      }


      balance.value =
        Number(
          wallet?.balance || 0
        )

    } catch (error) {

      console.error(
        'Wallet error:',
        error
      )

    }

  }




const transferMoney =
  async () => {

    errorMessage.value = ''
    successMessage.value = ''


    const account =
      receiverAccountNumber.value.trim()

    const amount =
      Number(amountInput.value)


    

    if (account.length !== 10) {

      errorMessage.value =
        'Please enter a valid 10-digit MufasirPay account number.'

      return

    }


    

    if (
      !Number.isFinite(amount) ||
      amount < 100
    ) {

      errorMessage.value =
        'Please enter an amount of at least ₦100.'

      return

    }


    

    if (amount > balance.value) {

      errorMessage.value =
        'Insufficient wallet balance.'

      return

    }


    loading.value = true


    try {

      const {
        data,
        error
      } =
        await supabase.functions.invoke(
          'transfer-money',
          {
            body: {
              receiverAccountNumber:
                account,

              amount
            }
          }
        )


      if (error) {

        const realMessage =
          await getFunctionErrorMessage(
            error
          )

        throw new Error(
          realMessage
        )

      }


      if (!data) {

        throw new Error(
          'No response was received from the transfer service.'
        )

      }


      if (!data.success) {

        throw new Error(
          data.error ||
          'Transfer failed.'
        )

      }


      await loadWallet()


      successMessage.value =
        `Transfer successful. ₦${amount.toLocaleString(
          'en-NG',
          {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          }
        )} sent successfully.`


      receiverAccountNumber.value = ''

      amountInput.value = ''


    } catch (error: any) {

      console.error(
        'Transfer error:',
        error
      )


      errorMessage.value =
        error?.message ||
        'Unable to complete transfer.'


    } finally {

      loading.value = false

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

.transfer-page {
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

  padding: 24px 15px;

  z-index: 1000;

  box-shadow:
    8px 0 30px
    rgba(
      7,
      67,
      47,
      0.08
    );

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

  overflow: hidden;

  box-shadow:
    0 8px 20px
    rgba(
      68,
      218,
      147,
      0.18
    );
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

  padding: 0;
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

  min-height: 190px;

  padding:
    30px 32px;

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

.balance-card p {
  margin:
    0 0 8px;

  color:
    rgba(
      255,
      255,
      255,
      0.78
    );

  font-size: 12px;

  font-weight: 600;
}

.balance-card h2 {
  margin: 0;

  font-size: 40px;

  line-height: 1;

  letter-spacing:
    -1.2px;
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
   TRANSFER CARD
========================= */

.transfer-card {
  max-width: 900px;

  margin:
    0 auto;

  background: white;

  border-radius: 22px;

  padding:
    32px;

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

.transfer-card h2 {
  margin:
    0 0 7px;

  color: #14271f;

  font-size: 22px;

  letter-spacing:
    -0.4px;
}

.description {
  margin:
    0 0 27px;

  color: #7e8c85;

  font-size: 12px;
}


/* =========================
   FORM
========================= */

.form-group {
  margin-bottom:
    21px;
}

.form-group label {
  display: block;

  margin-bottom: 8px;

  font-size: 12px;

  font-weight: 700;

  color: #243a31;
}

.form-group input {
  width: 100%;

  border:
    1px solid
    #dce9e1;

  border-radius: 12px;

  padding:
    14px;

  outline: none;

  font-size: 15px;

  color: #172a21;

  background: white;

  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.form-group input::placeholder {
  color: #a2afa8;
}

.form-group input:focus {
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

.input-hint {
  display: block;

  margin-top: 7px;

  color: #91a099;

  font-size: 10px;
}


/* =========================
   AMOUNT
========================= */

.amount-input {
  display: flex;

  align-items: center;

  border:
    1px solid
    #dce9e1;

  border-radius: 12px;

  overflow: hidden;

  background: white;

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
  padding-left: 15px;

  color:
    #0a8f5a;

  font-weight: 800;
}

.amount-input input {
  width: 100%;

  border: none;

  outline: none;

  box-shadow: none;

  padding:
    14px 12px;

  font-size: 16px;

  color:
    #172a21;

  background: transparent;
}

.amount-input input:focus {
  border: none;

  box-shadow: none;
}

.minimum {
  margin:
    8px 0 0;

  color: #85928c;

  font-size: 11px;
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
   TRANSFER BUTTON
========================= */

.transfer-button {
  width: 100%;

  border: none;

  border-radius: 11px;

  padding:
    15px;

  background:
    linear-gradient(
      135deg,
      #0ea96a,
      #078253
    );

  color: white;

  font-weight: 800;

  font-size: 13px;

  cursor: pointer;

  margin-top: 10px;

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

.transfer-button:hover:not(:disabled) {
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

.transfer-button:disabled {
  opacity: 0.58;

  cursor: not-allowed;

  box-shadow: none;
}


/* =========================
   SECURITY NOTE
========================= */

.security-note {
  display: flex;

  gap: 11px;

  align-items: flex-start;

  margin-top:
    22px;

  padding:
    14px;

  border-radius: 12px;

  background:
    #eefaf4;

  border:
    1px solid
    #d7eee2;
}

.security-note span {
  font-size: 16px;
}

.security-note p {
  margin: 0;

  color: #708078;

  font-size: 11px;

  line-height: 1.55;
}


/* =========================
   RESPONSIVE
========================= */

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


@media (max-width: 600px) {

  .main-content {
    padding:
      75px 16px 40px;
  }

  .balance-card,
  .transfer-card {
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

  .transfer-card h2 {
    font-size: 20px;
  }

}
</style>
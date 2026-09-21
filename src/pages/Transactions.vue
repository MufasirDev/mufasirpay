```vue
<template>
  <div class="transactions-page">

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
          class="nav-item active"
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

    <!-- MAIN CONTENT -->
    <main class="main-content">

      <!-- SUMMARY -->
      <div class="summary-grid">

        <div class="summary-card">
          <p>Total Transactions</p>
          <h2>{{ transactions.length }}</h2>
        </div>

        <div class="summary-card">
          <p>Total Money In</p>
          <h2>₦{{ totalIncome }}</h2>
        </div>

        <div class="summary-card">
          <p>Total Money Out</p>
          <h2>₦{{ totalExpenses }}</h2>
        </div>

      </div>


      <!-- LOADING -->
      <div
        v-if="loading"
        class="state-card"
      >
        Loading transactions...
      </div>


      <!-- ERROR -->
      <div
        v-else-if="errorMessage"
        class="state-card error-state"
      >
        {{ errorMessage }}
      </div>


      <!-- EMPTY -->
      <div
        v-else-if="transactions.length === 0"
        class="state-card"
      >
        <div class="empty-icon">↔</div>

        <h3>No transactions yet</h3>

        <p>
          Your wallet activity will appear here
          when you fund your wallet or send money.
        </p>
      </div>


      <!-- TRANSACTIONS -->
      <div
        v-else
        class="transaction-list"
      >

        <div
          v-for="transaction in transactions"
          :key="transaction.id"
          class="transaction-item"
        >

          <div class="transaction-left">

            <div
              class="transaction-icon"
              :class="
                transaction.receiver_id === userId
                  ? 'money-in'
                  : 'money-out'
              "
            >
              {{
                transaction.receiver_id === userId
                  ? '↓'
                  : '↑'
              }}
            </div>


            <div class="transaction-details">

              <h3>
                {{ transactionTitle(transaction) }}
              </h3>

              <p>
                {{
                  transaction.description ||
                  'MufasirPay transaction'
                }}
              </p>

              <small>
                {{ formatDate(transaction.created_at) }}
              </small>

            </div>

          </div>


          <div class="transaction-right">

            <strong
              :class="
                transaction.receiver_id === userId
                  ? 'credit'
                  : 'debit'
              "
            >
              {{
                transaction.receiver_id === userId
                  ? '+'
                  : '-'
              }}₦{{
                Number(
                  transaction.amount
                ).toLocaleString(
                  'en-NG',
                  {
                    minimumFractionDigits: 2
                  }
                )
              }}
            </strong>

            <span
              class="status"
              :class="transaction.status"
            >
              {{ transaction.status }}
            </span>

          </div>

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
// STATE
// ----------------------------------

const loading =
  ref(true)

const errorMessage =
  ref('')

const userId =
  ref('')

const transactions =
  ref<any[]>([])


// ----------------------------------
// TOTAL INCOME
// ----------------------------------

const totalIncome =
  computed(() => {

    let total = 0

    transactions.value.forEach(
      (transaction) => {

        if (
          transaction.receiver_id ===
          userId.value
        ) {

          total +=
            Number(
              transaction.amount
            )

        }

      }
    )

    return total.toLocaleString(
      'en-NG',
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }
    )

  })


// ----------------------------------
// TOTAL EXPENSES
// ----------------------------------

const totalExpenses =
  computed(() => {

    let total = 0

    transactions.value.forEach(
      (transaction) => {

        if (
          transaction.sender_id ===
          userId.value
        ) {

          total +=
            Number(
              transaction.amount
            )

        }

      }
    )

    return total.toLocaleString(
      'en-NG',
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }
    )

  })


// ----------------------------------
// LOAD TRANSACTIONS
// ----------------------------------

const loadTransactions =
  async () => {

    loading.value = true

    errorMessage.value = ''


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


      userId.value =
        user.id


      const {
        data,
        error
      } =
        await supabase
          .from('transactions')
          .select('*')
          .or(
            `sender_id.eq.${user.id},receiver_id.eq.${user.id}`
          )
          .order(
            'created_at',
            {
              ascending: false
            }
          )


      if (error) {

        throw error

      }


      transactions.value =
        data || []


    } catch (error: any) {

      console.error(
        'Transactions error:',
        error
      )

      errorMessage.value =
        error?.message ||
        'Unable to load transactions.'

    } finally {

      loading.value = false

    }

  }


// ----------------------------------
// TRANSACTION TITLE
// ----------------------------------

const transactionTitle =
  (transaction: any) => {

    if (
      transaction.type ===
      'fund_wallet'
    ) {

      return 'Wallet Funding'

    }


    if (
      transaction.type ===
      'transfer'
    ) {

      return transaction.receiver_id ===
        userId.value
        ? 'Money Received'
        : 'Money Sent'

    }


    return transaction.type ||
      'Transaction'

  }


// ----------------------------------
// FORMAT DATE
// ----------------------------------

const formatDate =
  (date: string) => {

    return new Date(
      date
    ).toLocaleString(
      'en-NG',
      {
        dateStyle: 'medium',
        timeStyle: 'short'
      }
    )

  }


// ----------------------------------
// START
// ----------------------------------

onMounted(() => {

  loadTransactions()

})

</script>

<style scoped>

* {
  box-sizing: border-box;
}

.transactions-page {
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


/* =================================
   SIDEBAR
================================= */

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

  box-shadow:
    8px 0 30px
    rgba(
      7,
      67,
      47,
      0.08
    );

  padding: 24px 15px;
}


/* =================================
   LOGO / BRAND
================================= */

.sidebar-brand {
  padding:
    5px 8px 28px;

  display: flex;
  align-items: center;

  gap: 12px;

  margin-bottom: 14px;
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

  display: flex;
  align-items: center;
  justify-content: center;

  position: relative;

  overflow: hidden;

  color: #063b2b;

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

  font-size: 18px;

  font-weight: 800;

  line-height: 1.05;

  letter-spacing:
    -0.45px;

  color: white;
}

.sidebar-brand span {
  display: block;

  margin-top: 5px;

  color: #9bc1b1;

  font-size: 10px;

  letter-spacing:
    0.35px;
}


/* =================================
   SIDEBAR NAVIGATION
================================= */

.sidebar-nav {
  padding: 0;

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

  font-size: 17px;

  color: #7ee6ae;
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


/* =================================
   MOBILE MENU
================================= */

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


/* =================================
   MAIN CONTENT
================================= */

.main-content {
  margin-left: 250px;

  width:
    calc(
      100% - 250px
    );

  min-height: 100vh;

  padding:
    38px 28px 60px;
}

.page-container {
  width: 100%;

  max-width: 1000px;

  margin: auto;
}


/* =================================
   SUMMARY CARDS
================================= */

.summary-grid {
  display: grid;

  grid-template-columns:
    repeat(3, 1fr);

  gap: 16px;

  margin-bottom: 25px;
}

.summary-card {
  background: white;

  padding: 22px;

  border-radius: 17px;

  border:
    1px solid
    #e5efe9;

  box-shadow:
    0 7px 24px
    rgba(
      9,
      71,
      46,
      0.045
    );

  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    border-color 0.2s ease;
}

.summary-card:hover {
  transform:
    translateY(-3px);

  border-color:
    #cbe9d9;

  box-shadow:
    0 12px 28px
    rgba(
      9,
      92,
      61,
      0.08
    );
}

.summary-card p {
  margin:
    0 0 8px;

  color: #82918a;

  font-size: 11px;

  font-weight: 650;
}

.summary-card h2 {
  margin: 0;

  color: #087b51;

  font-size: 24px;

  font-weight: 850;

  letter-spacing:
    -0.5px;
}


/* =================================
   STATE
================================= */

.state-card {
  background: white;

  padding:
    55px 25px;

  border-radius: 18px;

  text-align: center;

  border:
    1px solid
    #e5efe9;

  box-shadow:
    0 7px 24px
    rgba(
      9,
      71,
      46,
      0.04
    );
}

.state-card h3 {
  margin:
    10px 0 8px;

  color: #163126;

  font-size: 17px;
}

.state-card p {
  margin: 0;

  color: #7b8b84;

  font-size: 12px;
}

.error-state {
  color: #c45244;

  background:
    #fff2f0;

  border-color:
    #ffd8d2;
}

.empty-icon {
  width: 60px;
  height: 60px;

  margin:
    0 auto 12px;

  border-radius: 17px;

  background:
    #e8f8f0;

  color:
    #0a945c;

  display: flex;
  align-items: center;
  justify-content: center;

  font-size: 27px;
}


/* =================================
   TRANSACTION LIST
================================= */

.transaction-list {
  background: white;

  border-radius: 18px;

  overflow: hidden;

  border:
    1px solid
    #e5efe9;

  box-shadow:
    0 7px 24px
    rgba(
      9,
      71,
      46,
      0.04
    );
}


/* =================================
   TRANSACTION ITEM
================================= */

.transaction-item {
  padding:
    18px 20px;

  display: flex;

  align-items: center;

  justify-content:
    space-between;

  gap: 20px;

  border-bottom:
    1px solid
    #edf3ef;

  transition:
    background 0.2s ease;
}

.transaction-item:hover {
  background:
    #f7fbf9;
}

.transaction-item:last-child {
  border-bottom: none;
}


/* =================================
   LEFT SIDE
================================= */

.transaction-left {
  display: flex;

  align-items: center;

  gap: 14px;

  min-width: 0;
}

.transaction-icon {
  width: 44px;
  height: 44px;

  flex-shrink: 0;

  border-radius: 13px;

  display: flex;

  align-items: center;
  justify-content: center;

  font-size: 19px;

  font-weight: 800;
}


/* MONEY IN */

.money-in {
  background:
    #e5f9ef;

  color:
    #0a965e;
}


/* MONEY OUT */

.money-out {
  background:
    #fff0ed;

  color:
    #d15e4d;
}


/* =================================
   TRANSACTION DETAILS
================================= */

.transaction-details {
  min-width: 0;
}

.transaction-details h3 {
  margin:
    0 0 4px;

  font-size: 13px;

  font-weight: 750;

  color: #1a2d24;

  white-space: nowrap;

  overflow: hidden;

  text-overflow: ellipsis;
}

.transaction-details p {
  margin:
    0 0 4px;

  color: #7b8b84;

  font-size: 11px;
}

.transaction-details small {
  color: #9aa7a1;

  font-size: 10px;
}


/* =================================
   RIGHT SIDE
================================= */

.transaction-right {
  text-align: right;

  flex-shrink: 0;
}

.transaction-right strong {
  display: block;

  font-size: 14px;

  margin-bottom: 6px;

  font-weight: 850;
}


/* CREDIT */

.credit {
  color:
    #0a965e;
}


/* DEBIT */

.debit {
  color:
    #d15e4d;
}


/* =================================
   STATUS
================================= */

.status {
  display: inline-block;

  padding:
    5px 9px;

  border-radius:
    20px;

  font-size:
    9px;

  font-weight:
    750;

  text-transform:
    capitalize;

  background:
    #f1f5f3;

  color:
    #708078;
}

.status.successful {
  background:
    #e5f9ef;

  color:
    #087f52;
}

.status.pending {
  background:
    #fff6df;

  color:
    #b17916;
}

.status.failed {
  background:
    #fff0ed;

  color:
    #c45244;
}


/* =================================
   RESPONSIVE
================================= */

@media (max-width: 1000px) {

  .summary-grid {
    grid-template-columns:
      repeat(3, 1fr);

    gap: 12px;
  }

}


/* =================================
   TABLET
================================= */

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
      78px 22px 50px;
  }

  .menu-btn {
    display: flex;
  }

}


/* =================================
   TABLET / MOBILE
================================= */

@media (max-width: 750px) {

  .summary-grid {
    grid-template-columns:
      1fr;
  }

  .transaction-item {
    align-items:
      flex-start;

    flex-direction:
      column;
  }

  .transaction-right {
    width: 100%;

    text-align: left;

    padding-left: 58px;
  }

}


/* =================================
   SMALL MOBILE
================================= */

@media (max-width: 600px) {

  .main-content {
    padding:
      72px 15px 40px;
  }

  .summary-card {
    padding:
      18px;
  }

  .summary-card h2 {
    font-size:
      21px;
  }

  .transaction-item {
    padding:
      17px;
  }

  .transaction-left {
    width: 100%;
  }

  .transaction-icon {
    width: 42px;
    height: 42px;

    font-size: 18px;
  }

  .transaction-details h3 {
    font-size: 13px;
  }

  .transaction-right {
    padding-left: 56px;
  }

}


/* =================================
   VERY SMALL MOBILE
================================= */

@media (max-width: 400px) {

  .transaction-item {
    gap: 14px;
  }

  .transaction-details h3 {
    max-width:
      185px;
  }

}

</style>
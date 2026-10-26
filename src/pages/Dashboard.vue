<template>

  <div class="dashboard">

    <!-- SIDEBAR -->

    <aside class="sidebar">

      <div class="brand">

        <div class="brand-icon">

           <span>M</span>

        </div>

        <div class="brand-text">

          <strong>Mufasir<span>Pay</span></strong>

          <small>Digital Banking</small>

        </div>

      </div>

      <nav class="sidebar-nav">

        <button

          type="button"

 class="nav-item active"

 @click="goTo('/dashboard')" >

          <span class="nav-icon">⌂</span>

          <span>Overview</span>

        </button>

        <button

          type="button"

          class="nav-item"

          @click="goTo('/wallet')"

        >

          <span class="nav-icon">▣</span>

          <span>Wallet</span>

        </button>

        <button

          type="button"

          class="nav-item"

          @click="goTo('/transfer')"

        >

          <span class="nav-icon">⇄</span>

          <span>Transfer</span>

        </button>

        <button

          type="button"

          class="nav-item"

          @click="goTo('/airtime')"

        >

          <span class="nav-icon">◫</span>

          <span>Airtime & Data</span>

        </button>

        <button

          type="button"

          class="nav-item"

          @click="goTo('/bills')"

        >

          <span class="nav-icon">▤</span>

          <span>Bills</span>

        </button>

        <button

          type="button"

          class="nav-item"

          @click="goTo('/transactions')"

        >

          <span class="nav-icon">☷</span>

          <span>Transactions</span>

        </button>

        <button

          type="button"

          class="nav-item"

          @click="goTo('/profile')"

        >

          <span class="nav-icon">◉</span>

          <span>Profile</span>

        </button>

      </nav>

      <button

        type="button"

        class="logout-btn"

        @click="logout"

      >

        <span class="nav-icon">↪</span>

        <span>Logout</span>

      </button>

    </aside>

    <!-- MAIN CONTENT -->

    <main class="main-content">

      <!-- TOPBAR -->

      <header class="topbar">

        <div class="welcome-area">

          <p class="welcome-small">

            Welcome back,

          </p>

          <h1>

            {{ firstName }}

          </h1>

          <p class="topbar-subtitle">

            Here's your account overview.

          </p>

        </div>

        <div class="topbar-actions">

          <button

            type="button"

            class="icon-button"

            title="Notifications"

          >

            ♧

          </button>

          <div class="user-avatar">

            {{ initials }}

          </div>

        </div>

      </header>

      <!-- LOADING -->

      <div

        v-if="loading"

        class="loading"

      >

        <div class="loading-spinner"></div>

        <span>

          Loading your MufasirPay account...

        </span>

      </div>

      <template v-else>

        <!-- BALANCE -->

        <section class="balance-card">

          <div class="balance-content">

            <div class="balance-label-row">

              <p class="balance-label">Available Balance</p>

              <button

                type="button"

                class="balance-toggle-btn"

                @click="toggleBalance"

                :aria-label="showBalance ? 'Hide balance' : 'Show balance'"

                :title="showBalance ? 'Hide balance' : 'Show balance'"

              >

                <svg

                  v-if="showBalance"

                  xmlns="http://www.w3.org/2000/svg"

                  width="20"

                  height="20"

                  viewBox="0 0 24 24"

                  fill="none"

                  stroke="currentColor"

                  stroke-width="2"

                  stroke-linecap="round"

                  stroke-linejoin="round"

                >

                  <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z" />

                  <circle cx="12" cy="12" r="3" />

                </svg>

                <svg

                  v-else

                  xmlns="http://www.w3.org/2000/svg"

                  width="20"

                  height="20"

                  viewBox="0 0 24 24"

                  fill="none"

                  stroke="currentColor"

                  stroke-width="2"

                  stroke-linecap="round"

                  stroke-linejoin="round"

                >

                  <path d="M3 3l18 18" />

                  <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />

                  <path d="M9.9 5.2A10.8 10.8 0 0 1 12 5c6.4 0 10 7 10 7a15.7 15.7 0 0 1-4 4.8" />

                  <path d="M6.2 6.2C3.5 8 2 12 2 12s3.6 7 10 7a10.5 10.5 0 0 0 3.1-.5" />

                </svg>

              </button>

            </div>

            <h2>{{ showBalance ? `₦${formattedBalance}` : '₦ ••••••' }}</h2>

            <p class="account-number">

              Account Number:

              <strong>{{ accountNumber }}</strong>

            </p>

            <div class="balance-actions">

              <button type="button" @click="openWallet">Fund Wallet</button>

              <button

                type="button"

                class="outline-btn"

                @click="goTo('/transactions')"

              >

                View Transactions

              </button>

            </div>

          </div>

          <div class="balance-visual">

            <div class="wallet-symbol"><span>₦</span></div>

            <div class="balance-glow"></div>

          </div>

        </section>

        <!-- STATS -->

        <section class="stats-grid">

          <div class="stat-card">

            <div class="stat-icon income-icon">

              ↓

            </div>

            <div>

              <p>Total Income</p>

              <h3>

                ₦{{ totalIncome }}

              </h3>

            </div>

          </div>

          <div class="stat-card">

            <div class="stat-icon expense-icon">

              ↑

            </div>

            <div>

              <p>Total Expenses</p>

              <h3>

                ₦{{ totalExpenses }}

              </h3>

            </div>

          </div>

          <div class="stat-card">

            <div class="stat-icon transaction-icon-stat">

              ↔

            </div>

            <div>

              <p>Transactions</p>

              <h3>

                {{ transactionCount }}

              </h3>

            </div>

          </div>

        </section>

        <!-- QUICK ACTIONS -->

        <section class="section">

          <div class="section-header">

            <div>

              <p class="section-eyebrow">

                SERVICES

              </p>

              <h2>

                Quick Actions

              </h2>

            </div>

          </div>

          <div class="actions-grid">

            <!-- TRANSFER -->

            <button

              type="button"

              class="action-card"

              @click="goTo('/transfer')"

            >

              <div class="action-icon">

                ⇄

              </div>

              <div class="action-arrow">

                →

              </div>

              <h3>

                Transfer Money

              </h3>

              <p>

                Send money to another

                MufasirPay user.

              </p>

            </button>

            <!-- FUND WALLET -->

            <button

              type="button"

              class="action-card"

              @click="openWallet"

            >

              <div class="action-icon">

                ₦

              </div>

              <div class="action-arrow">

                →

              </div>

              <h3>

                Fund Wallet

              </h3>

              <p>

                Add money to your

                MufasirPay wallet.

              </p>

            </button>

            <!-- AIRTIME -->

            <button

              type="button"

              class="action-card"

              @click="goTo('/airtime')"

            >

              <div class="action-icon">

                ◫

              </div>

              <div class="action-arrow">

                →

              </div>

              <h3>

                Airtime & Data

              </h3>

              <p>

                Buy airtime and

                mobile data instantly.

              </p>

            </button>

            <!-- BILLS -->

            <button

              type="button"

              class="action-card"

              @click="goTo('/bills')"

            >

              <div class="action-icon">

                ▤

              </div>

              <div class="action-arrow">

                →

              </div>

              <h3>

                Pay Bills

              </h3>

              <p>

                Pay electricity and

                cable bills with ease.

              </p>

            </button>

            <!-- ANALYTICS -->

            <button

              type="button"

              class="action-card"

              @click="goTo('/analytics')"

            >

              <div class="action-icon">▥</div>

              <div class="action-arrow">→</div>

              <h3>Financial Analytics</h3>

              <p>Review your income, expenses, and spending trends.</p>

            </button>

            <!-- NOTIFICATIONS -->

            <button

              type="button"

              class="action-card"

              @click="goTo('/notifications')"

            >

              <div class="action-icon">♧</div>

              <div class="action-arrow">→</div>

              <h3>Notifications</h3>

              <p>View important alerts and updates about your account.</p>

            </button>

            <!-- SECURITY CENTER -->

            <button

              type="button"

              class="action-card"

              @click="goTo('/security')"

            >

              <div class="action-icon">🛡</div>

              <div class="action-arrow">→</div>

              <h3>Security Center</h3>

              <p>Manage your password and account security.</p>

            </button>

<!-- HELP & SUPPORT -->

 <button

  type="button"

  class="action-card"

  @click="goTo('/support')"

>

  <div class="action-icon">🎧</div>

  <div class="action-arrow">→</div>

  <h3>Help & Support</h3>

  <p>Get help, explore FAQs, or report a transaction issue.</p>

</button>

          </div>

        </section>

        <!-- RECENT TRANSACTIONS -->

        <section class="section">

          <div class="section-header transactions-header">

            <div>

              <p class="section-eyebrow">

                ACTIVITY

              </p>

              <h2>

                Recent Transactions

              </h2>

            </div>

            <button

              type="button"

              class="view-all"

              @click="goTo('/transactions')"

            >

              View All →

            </button>

          </div>

          <!-- EMPTY -->

          <div

            v-if="transactions.length === 0"

            class="empty-state"

          >

            <div class="empty-icon">

              ↔

            </div>

            <h3>

              No transactions yet

            </h3>

            <p>

              Your transactions will appear

              here when you start using MufasirPay.

            </p>

          </div>

          <!-- TRANSACTIONS -->

          <div

            v-else

            class="transactions"

          >

            <div

              v-for="transaction in transactions.slice(0, 7)"

              :key="transaction.id"

              class="transaction"

            >

              <div class="transaction-left">

                <div class="transaction-icon">

                  ↔

                </div>

                <div>

                  <h4>

                    {{

                      transaction.description ||

                      transaction.type

                    }}

                  </h4>

                  <p>

                    {{

                      formatDate(

                        transaction.created_at

                      )

                    }}

                  </p>

                </div>

              </div>

              <div class="transaction-right">

                <strong>

                  ₦{{

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

   :class="[

                    'transaction-status',

                    transaction.status

                  ]"

>

                  {{ transaction.status }}

                </span>

              </div>

            </div>

          </div>

        </section>

      </template>

      <!-- MOBILE BOTTOM NAVIGATION -->
      <nav class="mobile-bottom-nav" aria-label="Mobile navigation">
        <button type="button" class="mobile-nav-item" :class="{ active: $route.path === '/dashboard' }" @click="goTo('/dashboard')" aria-label="Home">
          <span aria-hidden="true">⌂</span><small>Home</small>
        </button>
        <button type="button" class="mobile-nav-item" :class="{ active: $route.path === '/transactions' }" @click="goTo('/transactions')" aria-label="History">
          <span aria-hidden="true">☷</span><small>History</small>
        </button>
        <button type="button" class="mobile-nav-item" :class="{ active: $route.path === '/wallet' }" @click="goTo('/wallet')" aria-label="Wallet">
          <span aria-hidden="true">▣</span><small>Wallet</small>
        </button>
        <button type="button" class="mobile-nav-item" :class="{ active: $route.path === '/profile' }" @click="goTo('/profile')" aria-label="Profile">
          <span aria-hidden="true">◉</span><small>Profile</small>
        </button>
      </nav>
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

  supabase

} from '../lib/supabase'
import { useRouter } from 'vue-router'

const router = useRouter()

const loading =

  ref(true)

const fullName =

  ref('')

const accountNumber =

  ref('')

const balance =

  ref(0)

const showBalance = ref(true)

const toggleBalance = () => {

  showBalance.value = !showBalance.value

}

const totalIncome =

  ref('0.00')

const totalExpenses =

  ref('0.00')

const transactionCount =

  ref(0)

const transactions =

  ref<any[]>([])

/* =========================

   NAVIGATION

\\\\\\\\\\\\\\\\========================= */

const goTo = (path: string) => {
  void router.push(path)
}

/* =========================

   WALLET

\\\\\\\\\\\\\\\\========================= */

const openWallet = () => {
  void router.push('/wallet')
}

/* =========================

   FIRST NAME

\\\\\\\\\\\\\\\\========================= */

const firstName =

  computed(() => {

    return (

      fullName.value

        .trim()

        .split(/\s+/)[0]

      || 'User'

    )

  })

/* =========================

   INITIALS

\\\\\\\\\\\\\\\\========================= */

const initials =

  computed(() => {

    const names =

      fullName.value

        .trim()

        .split(/\s+/)

        .filter(Boolean)

    if (

      names.length >= 2

    ) {

      return (

        names[0][0] +

        names[

          names.length - 1

        ][0]

      ).toUpperCase()

    }

    return (

      names[0]?.[0]

        ?.toUpperCase()

      || 'U'

    )

  })

/* =========================

   BALANCE

\\\\\\\\\\\\\\\\========================= */

const formattedBalance =

  computed(() => {

    return balance.value.toLocaleString(

      'en-NG',

      {

        minimumFractionDigits:

          2,

        maximumFractionDigits:

          2

      }

    )

  })

/* =========================

   LOAD DASHBOARD

\\\\\\\\\\\\\\\\========================= */

const loadDashboard =

  async () => {

    loading.value = true

    try {

      /* USER */

      const {

        data: {

          user

        }

      } =

        await supabase.auth.getUser()

      if (!user) {
        await router.replace('/login')
        return
      }

      /* PROFILE */

      const {

        data: profile,

        error: profileError

      } =

        await supabase

          .from('profiles')

          .select(

            'full_name, account_number'

          )

          .eq(

            'id',

            user.id

          )

          .single()

      if (profileError) {

        console.error(

          'Profile error:',

          profileError

        )

      }

      fullName.value =

        profile?.full_name ||

        user.user_metadata?.full_name ||

        'MufasirPay User'

      accountNumber.value =

        profile?.account_number ||

        'Not assigned'

      /* WALLET */

      const {

        data: wallet,

        error: walletError

      } =

        await supabase

          .from('wallets')

          .select('balance')

          .eq(

            'user_id',

            user.id

          )

          .single()

      if (walletError) {

        console.error(

          'Wallet error:',

          walletError

        )

      }

      balance.value =

        Number(

          wallet?.balance || 0

        )

      /* TRANSACTIONS */

      const {

        data: transactionData,

        error: transactionError

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

              ascending:

                false

            }

          )

      if (transactionError) {

        console.error(

          'Transaction error:',

          transactionError

        )

      }

      transactions.value =

        transactionData || []

      transactionCount.value =

        transactions.value.length

      /* INCOME / EXPENSES */

      let income = 0

      let expenses = 0

      transactions.value.forEach(

        (transaction) => {

          const amount =

            Number(

              transaction.amount

            )

          if (

            transaction.receiver_id ===

            user.id

          ) {

            income += amount

          }

          if (

            transaction.sender_id ===

            user.id

          ) {

            expenses += amount

          }

        }

      )

      totalIncome.value =

        income.toLocaleString(

          'en-NG',

          {

            minimumFractionDigits:

              2,

            maximumFractionDigits:

              2

          }

        )

      totalExpenses.value =

        expenses.toLocaleString(

          'en-NG',

          {

            minimumFractionDigits:

              2,

            maximumFractionDigits:

              2

          }

        )

    } catch (error) {

      console.error(

        'Dashboard error:',

        error

      )

    } finally {

      loading.value = false

    }

  }

/* =========================

   LOGOUT

\\\\\\\\\\\\\\\\========================= */

const logout = async () => {
  const { error } = await supabase.auth.signOut()
  if (error) {
    console.error('Logout error:', error)
    return
  }
  await router.replace('/')
}

/* =========================

   DATE

\\\\\\\\\\\\\\\\========================= */

const formatDate =

  (date: string) => {

    return new Date(

      date

    ).toLocaleString(

      'en-NG',

      {

        dateStyle:

          'medium',

        timeStyle:

          'short'

      }

    )

  }

/* =========================

   START

\\\\\\\\\\\\\\\\========================= */

onMounted(() => {

  loadDashboard()

})

</script>

<style scoped>

* {

  box-sizing: border-box;

}

.dashboard {

  min-height: 100vh;

  background: #f7faf8;

  color: #13231d;

  display: flex;

  font-family:

    Inter,

    -apple-system,

    BlinkMacSystemFont,

    "Segoe UI",

    sans-serif;

}

/* =========================

   SIDEBAR

\\\\\\\\\\\\\\\\========================= */

.sidebar {

  width: 250px;

  min-height: 100vh;

  background:

    linear-gradient(

      180deg,

      #063b2b 0%,

      #042f24 100%

    );

  color: white;

  padding: 24px 15px;

  display: flex;

  flex-direction: column;

  position: fixed;

  left: 0;

  top: 0;

  bottom: 0;

  z-index: 100;

  box-shadow:

    8px 0 30px

    rgba(7, 67, 47, 0.08);

}

/* BRAND */

.brand {

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

  background:

    #08784f;

  transform:

    rotate(-32deg);

}

.brand-icon span {

  position: relative;

  z-index: 2;

}

.brand-text {

  display: flex;

  flex-direction: column;

}

.brand-text strong {

  font-size: 18px;

  line-height: 1.1;

  letter-spacing: -0.4px;

}

.brand-text strong span {

  color: #62df9b;

}

.brand-text small {

  margin-top: 4px;

  color: #9bc1b1;

  font-size: 10px;

  letter-spacing: 0.25px;

}

/* NAV */

.sidebar-nav {

  display: flex;

  flex-direction: column;

  gap: 6px;

}

.nav-item {

  width: 100%;

  border: none;

  background: transparent;

  padding:

    13px 14px;

  border-radius: 12px;

  color: #b4cfc3;

  display: flex;

  align-items: center;

  gap: 13px;

  font-size: 13.5px;

  font-weight: 650;

  text-align: left;

  cursor: pointer;

  transition:

    background 0.2s ease,

    color 0.2s ease,

    transform 0.2s ease;

}

.nav-item:hover {

  background:

    rgba(91, 224, 155, 0.08);

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

    rgba(7, 129, 81, 0.22);

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

/* LOGOUT */

.logout-btn {

  width: 100%;

  margin-top: auto;

  border: none;

  background:

    rgba(

      255,

      255,

      255,

      0.035

    );

  color: #b4cfc3;

  padding:

    13px 14px;

  border-radius: 12px;

  display: flex;

  align-items: center;

  gap: 13px;

  text-align: left;

  cursor: pointer;

  font-size: 13.5px;

  transition:

    background 0.2s ease,

    color 0.2s ease;

}

.logout-btn:hover {

  background:

    rgba(

      255,

      255,

      255,

      0.08

    );

  color: white;

}

/* =========================

   MAIN

\\\\\\\\\\\\\\\\========================= */

.main-content {

  margin-left: 250px;

  width:

    calc(100% - 250px);

  min-height: 100vh;

  padding:

    32px 42px 60px;

  position: relative;

}

/* =========================

   TOPBAR

\\\\\\\\\\\\\\\\========================= */

.topbar {

  display: flex;

  justify-content:

    space-between;

  align-items: center;

  margin-bottom: 25px;

}

.welcome-small {

  color: #718279;

  margin: 0 0 4px;

  font-size: 12px;

  font-weight: 600;

}

.topbar h1 {

  margin: 0;

  font-size: 29px;

  line-height: 1.1;

  letter-spacing:

    -0.7px;

  color: #10241b;

}

.topbar-subtitle {

  margin:

    6px 0 0;

  color: #82918a;

  font-size: 12px;

}

.topbar-actions {

  display: flex;

  align-items: center;

  gap: 12px;

}

.icon-button {

  width: 42px;

  height: 42px;

  border: 1px solid

    #e0ebe5;

  background: white;

  border-radius: 13px;

  color: #4d695c;

  cursor: pointer;

  font-size: 18px;

  display: flex;

  align-items: center;

  justify-content: center;

  box-shadow:

    0 5px 15px

    rgba(13, 66, 45, 0.04);

}

.user-avatar {

  width: 44px;

  height: 44px;

  border-radius: 14px;

  background:

    linear-gradient(

      135deg,

      #c9f9e1,

      #30c47f

    );

  color: #075637;

  display: flex;

  align-items: center;

  justify-content: center;

  font-weight: 800;

  font-size: 14px;

  box-shadow:

    0 6px 15px

    rgba(19, 153, 95, 0.15);

}

/* =========================

   BALANCE CARD

\\\\\\\\\\\\\\\\========================= */

.balance-card {

  position: relative;

  overflow: hidden;

  background:

    linear-gradient(

      135deg,

      #07593f 0%,

      #0a8754 48%,

      #16b66e 100%

    );

  color: white;

  border-radius: 24px;

  padding:

    30px 32px;

  min-height: 205px;

  display: flex;

  justify-content:

    space-between;

  align-items: center;

  box-shadow:

    0 18px 40px

    rgba(8, 126, 81, 0.18);

}

.balance-card::before {

  content: "";

  position: absolute;

  width: 260px;

  height: 260px;

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

  width: 180px;

  height: 180px;

  border-radius: 50%;

  right: 90px;

  bottom: -120px;

  background:

    rgba(

      255,

      255,

      255,

      0.06

    );

}

.balance-content {

  position: relative;

  z-index: 2;

}

.balance-label {

  opacity: 0.82;

  margin:

    0 0 8px;

  font-size: 12px;

  font-weight: 600;

}

.balance-label-row {

  display: flex;

  align-items: center;

  gap: 10px;

  margin-bottom: 12px;

}

.balance-label-row .balance-label {

  margin: 0;

}

.balance-toggle-btn {

  display: inline-flex;

  align-items: center;

  justify-content: center;

  width: 30px;

  height: 30px;

  padding: 0;

  flex-shrink: 0;

  border: none;

  border-radius: 8px;

  background: rgba(255, 255, 255, 0.12);

  color: #ffffff;

  cursor: pointer;

  transition: background* 0.2s ease;

}

.balance-toggle-btn:hover {

  background: rgba(255, 255, 255, 0.24);

}

.balance-toggle-btn:focus-visible {

  outline: 2px solid #ffffff;

  outline-offset: 3px;

}

.balance-card h2 {

  margin: 0;

  font-size: 39px;

  letter-spacing:

    -1.3px;

  line-height: 1;

}

.account-number {

  margin:

    14px 0 0;

  color:

    rgba(

      255,

      255,

      255,

      0.78

    );

  font-size: 11px;

}

.account-number strong {

  color: white;

  letter-spacing: 0.6px;

}

.balance-actions {

  display: flex;

  gap: 10px;

  margin-top: 22px;

}

.balance-actions button {

  border: none;

  background: white;

  color: #08784f;

  border-radius: 10px;

  padding:

    10px 16px;

  font-size: 12px;

  font-weight: 800;

  cursor: pointer;

  transition:

    transform 0.2s ease,

    box-shadow 0.2s ease;

}

.balance-actions button:hover {

  transform:

    translateY(-1px);

  box-shadow:

    0 8px 20px

    rgba(0, 0, 0, 0.12);

}

.balance-actions .outline-btn {

  background:

    transparent;

  color: white;

  border:

    1px solid

    rgba(

      255,

      255,

      255,

      0.45

    );

}

/* BALANCE ICON */

.balance-visual {

  width: 120px;

  height: 120px;

  position: relative;

  display: flex;

  align-items: center;

  justify-content: center;

  z-index: 2;

}

.wallet-symbol {

  width: 82px;

  height: 68px;

  border-radius: 18px;

  background:

    rgba(

      255,

      255,

      255,

      0.16

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

}

.wallet-symbol::before {

  content: "";

  position: absolute;

  width: 22px;

  height: 15px;

  right: 20px;

  top: 35px;

  background:

    rgba(

      255,

      255,

      255,

      0.88

    );

  border-radius:

    4px 7px 7px 4px;

}

.wallet-symbol span {

  font-size: 30px;

  font-weight: 800;

  color: white;

  transform:

    translateX(-4px);

}

.balance-glow {

  position: absolute;

  width: 120px;

  height: 120px;

  border-radius: 50%;

  background:

    rgba(

      255,

      255,

      255,

      0.055

    );

  filter:

    blur(2px);

  z-index: -1;

}

/* =========================

   STATS

\\\\\\\\\\\\\\\\========================= */

.stats-grid {

  display: grid;

  grid-template-columns:

    repeat(3, 1fr);

  gap: 16px;

  margin:

    20px 0 28px;

}

.stat-card {

  background: white;

  padding:

    19px 20px;

  border-radius: 17px;

  display: flex;

  align-items: center;

  gap: 14px;

  border:

    1px solid

    #edf3ef;

  box-shadow:

    0 7px 25px

    rgba(

      9,

      71,

      46,

      0.045

    );

  transition:

    transform 0.2s ease,

    box-shadow 0.2s ease;

}

.stat-card:hover {

  transform:

    translateY(-2px);

  box-shadow:

    0 12px 28px

    rgba(

      9,

      71,

      46,

      0.07

    );

}

.stat-card p {

  margin:

    0 0 5px;

  color: #83918a;

  font-size: 11px;

  font-weight: 600;

}

.stat-card h3 {

  margin: 0;

  font-size: 18px;

  color: #14251d;

  letter-spacing:

    -0.2px;

}

.stat-icon {

  width: 45px;

  height: 45px;

  border-radius: 13px;

  display: flex;

  align-items: center;

  justify-content: center;

  font-weight: 900;

  font-size: 19px;

}

.income-icon {

  background: #e5f9ef;

  color: #0b9b60;

}

.expense-icon {

  background: #fff0ed;

  color: #e26d58;

}

.transaction-icon-stat {

  background: #edf8f3;

  color: #087b51;

}

/* =========================

   SECTIONS

\\\\\\\\\\\\\\\\========================= */

.section {

  margin-top: 27px;

}

.section-header {

  margin-bottom: 13px;

}

.section-header h2 {

  margin: 0;

  font-size: 19px;

  color: #15271f;

  letter-spacing:

    -0.35px;

}

.section-eyebrow {

  margin:

    0 0 5px;

  color: #0b9c61;

  font-size: 9px;

  font-weight: 900;

  letter-spacing:

    1.2px;

}

/* =========================

   QUICK ACTIONS

\\\\\\\\\\\\\\\\========================= */

.actions-grid {

  display: grid;

  grid-template-columns:

    repeat(4, 1fr);

  gap: 14px;

}

.action-card {

  appearance: none;

  width: 100%;

  min-height: 152px;

  background: white;

  border:

    1px solid

    #eaf2ed;

  border-radius: 18px;

  padding: 19px;

  text-align: left;

  cursor: pointer;

  transition:

    transform 0.22s ease,

    box-shadow 0.22s ease,

    border-color 0.22s ease;

  box-shadow:

    0 7px 23px

    rgba(

      9,

      71,

      46,

      0.045

    );

  position: relative;

  font-family: inherit;

  color: inherit;

}

.action-card:hover {

  transform:

    translateY(-4px);

  border-color:

    #c7ead8;

  box-shadow:

    0 14px 28px

    rgba(

      9,

      92,

      61,

      0.09

    );

}

.action-icon {

  width: 42px;

  height: 42px;

  border-radius: 13px;

  background:

    #e5f9ef;

  color: #098354;

  display: flex;

  align-items: center;

  justify-content: center;

  font-size: 20px;

  margin-bottom: 17px;

}

.action-arrow {

  position: absolute;

  top: 20px;

  right: 19px;

  color: #9baaa2;

  font-size: 16px;

  transition:

    transform 0.2s ease,

    color 0.2s ease;

}

.action-card:hover .action-arrow {

  color: #0b9860;

  transform:

    translateX(3px);

}

.action-card h3 {

  margin:

    0 0 6px;

  font-size: 14px;

  color: #172a21;

}

.action-card p {

  margin: 0;

  color: #86938d;

  font-size: 11px;

  line-height: 1.5;

}

/* =========================

   TRANSACTIONS

\\\\\\\\\\\\\\\\========================= */

.transactions-header {

  display: flex;

  justify-content:

    space-between;

  align-items: flex-end;

}

.view-all {

  border: none;

  background:

    transparent;

  color: #09865a;

  font-size: 11px;

  font-weight: 800;

  cursor: pointer;

  padding:

    5px 0;

}

.view-all:hover {

  color: #056641;

}

.empty-state {

  background: white;

  padding:

    50px 20px;

  border:

    1px solid

    #eaf2ed;

  border-radius: 18px;

  text-align: center;

  box-shadow:

    0 7px 25px

    rgba(

      9,

      71,

      46,

      0.035

    );

}

.empty-icon {

  width: 54px;

  height: 54px;

  border-radius: 17px;

  margin:

    0 auto 13px;

  background:

    #e8f8f0;

  color:

    #0a945c;

  display: flex;

  align-items: center;

  justify-content: center;

  font-size: 23px;

}

.empty-state h3 {

  margin:

    0 0 7px;

  font-size: 15px;

}

.empty-state p {

  color: #829089;

  font-size: 12px;

  max-width: 350px;

  margin:

    0 auto;

  line-height: 1.6;

}

.transactions {

  background: white;

  border:

    1px solid

    #eaf2ed;

  border-radius: 18px;

  overflow: hidden;

  box-shadow:

    0 7px 25px

    rgba(

      9,

      71,

      46,

      0.035

    );

}

.transaction {

  padding:

    16px 20px;

  display: flex;

  justify-content:

    space-between;

  align-items: center;

  border-bottom:

    1px solid

    #eff4f1;

}

.transaction:last-child {

  border-bottom: none;

}

.transaction-left {

  display: flex;

  gap: 12px;

  align-items: center;

  min-width: 0;

}

.transaction-icon {

  width: 39px;

  height: 39px;

  flex-shrink: 0;

  border-radius: 12px;

  background:

    #e8f8f0;

  color:

    #088054;

  display: flex;

  align-items: center;

  justify-content: center;

}

.transaction h4 {

  margin:

    0 0 4px;

  font-size: 12px;

  font-weight: 750;

  color: #193027;

  white-space: nowrap;

  overflow: hidden;

  text-overflow: ellipsis;

  max-width: 400px;

}

.transaction p {

  margin: 0;

  color: #8a968f;

  font-size: 10px;

}

.transaction-right {

  display: flex;

  flex-direction: column;

  align-items: flex-end;

  gap: 3px;

  margin-left: 15px;

}

.transaction-right strong {

  font-size: 12px;

  color: #1a2b23;

}

.transaction-status {

  font-size: 9px;

  font-weight: 700;

  text-transform: capitalize;

}

.transaction-status.successful {

  color: #0b9860;

}

.transaction-status.pending {

  color: #c18419;

}

.transaction-status.failed {

  color: #cf5a4a;

}

/* =========================

   LOADING

\\\\\\\\\\\\\\\\========================= */

.loading {

  min-height: 420px;

  background: white;

  border:

    1px solid

    #eaf2ed;

  border-radius: 20px;

  display: flex;

  flex-direction: column;

  align-items: center;

  justify-content: center;

  gap: 14px;

  color: #718079;

  font-size: 13px;

}

.loading-spinner {

  width: 30px;

  height: 30px;

  border:

    3px solid

    #d9eee4;

  border-top-color:

    #0a9b61;

  border-radius: 50%;

  animation:

    spin 0.75s linear infinite;

}

@keyframes spin {

  to {

    transform:

      rotate(360deg);

  }

}

/* =========================

   FINANCIAL ANALYTICS

\\\\\\\\========================= */

.analytics-section {

  margin-top: 30px;

}

.analytics-header {

  display: flex;

  align-items: flex-end;

  justify-content: space-between;

  gap: 16px;

}

.analytics-subtitle {

  margin: 6px 0 0;

  color: #82918a;

  font-size: 12px;

  line-height: 1.5;

}

.analytics-range select {

  border: 1px solid #dce9e1;

  border-radius: 10px;

  padding: 10px 12px;

  background: #fff;

  color: #234438;

  font: inherit;

  font-size: 12px;

  cursor: pointer;

  outline: none;

}

.analytics-range select:focus {

  border-color: #0a8754;

  box-shadow: 0 0 0 3px rgba(10, 135, 84, 0.1);

}

.sr-only {

  position: absolute;

  width: 1px;

  height: 1px;

  padding: 0;

  margin: -1px;

  overflow: hidden;

  clip: rect(0, 0, 0, 0);

  white-space: nowrap;

  border: 0;

}

.analytics-summary-grid {

  display: grid;

  grid-template-columns: repeat(3, minmax(0, 1fr));

  gap: 14px;

  margin-bottom: 16px;

}

.analytics-summary-card,

.analytics-chart-card {

  min-width: 0;

  background: #fff;

  border: 1px solid #eaf2ed;

  border-radius: 17px;

  padding: 20px;

  box-shadow: 0 7px 25px rgba(9, 71, 46, 0.035);

}

.analytics-summary-top {

  display: flex;

  align-items: center;

  gap: 8px;

  color: #7b8b82;

  font-size: 11px;

  font-weight: 650;

  margin-bottom: 13px;

}

.analytics-dot,

.analytics-legend i {

  display: inline-block;

  width: 9px;

  height: 9px;

  border-radius: 50%;

  flex-shrink: 0;

}

.income-dot,

.income-legend { background: #0a9b61; }

.expense-dot,

.expense-legend { background: #f0a43a; }

.net-dot { background: #3879c9; }

.analytics-summary-card > strong {

  display: block;

  color: #172a21;

  font-size: clamp(17px, 2vw, 23px);

  letter-spacing: -0.5px;

  overflow-wrap: anywhere;

}

.analytics-summary-card small {

  display: block;

  margin-top: 8px;

  color: #91a097;

  font-size: 10px;

  line-height: 1.5;

}

.positive-value { color: #098354 !important; }

.negative-value { color: #d45c4b !important; }

.analytics-chart-card {

  margin-top: 15px;

  padding: 22px;

}

.analytics-chart-heading {

  display: flex;

  align-items: flex-start;

  justify-content: space-between;

  gap: 16px;

  margin-bottom: 20px;

}

.analytics-chart-heading h3 {

  margin: 0;

  color: #172a21;

  font-size: 15px;

}

.analytics-chart-heading p {

  margin: 6px 0 0;

  color: #8a9990;

  font-size: 11px;

  line-height: 1.5;

}

.analytics-legend {

  display: flex;

  flex-wrap: wrap;

  gap: 12px;

  color: #6e8076;

  font-size: 10px;

}

.analytics-legend span {

  display: inline-flex;

  align-items: center;

  gap: 6px;

}

.analytics-legend i {

  width: 8px;

  height: 8px;

  border-radius: 3px;

}

.analytics-chart {

  display: grid;

  grid-template-columns: repeat(7, minmax(0, 1fr));

  gap: 8px;

  min-height: 190px;

  padding-top: 8px;

}

.chart-column {

  display: flex;

  flex-direction: column;

  align-items: center;

  min-width: 0;

  gap: 12px;

}

.chart-bars {

  width: 100%;

  max-width: 44px;

  height: 155px;

  display: flex;

  align-items: flex-end;

  justify-content: center;

  gap: 4px;

  border-bottom: 1px solid #edf3ef;

  background: repeating-linear-gradient(to top, transparent 0, transparent 37px, #f1f5f2 38px, transparent 39px);

}

.chart-bar {

  width: min(38%, 17px);

  min-height: 0;

  border-radius: 5px 5px 2px 2px;

  transition: height 0.25s ease;

}

.income-bar { background: linear-gradient(180deg, #3bd18a, #078653); }

.expense-bar { background: linear-gradient(180deg, #ffd17b, #efa03a); }

.chart-day-label {

  color: #819087;

  font-size: 10px;

  white-space: nowrap;

}

.analytics-empty,

.category-empty {

  display: flex;

  flex-direction: column;

  align-items: center;

  justify-content: center;

  text-align: center;

  min-height: 145px;

  color: #84938a;

  padding: 20px;

}

.analytics-empty-icon {

  display: grid;

  place-items: center;

  width: 42px;

  height: 42px;

  border-radius: 13px;

  background: #e8f8f0;

  color: #098354;

  font-size: 22px;

  margin-bottom: 10px;

}

.analytics-empty strong {

  color: #40564a;

  font-size: 12px;

}

.analytics-empty p {

  max-width: 360px;

  margin: 7px 0 0;

  font-size: 11px;

  line-height: 1.6;

}

.analytics-footnote {

  margin: 16px 0 0;

  color: #8a9990;

  font-size: 10px;

}

.category-list {

  display: flex;

  flex-direction: column;

  gap: 18px;

}

.category-row-top {

  display: flex;

  justify-content: space-between;

  gap: 12px;

  color: #50645a;

  font-size: 12px;

  margin-bottom: 9px;

}

.category-row-top strong {

  color: #20382b;

  white-space: nowrap;

}

.category-track {

  width: 100%;

  height: 7px;

  background: #edf4ef;

  border-radius: 10px;

  overflow: hidden;

}

.category-fill {

  height: 100%;

  min-width: 2px;

  border-radius: inherit;

  background: linear-gradient(90deg, #27c47c, #08784f);

}

.category-row small {

  display: block;

  margin-top: 6px;

  color: #98a49d;

  font-size: 10px;

}

/* =========================

   RESPONSIVE

\\\\\\\\\\\\\\\\========================= */

@media (max-width: 1180px) {

  .main-content {

    padding:

      28px 28px 50px;

  }

  .actions-grid {

    grid-template-columns:

      repeat(2, 1fr);

  }

}

@media (max-width: 900px) {

  .analytics-summary-grid {

    grid-template-columns: 1fr;

  }

  .sidebar {

    width: 215px;

  }

  .main-content {

    margin-left: 215px;

    width:

      calc(100% - 215px);

    padding:

      25px 20px 45px;

  }

  .stats-grid {

    grid-template-columns:

      1fr;

  }

  .balance-card {

    padding:

      25px;

  }

}

@media (max-width: 680px) {

  .analytics-header,

  .analytics-chart-heading {

    align-items: flex-start;

    flex-direction: column;

  }

  .analytics-chart-card {

    padding: 16px;

  }

  .analytics-chart {

    gap: 4px;

  }

  .chart-bars {

    gap: 2px;

  }

  .chart-day-label {

    font-size: 9px;

  }

  .sidebar {

    position: static;

    width: 100%;

    min-height: auto;

    display: none;

  }

  .dashboard {

    display: block;

  }

  .main-content {

    margin-left: 0;

    width: 100%;

    padding:

      20px 16px 40px;

  }

  .topbar {

    margin-bottom: 18px;

  }

  .topbar h1 {

    font-size: 24px;

  }

  .topbar-subtitle {

    display: none;

  }

  .balance-card {

    min-height: auto;

    padding:

      24px 21px;

    border-radius: 20px;

  }

  .balance-card h2 {

    font-size: 31px;

  }

  .balance-visual {

    display: none;

  }

  .balance-actions {

    flex-direction: column;

    align-items: stretch;

  }

  .balance-actions button {

    width: 100%;

  }

  .actions-grid {

    grid-template-columns:

      1fr 1fr;

    gap: 11px;

  }

  .action-card {

    min-height: 145px;

    padding: 16px;

  }

  .action-card h3 {

    font-size: 12px;

  }

  .action-card p {

    font-size: 10px;

  }

  .transactions-header {

    align-items:

      center;

  }

  .transaction {

    padding:

      14px 13px;

  }

  .transaction h4 {

    max-width: 190px;

  }

}

@media (max-width: 470px) {

  .actions-grid {

    grid-template-columns:

      1fr;

  }

  .action-card {

    min-height: 128px;

  }

  .user-avatar {

    width: 40px;

    height: 40px;

    border-radius: 12px;

  }

  .icon-button {

    width: 40px;

    height: 40px;

  }

  .transaction h4 {

    max-width: 145px;

  }

}



/* Mobile-first bottom navigation */
.mobile-bottom-nav {
  display: none;
}

@media (max-width: 680px) {
  .mobile-bottom-nav {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 200;
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 4px;
    padding: 8px 8px calc(8px + env(safe-area-inset-bottom));
    background: rgba(255, 255, 255, 0.98);
    border-top: 1px solid #e5eee8;
    box-shadow: 0 -5px 24px rgba(6, 59, 43, 0.08);
    backdrop-filter: blur(14px);
  }

  .mobile-nav-item {
    display: flex;
    min-width: 0;
    min-height: 48px;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 3px;
    border: 0;
    border-radius: 12px;
    background: transparent;
    color: #819087;
    font-family: inherit;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
  }

  .mobile-nav-item span {
    font-size: 22px;
    line-height: 1.1;
  }

  .mobile-nav-item small {
    font-size: 10px;
    font-weight: 650;
  }

  .mobile-nav-item.active {
    color: #087b51;
    background: #e8f8f0;
  }

  .main-content {
    padding-bottom: calc(100px + env(safe-area-inset-bottom));
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .actions-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
  }

  .action-card {
    min-width: 0;
    min-height: 145px;
    padding: 14px;
  }

  .action-card h3 {
    font-size: 13px;
  }

  .action-card p {
    font-size: 11px;
  }

  .balance-card {
    padding: 22px 18px;
  }

  .balance-card h2 {
    font-size: clamp(25px, 7vw, 31px);
    overflow-wrap: anywhere;
  }

  .balance-visual {
    display: none;
  }

  .balance-actions {
    flex-direction: row;
    flex-wrap: wrap;
  }

  .balance-actions button {
    flex: 1 1 130px;
  }

  .transaction {
    padding: 14px 12px;
    gap: 8px;
  }

  .transaction-right {
    margin-left: 5px;
  }
}

</style>

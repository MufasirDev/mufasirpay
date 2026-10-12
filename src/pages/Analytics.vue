

<template>

  <div class="analytics-layout">
    <aside class="sidebar">
      <div class="brand">
        <div class="brand-icon"><span>M</span></div>
        <div class="brand-text"><strong>Mufasir<span>Pay</span></strong><small>Digital Banking</small></div>
      </div>
      <nav class="sidebar-nav" aria-label="Main navigation">
        <button type="button" class="nav-item" @click="goTo('/dashboard')"><span class="nav-icon">⌂</span><span>Overview</span></button>
        <button type="button" class="nav-item" @click="goTo('/wallet')"><span class="nav-icon">▣</span><span>Wallet</span></button>
        <button type="button" class="nav-item" @click="goTo('/transfer')"><span class="nav-icon">⇄</span><span>Transfer</span></button>
        <button type="button" class="nav-item" @click="goTo('/airtime')"><span class="nav-icon">◫</span><span>Airtime &amp; Data</span></button>
        <button type="button" class="nav-item" @click="goTo('/bills')"><span class="nav-icon">▤</span><span>Bills</span></button>
        <button type="button" class="nav-item" @click="goTo('/transactions')"><span class="nav-icon">☷</span><span>Transactions</span></button>
        <button type="button" class="nav-item active" aria-current="page"><span class="nav-icon">▥</span><span>Analytics</span></button>
        <button type="button" class="nav-item" @click="goTo('/profile')"><span class="nav-icon">◉</span><span>Profile</span></button>
      </nav>
      <button type="button" class="logout-btn" @click="logout"><span class="nav-icon">↪</span><span>Logout</span></button>
    </aside>
    <main class="analytics-page">
    <header class="page-header">

      <div>

        <p class="eyebrow">YOUR MONEY, CLEARLY</p>

        <h1>Spending Analytics</h1>

        <p class="subtitle">

          Understand your income and spending habits.

        </p>

      </div>



      <button class="refresh-btn" @click="loadAnalytics" :disabled="loading">

        {{ loading ? 'Loading...' : '↻ Refresh' }}

      </button>

    </header>



    <div class="filter-row">

      <label for="month-filter">Reporting month</label>

      <input

        id="month-filter"

        v-model="selectedMonth"

        type="month"

        @change="applyMonth"

      />

    </div>



    <div v-if="errorMessage" class="error-box">

      {{ errorMessage }}

      <button @click="loadAnalytics">Try again</button>

    </div>



    <div v-if="loading" class="state-box">

      Loading your financial analytics...

    </div>



    <template v-else>

      <section class="summary-grid">

        <article class="summary-card balance-card">

          <div class="card-top">

            <span>Net cash flow</span>

            <span class="icon-circle">₦</span>

          </div>

          <h2 :class="{ negative: netCashFlow < 0 }">

            {{ formatMoney(netCashFlow) }}

          </h2>

          <p>Money received minus money spent</p>

        </article>



        <article class="summary-card">

          <div class="card-top">

            <span>Money received</span>

            <span class="icon-circle income-icon">↓</span>

          </div>

          <h2>{{ formatMoney(totalIncome) }}</h2>

          <p>{{ incomeCount }} successful credit(s)</p>

        </article>



        <article class="summary-card">

          <div class="card-top">

            <span>Money spent</span>

            <span class="icon-circle expense-icon">↑</span>

          </div>

          <h2>{{ formatMoney(totalExpenses) }}</h2>

          <p>{{ expenseCount }} successful debit(s)</p>

        </article>



        <article class="summary-card">

          <div class="card-top">

            <span>Transactions</span>

            <span class="icon-circle transaction-icon">↔</span>

          </div>

          <h2>{{ successfulTransactions.length }}</h2>

          <p>Successful transactions this month</p>

        </article>

      </section>



      <section class="content-grid">

        <article class="panel">

          <div class="panel-heading">

            <div>

              <h3>Spending breakdown</h3>

              <p>Where your money went this month</p>

            </div>

          </div>



          <div v-if="totalExpenses === 0" class="empty-state">

            No successful expenses found for this month.

          </div>



          <div v-else class="category-list">

            <div

              v-for="category in spendingCategories"

              :key="category.name"

              class="category-item"

            >

              <div class="category-heading">

                <span>{{ category.name }}</span>

                <strong>{{ formatMoney(category.amount) }}</strong>

              </div>



              <div class="progress-track">

                <div

                  class="progress-fill"

                  :style="{ width: category.percentage + '%' }"

                ></div>

              </div>



              <small>{{ category.percentage }}% of spending</small>

            </div>

          </div>

        </article>



        <article class="panel">

          <div class="panel-heading">

            <div>

              <h3>Income vs expenses</h3>

              <p>Monthly cash flow comparison</p>

            </div>

          </div>



          <div class="comparison-chart">

            <div class="comparison-column">

              <div class="bar-value">

                {{ compactMoney(totalIncome) }}

              </div>

              <div class="bar-area">

                <div

                  class="chart-bar income-bar"

                  :style="{ height: barHeight(totalIncome) }"

                ></div>

              </div>

              <span>Received</span>

            </div>



            <div class="comparison-column">

              <div class="bar-value">

                {{ compactMoney(totalExpenses) }}

              </div>

              <div class="bar-area">

                <div

                  class="chart-bar expense-bar"

                  :style="{ height: barHeight(totalExpenses) }"

                ></div>

              </div>

              <span>Spent</span>

            </div>

          </div>



          <div class="chart-note">

            Figures reflect successful transactions recorded in your database.

          </div>

        </article>

      </section>



      <section class="panel monthly-panel">

        <div class="panel-heading">

          <div>

            <h3>Recent activity</h3>

            <p>Successful transactions for the selected month</p>

          </div>

          <span class="count-badge">

            {{ filteredTransactions.length }} records

          </span>

        </div>



        <div v-if="filteredTransactions.length === 0" class="empty-state">

          No successful transactions found for this month.

        </div>



        <div v-else class="table-wrapper">

          <table>

            <thead>

              <tr>

                <th>Transaction</th>

                <th>Category</th>

                <th>Date</th>

                <th>Status</th>

                <th class="amount-column">Amount</th>

              </tr>

            </thead>



            <tbody>

              <tr

                v-for="transaction in filteredTransactions.slice(0, 15)"

                :key="transaction.id"

              >

                <td>

                  <div class="transaction-title">

                    {{ transactionLabel(transaction) }}

                  </div>

                  <small class="reference">

                    {{ transaction.reference || 'No reference' }}

                  </small>

                </td>



                <td>

                  <span class="category-badge">

                    {{ categoryLabel(transaction) }}

                  </span>

                </td>



                <td>{{ formatDate(transaction.created_at) }}</td>



                <td>

                  <span class="status-badge">Successful</span>

                </td>



                <td

                  class="amount-column amount-value"

                  :class="{

                    income: isIncome(transaction),

                    expense: isExpense(transaction)

                  }"

                >

                  {{ isIncome(transaction) ? '+' : isExpense(transaction) ? '−' : '' }}

                  {{ formatMoney(Number(transaction.amount)) }}

                </td>

              </tr>

            </tbody>

          </table>

        </div>



        <p v-if="filteredTransactions.length > 15" class="table-footnote">

          Showing the latest 15 of {{ filteredTransactions.length }} transactions.

        </p>

      </section>

    </template>

    </main>
  </div>
</template>



<script setup lang="ts">

import { computed, onMounted, ref } from 'vue'

import { supabase } from '../lib/supabase'



interface Transaction {

  id: string

  sender_id: string | null

  receiver_id: string | null

  amount: number | string

  type: string

  status: string

  reference: string | null

  created_at: string

}



interface SpendingCategory {

  name: string

  amount: number

  percentage: number

}



const loading = ref(true)

const errorMessage = ref('')

const transactions = ref<Transaction[]>([])

const currentUserId = ref('')



const today = new Date()



const selectedMonth = ref(

  `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`

)



const successfulStatuses = [

  'success',

  'successful',

  'completed',

]



const normalizedType = (transaction: Transaction) =>

  String(transaction.type || '').toLowerCase().trim()



const normalizedStatus = (transaction: Transaction) =>

  String(transaction.status || '').toLowerCase().trim()



const isSuccessful = (transaction: Transaction) =>

  successfulStatuses.includes(normalizedStatus(transaction))



const isIncomingTransfer = (transaction: Transaction) =>

  normalizedType(transaction).includes('transfer') &&

  transaction.receiver_id === currentUserId.value &&

  transaction.sender_id !== currentUserId.value



const isWalletFunding = (transaction: Transaction) => {

  const type = normalizedType(transaction)



  return (

    type === 'fund_wallet' ||

    type === 'wallet_funding' ||

    type === 'wallet_fund' ||

    type === 'deposit'

  ) && transaction.receiver_id === currentUserId.value

}



const isIncome = (transaction: Transaction) =>

  isWalletFunding(transaction) || isIncomingTransfer(transaction)



const isExpense = (transaction: Transaction) => {

  const type = normalizedType(transaction)



  if (isWalletFunding(transaction)) return false

  if (isIncomingTransfer(transaction)) return false



  const expenseTypes = [

    'transfer',

    'airtime',

    'data',

    'bill',

    'electricity',

    'cable',

    'tv',

    'withdrawal',

    'payment',

  ]



  return (

    transaction.sender_id === currentUserId.value &&

    expenseTypes.some((item) => type.includes(item))

  )

}



const selectedMonthTransactions = computed(() =>

  transactions.value.filter((transaction) => {

    if (!transaction.created_at) return false



    return transaction.created_at.slice(0, 7) === selectedMonth.value

  })

)



const successfulTransactions = computed(() =>

  selectedMonthTransactions.value.filter(isSuccessful)

)



const filteredTransactions = computed(() =>

  [...successfulTransactions.value].sort(

    (a, b) =>

      new Date(b.created_at).getTime() -

      new Date(a.created_at).getTime()

  )

)



const totalIncome = computed(() =>

  successfulTransactions.value.reduce(

    (sum, transaction) =>

      sum + (isIncome(transaction) ? Number(transaction.amount) : 0),

    0

  )

)



const totalExpenses = computed(() =>

  successfulTransactions.value.reduce(

    (sum, transaction) =>

      sum + (isExpense(transaction) ? Number(transaction.amount) : 0),

    0

  )

)



const netCashFlow = computed(() =>

  totalIncome.value - totalExpenses.value

)



const incomeCount = computed(() =>

  successfulTransactions.value.filter(isIncome).length

)



const expenseCount = computed(() =>

  successfulTransactions.value.filter(isExpense).length

)



const spendingCategories = computed<SpendingCategory[]>(() => {

  const categories = [

    { name: 'Transfers', match: (type: string) => type.includes('transfer') },

    { name: 'Airtime', match: (type: string) => type.includes('airtime') },

    { name: 'Data', match: (type: string) => type.includes('data') },

    {

      name: 'Bills',

      match: (type: string) =>

        ['bill', 'electricity', 'cable', 'tv'].some((item) =>

          type.includes(item)

        ),

    },

    {

      name: 'Other payments',

      match: (type: string) =>

        ['withdrawal', 'payment'].some((item) => type.includes(item)),

    },

  ]



  return categories

    .map((category) => {

      const amount = successfulTransactions.value.reduce(

        (sum, transaction) => {

          const type = normalizedType(transaction)



          return isExpense(transaction) && category.match(type)

            ? sum + Number(transaction.amount)

            : sum

        },

        0

      )



      return {

        name: category.name,

        amount,

        percentage:

          totalExpenses.value > 0

            ? Math.round((amount / totalExpenses.value) * 100)

            : 0,

      }

    })

    .filter((category) => category.amount > 0)

    .sort((a, b) => b.amount - a.amount)

})



function formatMoney(amount: number) {

  return new Intl.NumberFormat('en-NG', {

    style: 'currency',

    currency: 'NGN',

    minimumFractionDigits: 2,

    maximumFractionDigits: 2,

  }).format(amount)

}



function compactMoney(amount: number) {

  if (amount >= 1_000_000) {

    return `₦${(amount / 1_000_000).toFixed(1)}m`

  }



  if (amount >= 1_000) {

    return `₦${(amount / 1_000).toFixed(1)}k`

  }



  return `₦${Math.round(amount)}`

}



function barHeight(amount: number) {

  const max = Math.max(totalIncome.value, totalExpenses.value, 1)

  return `${Math.max(amount > 0 ? 5 : 0, (amount / max) * 100)}%`

}



function formatDate(value: string) {

  return new Intl.DateTimeFormat('en-NG', {

    day: 'numeric',

    month: 'short',

    year: 'numeric',

  }).format(new Date(value))

}



function transactionLabel(transaction: Transaction) {

  const type = normalizedType(transaction)



  if (isWalletFunding(transaction)) return 'Wallet funding'

  if (isIncomingTransfer(transaction)) return 'Money received'

  if (type.includes('airtime')) return 'Airtime purchase'

  if (type.includes('data')) return 'Data purchase'

  if (type.includes('electricity')) return 'Electricity payment'

  if (type.includes('cable') || type.includes('tv')) return 'Cable TV payment'

  if (type.includes('bill')) return 'Bill payment'

  if (type.includes('transfer')) return 'Transfer'



  return type.replaceAll('_', ' ') || 'Transaction'

}



function categoryLabel(transaction: Transaction) {

  const type = normalizedType(transaction)



  if (isWalletFunding(transaction)) return 'Wallet funding'

  if (isIncomingTransfer(transaction)) return 'Incoming transfer'

  if (type.includes('airtime')) return 'Airtime'

  if (type.includes('data')) return 'Data'

  if (

    ['bill', 'electricity', 'cable', 'tv'].some((item) =>

      type.includes(item)

    )

  ) return 'Bills'

  if (type.includes('transfer')) return 'Transfer'



  return 'Other'

}



async function loadAnalytics() {

  loading.value = true

  errorMessage.value = ''



  try {

    const {

      data: { user },

      error: authError,

    } = await supabase.auth.getUser()



    if (authError) throw authError



    if (!user) {

      throw new Error('Please sign in to view your analytics.')

    }



    currentUserId.value = user.id



    const { data, error } = await supabase

      .from('transactions')

      .select(

        'id, sender_id, receiver_id, amount, type, status, reference, created_at'

      )

      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)

      .order('created_at', { ascending: false })

      .limit(5000)



    if (error) throw error



    transactions.value = (data || []) as Transaction[]

  } catch (error) {

    console.error('Analytics loading failed:', error)



    errorMessage.value =

      error instanceof Error

        ? error.message

        : 'Unable to load analytics. Please try again.'

  } finally {

    loading.value = false

  }

}



function applyMonth() {

  // Computed values update automatically when the month changes.

}



const goTo = (path: string) => {
  window.location.assign(path)
}

const logout = async () => {
  const { error } = await supabase.auth.signOut()
  if (error) {
    console.error('Logout failed:', error)
    return
  }
  window.location.assign('/login')
}

onMounted(loadAnalytics)

</script>



<style scoped>
.app-navbar {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 22px;
  margin: 0 0 30px;
  padding: 15px 20px;
  border: 1px solid #e5eee8;
  border-radius: 16px;
  background: #fff;
  box-shadow: 0 5px 20px rgb(6 59 43 / 5%);
}
.brand {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  color: #063b2b;
  text-decoration: none;
  font-size: 19px;
  font-weight: 900;
  white-space: nowrap;
}
.brand-mark {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 11px;
  background: #063b2b;
  color: #fff;
}
.brand-accent { color: #0a8754; }
.nav-links {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  flex-wrap: wrap;
}
.nav-link {
  padding: 9px 10px;
  border-radius: 8px;
  color: #61766b;
  text-decoration: none;
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
  transition: background .2s ease, color .2s ease;
}
.nav-link:hover, .nav-link.router-link-active, .nav-link.active {
  background: #e5f9ef;
  color: #078253;
}
.profile-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 13px;
  border-radius: 9px;
  background: #063b2b;
  color: #fff;
  text-decoration: none;
  font-size: 12px;
  font-weight: 800;
  white-space: nowrap;
}
.profile-link span { font-size: 15px; }



.analytics-layout {
  min-height: 100vh;
  background: #f7faf8;
  color: #13231d;
  font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}
.sidebar {
  width: 250px; min-height: 100vh; position: fixed; inset: 0 auto 0 0; z-index: 100;
  display: flex; flex-direction: column; padding: 24px 15px; color: #fff;
  background: linear-gradient(180deg, #063b2b 0%, #042f24 100%);
  box-shadow: 8px 0 30px rgba(7, 67, 47, .08);
}
.brand { display: flex; align-items: center; gap: 12px; padding: 6px 8px 26px; margin-bottom: 16px; }
.brand-icon { display: flex; align-items: center; justify-content: center; width: 44px; height: 44px; flex-shrink: 0; border-radius: 14px; color: #063b2b; background: linear-gradient(135deg, #d8fff0, #62df9b 45%, #10a96a); font-size: 23px; font-weight: 900; }
.brand-icon span { position: relative; z-index: 1; }
.brand-text { display: flex; flex-direction: column; }
.brand-text strong { color: #fff; font-size: 18px; line-height: 1.1; letter-spacing: -.4px; }
.brand-text strong span { color: #62df9b; }
.brand-text small { margin-top: 4px; color: #9bc1b1; font-size: 10px; letter-spacing: .25px; }
.sidebar-nav { display: flex; flex-direction: column; gap: 6px; }
.nav-item, .logout-btn { width: 100%; display: flex; align-items: center; gap: 13px; padding: 13px 14px; border: 0; border-radius: 12px; color: #b4cfc3; background: transparent; text-align: left; font: 650 13.5px Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; cursor: pointer; transition: background .2s ease, color .2s ease, transform .2s ease; }
.nav-item:hover { background: rgba(91, 224, 155, .08); color: #f2fff8; transform: translateX(2px); }
.nav-item.active { color: #fff; background: linear-gradient(135deg, #0eaa69, #087b51); box-shadow: 0 8px 18px rgba(7, 129, 81, .22); }
.nav-icon { display: inline-flex; justify-content: center; width: 22px; color: #7ee6ae; font-size: 17px; }
.nav-item.active .nav-icon { color: #fff; }
.logout-btn { margin-top: auto; background: rgba(255,255,255,.035); }
.logout-btn:hover { color: #fff; background: rgba(255,255,255,.08); }
.analytics-page { margin-left: 250px; width: calc(100% - 250px); max-width: none; min-height: 100vh; }

.analytics-page {

  width: 100%;

  max-width: 1400px;

  margin: 0 auto;

  padding: 30px;

  color: #173b2e;

}



.page-header,

.panel-heading,

.card-top,

.category-heading,

.filter-row {

  display: flex;

  align-items: center;

  justify-content: space-between;

  gap: 16px;

}



.page-header {

  margin-bottom: 26px;

}



.eyebrow {

  margin: 0 0 8px;

  color: #0a8754;

  font-size: 11px;

  font-weight: 800;

  letter-spacing: 1.8px;

}



h1 {

  margin: 0;

  color: #063b2b;

  font-size: clamp(26px, 3vw, 34px);

  font-weight: 800;

}



.subtitle,

.panel-heading p {

  margin: 8px 0 0;

  color: #789087;

  font-size: 14px;

}



.refresh-btn {

  border: 0;

  border-radius: 10px;

  padding: 12px 17px;

  background: #063b2b;

  color: #fff;

  font-weight: 700;

  cursor: pointer;

}



.refresh-btn:disabled {

  opacity: 0.6;

  cursor: wait;

}



.filter-row {

  justify-content: flex-start;

  margin-bottom: 22px;

  color: #536e62;

  font-size: 13px;

  font-weight: 700;

}



.filter-row input {

  padding: 10px 12px;

  border: 1px solid #dbe9e1;

  border-radius: 9px;

  background: #fff;

  color: #173b2e;

  font: inherit;

}



.summary-grid {

  display: grid;

  grid-template-columns: repeat(4, minmax(0, 1fr));

  gap: 18px;

  margin-bottom: 22px;

}



.summary-card,

.panel {

  min-width: 0;

  border: 1px solid #e5eee8;

  border-radius: 17px;

  padding: 22px;

  background: #fff;

  box-shadow: 0 5px 20px rgb(6 59 43 / 4%);

}



.balance-card {

  background: linear-gradient(135deg, #063b2b, #0a8754);

  color: #fff;

  border: none;

}



.card-top {

  color: #789087;

  font-size: 13px;

  font-weight: 600;

}



.balance-card .card-top,

.balance-card p {

  color: #d0f0df;

}



.icon-circle {

  display: inline-flex;

  align-items: center;

  justify-content: center;

  width: 35px;

  height: 35px;

  border-radius: 11px;

  background: #e5f9ef;

  color: #078253;

  font-size: 18px;

  font-weight: 800;

}



.income-icon {

  background: #e5f9ef;

}



.expense-icon {

  background: #fff1e7;

  color: #d97706;

}



.transaction-icon {

  background: #edf1ff;

  color: #5366bd;

}



.summary-card h2 {

  margin: 24px 0 8px;

  overflow-wrap: anywhere;

  color: #063b2b;

  font-size: clamp(21px, 2vw, 28px);

  letter-spacing: -0.8px;

}



.balance-card h2 {

  color: #fff;

}



.summary-card h2.negative {

  color: #dc6b55;

}



.balance-card h2.negative {

  color: #ffe1d7;

}



.summary-card p {

  margin: 0;

  color: #789087;

  font-size: 12px;

  line-height: 1.5;

}



.content-grid {

  display: grid;

  grid-template-columns: 1fr 1fr;

  gap: 22px;

  margin-bottom: 22px;

}



.panel-heading {

  align-items: flex-start;

  margin-bottom: 26px;

}



.panel-heading h3 {

  margin: 0;

  color: #063b2b;

  font-size: 17px;

}



.panel-heading p {

  font-size: 12px;

}



.category-list {

  display: flex;

  flex-direction: column;

  gap: 23px;

}



.category-heading {

  margin-bottom: 10px;

  font-size: 13px;

}



.category-heading strong {

  color: #173b2e;

}



.progress-track {

  height: 8px;

  overflow: hidden;

  border-radius: 99px;

  background: #edf4ef;

}



.progress-fill {

  height: 100%;

  min-width: 0;

  border-radius: 99px;

  background: linear-gradient(90deg, #0a8754, #35c487);

  transition: width 0.3s ease;

}



.category-item small {

  display: block;

  margin-top: 7px;

  color: #91a49a;

  font-size: 11px;

}



.comparison-chart {

  display: flex;

  justify-content: center;

  align-items: flex-end;

  gap: 65px;

  min-height: 240px;

  padding: 5px 20px 0;

}



.comparison-column {

  display: flex;

  flex-direction: column;

  align-items: center;

  gap: 10px;

  width: 100px;

  color: #789087;

  font-size: 12px;

}



.bar-value {

  color: #365d4c;

  font-size: 13px;

  font-weight: 800;

}



.bar-area {

  display: flex;

  align-items: flex-end;

  justify-content: center;

  width: 66px;

  height: 155px;

  border-bottom: 1px solid #e5eee8;

}



.chart-bar {

  width: 100%;

  min-height: 0;

  border-radius: 9px 9px 0 0;

  transition: height 0.3s ease;

}



.income-bar {

  background: linear-gradient(180deg, #35c487, #078253);

}



.expense-bar {

  background: linear-gradient(180deg, #f6bd72, #d97706);

}



.chart-note {

  margin-top: 20px;

  padding: 12px;

  border-radius: 9px;

  background: #f6faf7;

  color: #789087;

  font-size: 11px;

  line-height: 1.5;

}



.monthly-panel {

  margin-bottom: 24px;

}



.count-badge {

  padding: 7px 10px;

  border-radius: 8px;

  background: #e5f9ef;

  color: #078253;

  font-size: 11px;

  font-weight: 800;

  white-space: nowrap;

}



.table-wrapper {

  width: 100%;

  overflow-x: auto;

}



table {

  width: 100%;

  border-collapse: collapse;

  text-align: left;

  white-space: nowrap;

}



th {

  padding: 13px 12px;

  border-bottom: 1px solid #e5eee8;

  color: #91a49a;

  font-size: 11px;

  font-weight: 800;

  text-transform: uppercase;

}



td {

  padding: 17px 12px;

  border-bottom: 1px solid #f0f4f1;

  color: #536e62;

  font-size: 12px;

}



tbody tr:last-child td {

  border-bottom: none;

}



.transaction-title {

  margin-bottom: 5px;

  color: #173b2e;

  font-weight: 800;

  text-transform: capitalize;

}



.reference {

  color: #91a49a;

  font-size: 10px;

}



.category-badge,

.status-badge {

  display: inline-block;

  padding: 6px 9px;

  border-radius: 7px;

  background: #f1f6f2;

  color: #536e62;

  font-size: 10px;

  font-weight: 700;

}



.status-badge {

  background: #e5f9ef;

  color: #078253;

}



.amount-column {

  text-align: right;

}



.amount-value {

  font-weight: 800;

}



.amount-value.income {

  color: #078253;

}



.amount-value.expense {

  color: #d97706;

}



.table-footnote {

  margin: 16px 0 0;

  color: #91a49a;

  font-size: 12px;

}



.empty-state,

.state-box {

  padding: 32px 15px;

  color: #789087;

  text-align: center;

  font-size: 13px;

}



.error-box {

  display: flex;

  align-items: center;

  justify-content: space-between;

  gap: 15px;

  margin-bottom: 20px;

  padding: 16px;

  border: 1px solid #f4c9bf;

  border-radius: 10px;

  background: #fff4f1;

  color: #a53b28;

  font-size: 13px;

}



.error-box button {

  border: 0;

  background: transparent;

  color: #a53b28;

  font-weight: 800;

  cursor: pointer;

}



@media (max-width: 1100px) {
  .app-navbar { align-items: flex-start; flex-wrap: wrap; }
  .nav-links { order: 3; width: 100%; justify-content: flex-start; }


  .summary-grid {

    grid-template-columns: repeat(2, minmax(0, 1fr));

  }

}



@media (max-width: 750px) {
  .app-navbar { gap: 12px; padding: 13px; margin-bottom: 22px; }
  .nav-links { flex-wrap: nowrap; overflow-x: auto; padding-bottom: 4px; }
  .nav-link { flex-shrink: 0; }
  .profile-link { margin-left: auto; }


  .analytics-page {

    padding: 18px 14px;

  }



  .page-header {

    align-items: flex-start;

  }



  .refresh-btn {

    padding: 10px;

    font-size: 11px;

    white-space: nowrap;

  }



  .summary-card,

  .panel {

    padding: 17px;

    border-radius: 13px;

  }



  .content-grid {

    grid-template-columns: 1fr;

  }



  .summary-card h2 {

    font-size: 21px;

  }



  .comparison-chart {

    gap: 30px;

  }

}



@media (max-width: 400px) {

  .summary-grid {

    grid-template-columns: 1fr;

  }



  .page-header {

    flex-direction: column;

  }

}


@media (max-width: 900px) {
  .sidebar { width: 215px; padding: 20px 12px; }
  .analytics-page { margin: 0 0 0 215px; width: calc(100% - 215px); max-width: none; }
}
@media (max-width: 650px) {
  .sidebar { position: sticky; top: 0; bottom: auto; width: 100%; min-height: auto; padding: 10px 12px; }
  .brand { padding: 3px 5px 10px; margin-bottom: 8px; }
  .brand-icon { width: 35px; height: 35px; border-radius: 11px; font-size: 19px; }
  .brand-text strong { font-size: 16px; }
  .sidebar-nav { flex-direction: row; gap: 6px; overflow-x: auto; padding-bottom: 4px; }
  .nav-item { width: auto; flex: 0 0 auto; padding: 9px 11px; font-size: 12px; }
  .nav-icon { width: auto; }
  .logout-btn { position: absolute; right: 12px; top: 12px; width: auto; padding: 8px; }
  .logout-btn span:last-child { display: none; }
  .analytics-page { margin: 0; width: 100%; max-width: none; }
}
@media (min-width: 901px) {
  .analytics-page { margin: 0 0 0 250px; width: calc(100% - 250px); max-width: none; }
}
</style>

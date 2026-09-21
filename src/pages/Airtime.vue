<template>
  <div class="page-shell">
    <!-- MOBILE TOP -->
    <div class="mobile-top">
      <button
        class="menu-btn"
        @click="sidebarOpen = !sidebarOpen"
      >
        ☰
      </button>

      <strong>Airtime & Data</strong>
    </div>

    <!-- OVERLAY -->
    <div
      v-if="sidebarOpen"
      class="overlay"
      @click="sidebarOpen = false"
    ></div>

    <!-- SIDEBAR -->
    <aside
      class="sidebar"
      :class="{ open: sidebarOpen }"
    >
      <div class="brand">
        <div class="brand-mark">M</div>

        <div>
          <h2>MufasirPay</h2>
          <span>Digital Banking</span>
        </div>
      </div>

      <nav>
        <button
          @click="go('/dashboard')"
          class="nav-item"
        >
          <span>⌂</span>
          Dashboard
        </button>

        <button
          @click="go('/wallet')"
          class="nav-item"
        >
          <span>◉</span>
          Wallet
        </button>

        <button
          @click="go('/transfer')"
          class="nav-item"
        >
          <span>⇄</span>
          Transfer
        </button>

        <button
          class="nav-item active"
        >
          <span>📱</span>
          Airtime & Data
        </button>

        <button
          @click="go('/bills')"
          class="nav-item"
        >
          <span>▣</span>
          Pay Bills
        </button>

        <button
          @click="go('/transactions')"
          class="nav-item"
        >
          <span>↔</span>
          Transactions
        </button>

        <button
          @click="go('/profile')"
          class="nav-item"
        >
          <span>⚙</span>
          Profile
        </button>
      </nav>

      <button
        class="logout"
        @click="logout"
      >
        <span>⇥</span>
        Logout
      </button>
    </aside>

    <!-- MAIN -->
    <main class="main-content">
      <div class="content-header">
        <div>
          <p class="eyebrow">
            MOBILE SERVICES
          </p>

          <h1>Airtime & Data</h1>

          <p class="subtitle">
            Recharge airtime or buy data instantly.
          </p>
        </div>

        <div class="balance-mini">
          <span>Wallet Balance</span>
          <strong>
            ₦{{ formatMoney(balance) }}
          </strong>
        </div>
      </div>

      <!-- SWITCH -->
      <div class="service-switch">
        <button
          :class="{
            selected:
              serviceType === 'airtime'
          }"
          @click="changeService('airtime')"
        >
          📞 Airtime
        </button>

        <button
          :class="{
            selected:
              serviceType === 'data'
          }"
          @click="changeService('data')"
        >
          📶 Data
        </button>
      </div>

      <!-- CARD -->
      <section class="service-card">

        <!-- AIRTIME -->
        <template
          v-if="serviceType === 'airtime'"
        >
          <div class="section-heading">
            <h2>Buy Airtime</h2>

            <p>
              Recharge any Nigerian network.
            </p>
          </div>

          <div class="form-grid">

            <div class="field">
              <label>Network</label>

              <select
                v-model="network"
              >
                <option value="mtn">
                  MTN
                </option>

                <option value="airtel">
                  Airtel
                </option>

                <option value="glo">
                  Glo
                </option>

                <option value="9mobile">
                  9mobile
                </option>
              </select>
            </div>

            <div class="field">
              <label>Phone Number</label>

              <input
                v-model="phone"
                maxlength="11"
                inputmode="numeric"
                placeholder="08011111111"
              />
            </div>

            <div class="field">
              <label>Amount</label>

              <input
                v-model.number="amount"
                type="number"
                min="50"
                placeholder="₦100"
              />
            </div>
          </div>

          <div class="quick-amounts">
            <button
              v-for="value in [100, 200, 500, 1000, 2000]"
              :key="value"
              @click="amount = value"
            >
              ₦{{ value }}
            </button>
          </div>

          <button
            class="primary-btn"
            :disabled="loading"
            @click="purchase"
          >
            {{
              loading
                ? 'Processing...'
                : 'Buy Airtime'
            }}
          </button>
        </template>

        <!-- DATA -->
        <template
          v-else
        >
          <div class="section-heading">
            <h2>Buy Data</h2>

            <p>
              Choose a network and data plan.
            </p>
          </div>

          <div class="form-grid">

            <div class="field">
              <label>Network</label>

              <select
                v-model="network"
                @change="loadDataPlans"
              >
                <option value="mtn">
                  MTN
                </option>

                <option value="airtel">
                  Airtel
                </option>

                <option value="glo">
                  Glo
                </option>

                <option value="9mobile">
                  9mobile
                </option>
              </select>
            </div>

            <div class="field">
              <label>Phone Number</label>

              <input
                v-model="phone"
                maxlength="11"
                inputmode="numeric"
                placeholder="08011111111"
              />
            </div>

            <div class="field full-width">
              <label>Data Plan</label>

              <select
                v-model="selectedPlanCode"
                :disabled="plansLoading"
              >
                <option value="">
                  {{
                    plansLoading
                      ? 'Loading data plans...'
                      : 'Select a data plan'
                  }}
                </option>

                <option
                  v-for="plan in dataPlans"
                  :key="
                    plan.variation_code
                  "
                  :value="
                    plan.variation_code
                  "
                >
                  {{
                    plan.name
                  }}
                  —
                  ₦{{
                    formatMoney(
                      Number(
                        plan.variation_amount
                      )
                    )
                  }}
                </option>
              </select>
            </div>
          </div>

          <div
            v-if="selectedPlan"
            class="selected-plan"
          >
            <span>
              Selected Plan
            </span>

            <strong>
              {{ selectedPlan.name }}
            </strong>

            <b>
              ₦{{
                formatMoney(
                  Number(
                    selectedPlan
                      .variation_amount
                  )
                )
              }}
            </b>
          </div>

          <button
            class="primary-btn"
            :disabled="
              loading ||
              plansLoading ||
              !selectedPlanCode
            "
            @click="purchase"
          >
            {{
              loading
                ? 'Processing...'
                : 'Buy Data'
            }}
          </button>
        </template>

        <!-- MESSAGE -->
        <div
          v-if="successMessage"
          class="message success"
        >
          ✓ {{ successMessage }}
        </div>

        <div
          v-if="errorMessage"
          class="message error"
        >
          ⚠ {{ errorMessage }}
        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import {
  computed,
  onMounted,
  ref,
} from 'vue'

import { useRouter } from 'vue-router'

import { supabase } from '../lib/supabase'

const router =
  useRouter()

const sidebarOpen =
  ref(false)

const serviceType =
  ref<'airtime' | 'data'>(
    'airtime'
  )

const network =
  ref('mtn')

const phone =
  ref('')

const amount =
  ref<number | null>(100)

const balance =
  ref(0)

const dataPlans =
  ref<any[]>([])

const selectedPlanCode =
  ref('')

const loading =
  ref(false)

const plansLoading =
  ref(false)

const successMessage =
  ref('')

const errorMessage =
  ref('')

const selectedPlan =
  computed(() =>
    dataPlans.value.find(
      (plan) =>
        plan.variation_code ===
        selectedPlanCode.value
    )
  )

function formatMoney(
  value: number
) {
  return new Intl.NumberFormat(
    'en-NG',
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }
  ).format(value)
}

function go(
  path: string
) {
  sidebarOpen.value = false

  router.push(path)
}

async function logout() {
  await supabase.auth.signOut()

  router.push('/login')
}

async function loadBalance() {
  const {
    data: sessionData,
  } =
    await supabase.auth.getSession()

  const user =
    sessionData.session?.user

  if (!user) return

  const {
    data,
    error,
  } =
    await supabase
      .from('wallets')
      .select('balance')
      .eq(
        'user_id',
        user.id
      )
      .single()

  if (!error && data) {
    balance.value =
      Number(data.balance) || 0
  }
}

async function setAuth() {
  const {
    data,
  } =
    await supabase.auth.getSession()

  const token =
    data.session?.access_token

  if (!token) {
    throw new Error(
      'Your session has expired. Please log in again.'
    )
  }

  return token
}

async function loadDataPlans() {
  try {
    plansLoading.value = true

    errorMessage.value = ''

    selectedPlanCode.value = ''

    await setAuth()

    const {
      data,
      error,
    } =
      await supabase.functions.invoke(
        'airtime',
        {
          body: {
            action:
              'variations',
            serviceType:
              'data',
            network:
              network.value,
          },
        }
      )

    if (error) {
      throw new Error(
        error.message
      )
    }

    if (!data?.success) {
      throw new Error(
        data?.message ||
          'Unable to load data plans.'
      )
    }

    dataPlans.value =
      data.variations || []
  } catch (error: any) {
    dataPlans.value = []

    errorMessage.value =
      error?.message ||
      'Unable to load data plans.'
  } finally {
    plansLoading.value = false
  }
}

async function changeService(
  type:
    | 'airtime'
    | 'data'
) {
  serviceType.value = type

  successMessage.value = ''
  errorMessage.value = ''

  selectedPlanCode.value = ''

  if (type === 'data') {
    await loadDataPlans()
  }
}

async function purchase() {
  successMessage.value = ''
  errorMessage.value = ''

  if (
    !/^\d{11}$/.test(
      phone.value
    )
  ) {
    errorMessage.value =
      'Enter a valid 11-digit Nigerian phone number.'

    return
  }

  let purchaseAmount =
    Number(amount.value)

  if (
    serviceType.value ===
    'data'
  ) {
    if (!selectedPlan.value) {
      errorMessage.value =
        'Please select a data plan.'

      return
    }

    purchaseAmount =
      Number(
        selectedPlan.value
          .variation_amount
      )
  }

  if (
    !Number.isFinite(
      purchaseAmount
    ) ||
    purchaseAmount < 50
  ) {
    errorMessage.value =
      'Minimum purchase amount is ₦50.'

    return
  }

  if (
    purchaseAmount >
    balance.value
  ) {
    errorMessage.value =
      'Insufficient wallet balance.'

    return
  }

  try {
    loading.value = true

    await setAuth()

    const {
      data,
      error,
    } =
      await supabase.functions.invoke(
        'airtime',
        {
          body: {
            action: 'pay',

            serviceType:
              serviceType.value,

            network:
              network.value,

            phone:
              phone.value,

            amount:
              purchaseAmount,

            variationCode:
              serviceType.value ===
              'data'
                ? selectedPlanCode.value
                : '',
          },
        }
      )

    if (error) {
      throw new Error(
        error.message
      )
    }

    if (
      data?.status ===
      'successful'
    ) {
      successMessage.value =
        data.message ||
        `${
          serviceType.value ===
          'data'
            ? 'Data'
            : 'Airtime'
        } purchase successful.`

      phone.value = ''

      if (
        serviceType.value ===
        'airtime'
      ) {
        amount.value = 100
      } else {
        selectedPlanCode.value =
          ''
      }

      await loadBalance()

      return
    }

    if (
      data?.status ===
      'pending'
    ) {
      successMessage.value =
        data.message ||
        'Purchase is pending.'

      await loadBalance()

      return
    }

    throw new Error(
      data?.message ||
        'Purchase failed.'
    )
  } catch (error: any) {
    errorMessage.value =
      error?.message ||
      'Unable to complete purchase.'
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await loadBalance()
})
</script>
<style scoped>

* {
  box-sizing: border-box;
}

.page-shell {
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

  z-index: 1000;

  box-shadow:
    8px 0 30px
    rgba(7, 67, 47, 0.08);

  transition:
    transform 0.3s ease;
}


/* =========================
   BRAND / LOGO
========================= */

.brand {
  display: flex;
  align-items: center;
  gap: 12px;

  padding:
    5px 8px 28px;

  margin-bottom: 14px;
}

.brand-mark {
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

/* Main white brand stroke */
.brand-mark::before {
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

/* Lower green accent */
.brand-mark::after {
  content: "";

  position: absolute;

  width: 17px;
  height: 8px;

  right: 5px;
  bottom: 7px;

  border-radius: 8px;

  background:
    #046b47;

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

.brand-mark {
  text-shadow:
    0 1px 0
    rgba(
      255,
      255,
      255,
      0.7
    );
}

.brand > div:last-child {
  min-width: 0;
}

.brand h2 {
  margin: 0;

  color: white;

  font-size: 18px;

  line-height: 1.05;

  letter-spacing:
    -0.45px;
}

.brand h2::first-letter {
  color: white;
}

.brand span {
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

nav {
  display: flex;

  flex-direction: column;

  gap: 6px;
}

.nav-item,
.logout {
  border: 0;

  background: transparent;

  color: #b4cfc3;

  padding:
    13px 14px;

  border-radius: 12px;

  text-align: left;

  cursor: pointer;

  display: flex;

  align-items: center;

  gap: 12px;

  font-size: 13.5px;

  font-weight: 650;

  transition:
    background 0.2s ease,
    color 0.2s ease,
    transform 0.2s ease;
}

.nav-item:hover {
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

.logout {
  margin-top: auto;

  color: #a9c7b9;

  background:
    rgba(
      255,
      255,
      255,
      0.035
    );
}

.logout:hover {
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
========================= */

.main-content {
  margin-left: 250px;

  padding:
    36px 42px 60px;
}


/* =========================
   HEADER
========================= */

.content-header {
  display: flex;

  justify-content:
    space-between;

  gap: 24px;

  align-items: center;

  margin-bottom: 26px;
}

.eyebrow {
  color: #0a9b61;

  font-size: 10px;

  font-weight: 900;

  letter-spacing:
    1.25px;

  margin:
    0 0 7px;
}

h1 {
  margin: 0;

  font-size: 31px;

  letter-spacing:
    -0.7px;

  color: #13271f;
}

.subtitle {
  margin:
    8px 0 0;

  color: #7c8b84;

  font-size: 12px;
}


/* =========================
   BALANCE MINI
========================= */

.balance-mini {
  background: white;

  border:
    1px solid
    #e7f1eb;

  border-radius: 15px;

  padding:
    14px 18px;

  box-shadow:
    0 8px 25px
    rgba(
      6,
      73,
      47,
      0.045
    );

  min-width: 190px;
}

.balance-mini span {
  display: block;

  color: #819089;

  font-size: 10px;

  margin-bottom: 5px;
}

.balance-mini strong {
  font-size: 18px;

  color: #163126;
}


/* =========================
   SERVICE SWITCH
========================= */

.service-switch {
  display: flex;

  gap: 8px;

  margin-bottom: 18px;
}

.service-switch button {
  border:
    1px solid
    #dcebe3;

  background: white;

  color: #446057;

  padding:
    11px 18px;

  border-radius: 11px;

  cursor: pointer;

  font-size: 12px;

  font-weight: 800;

  transition:
    background 0.2s ease,
    border-color 0.2s ease,
    color 0.2s ease,
    transform 0.2s ease;
}

.service-switch button:hover {
  transform:
    translateY(-1px);

  border-color:
    #a7dcc1;
}

.service-switch button.selected {
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
      0.14
    );
}


/* =========================
   MAIN CARD
========================= */

.service-card {
  max-width: 900px;

  background: white;

  padding: 30px;

  border-radius: 22px;

  border:
    1px solid
    #e7f1eb;

  box-shadow:
    0 10px 32px
    rgba(
      6,
      73,
      47,
      0.05
    );
}


/* =========================
   SECTION HEADING
========================= */

.section-heading h2 {
  margin:
    0 0 7px;

  color: #14271f;

  font-size: 21px;

  letter-spacing:
    -0.4px;
}

.section-heading p {
  margin:
    0 0 25px;

  color: #7d8b84;

  font-size: 12px;
}


/* =========================
   FORM
========================= */

.form-grid {
  display: grid;

  grid-template-columns:
    repeat(2, 1fr);

  gap: 18px;
}

.field {
  display: flex;

  flex-direction: column;

  gap: 8px;
}

.field.full-width {
  grid-column: 1 / -1;
}

.field label {
  font-size: 12px;

  font-weight: 750;

  color: #294037;
}

.field input,
.field select {
  width: 100%;

  border:
    1px solid
    #dce9e1;

  padding:
    13px 14px;

  border-radius: 11px;

  outline: none;

  background: white;

  color: #1c3028;

  font-size: 13px;

  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.field input::placeholder {
  color: #a3afa9;
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


/* =========================
   QUICK AMOUNTS
========================= */

.quick-amounts {
  display: flex;

  gap: 8px;

  flex-wrap: wrap;

  margin:
    19px 0;
}

.quick-amounts button {
  border:
    1px solid
    #dcebe3;

  background:
    #fbfdfc;

  color: #385148;

  padding:
    9px 14px;

  border-radius: 9px;

  cursor: pointer;

  font-size: 11px;

  font-weight: 750;

  transition:
    background 0.2s ease,
    border-color 0.2s ease,
    color 0.2s ease,
    transform 0.2s ease;
}

.quick-amounts button:hover {
  transform:
    translateY(-1px);

  background:
    #f0faf5;

  border-color:
    #a9dcc1;

  color:
    #087b51;
}


/* =========================
   DATA PLAN
========================= */

.selected-plan {
  margin:
    18px 0;

  padding:
    15px;

  border-radius:
    12px;

  background:
    linear-gradient(
      135deg,
      #edf9f3,
      #f6fcf8
    );

  border:
    1px solid
    #d4eee0;
}

.selected-plan span,
.selected-plan strong,
.selected-plan b {
  display: block;
}

.selected-plan span {
  color:
    #7a8c84;

  font-size:
    10px;

  margin-bottom:
    5px;
}

.selected-plan strong {
  color:
    #18352a;

  font-size:
    13px;
}

.selected-plan b {
  margin-top:
    5px;

  color:
    #0a925b;

  font-size:
    14px;
}


/* =========================
   PRIMARY BUTTON
========================= */

.primary-btn {
  width: 100%;

  border: none;

  background:
    linear-gradient(
      135deg,
      #0ea96a,
      #078253
    );

  color: white;

  padding:
    14px;

  border-radius:
    11px;

  cursor: pointer;

  font-weight:
    800;

  font-size:
    13px;

  margin-top:
    9px;

  box-shadow:
    0 10px 22px
    rgba(
      8,
      139,
      84,
      0.16
    );

  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.primary-btn:hover:not(:disabled) {
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

.primary-btn:disabled {
  opacity:
    0.58;

  cursor:
    not-allowed;

  box-shadow:
    none;
}


/* =========================
   MESSAGES
========================= */

.message {
  margin-top:
    16px;

  padding:
    13px 15px;

  border-radius:
    11px;

  font-size:
    12px;

  line-height:
    1.5;
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

.error {
  background:
    #fff2f0;

  color:
    #c45244;

  border:
    1px solid
    #ffd8d2;
}


/* =========================
   MOBILE HEADER
========================= */

.mobile-top {
  display: none;
}


/* =========================
   RESPONSIVE
========================= */

@media (max-width: 900px) {

  .sidebar {
    transform:
      translateX(-100%);

    transition:
      transform 0.25s ease;
  }

  .sidebar.open {
    transform:
      translateX(0);
  }

  .mobile-top {
    display: flex;

    position: sticky;

    top: 0;

    z-index: 900;

    height: 62px;

    align-items: center;

    gap: 12px;

    background:
      #063b2b;

    color: white;

    padding:
      0 16px;

    box-shadow:
      0 5px 15px
      rgba(
        4,
        50,
        37,
        0.12
      );
  }

  .mobile-top strong {
    font-size:
      14px;
  }

  .menu-btn {
    width: 40px;
    height: 40px;

    border: none;

    background:
      transparent;

    color: white;

    font-size:
      22px;

    cursor: pointer;

    display: flex;

    align-items: center;

    justify-content: center;
  }

  .overlay {
    display: block;

    position: fixed;

    inset: 0;

    background:
      rgba(
        0,
        0,
        0,
        0.38
      );

    z-index: 950;
  }

  .main-content {
    margin-left: 0;

    padding:
      24px 18px 40px;
  }

  .content-header {
    align-items:
      flex-start;

    flex-direction:
      column;
  }

  .balance-mini {
    width: 100%;
  }

  .form-grid {
    grid-template-columns:
      1fr;
  }

  .field.full-width {
    grid-column:
      auto;
  }

  h1 {
    font-size:
      27px;
  }

  .service-card {
    padding:
      22px;
  }

}


@media (max-width: 600px) {

  .main-content {
    padding:
      20px 14px 35px;
  }

  .service-card {
    padding:
      20px 16px;

    border-radius:
      18px;
  }

  .service-switch button {
    flex: 1;

    padding:
      11px 8px;
  }

  .balance-mini {
    padding:
      14px 15px;
  }

  .section-heading h2 {
    font-size:
      19px;
  }

}


/* =========================
   VERY SMALL DEVICES
========================= */

@media (max-width: 390px) {

  .brand-mark {
    width: 43px;
    height: 43px;

    border-radius:
      13px;

    font-size:
      22px;
  }

  .quick-amounts {
    display: grid;

    grid-template-columns:
      repeat(2, 1fr);
  }

  .quick-amounts button {
    width:
      100%;
  }

}

</style>
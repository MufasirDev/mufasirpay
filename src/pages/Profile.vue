<template>

  <div class="profile-page">

    <!-- Sidebar -->

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

          @click="go('/transactions')"

        >

          <span class="nav-icon">☷</span>

          <span>Transactions</span>

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



    <!-- Mobile Overlay -->

    <div

      v-if="sidebarOpen"

      class="overlay"

      @click="sidebarOpen = false"

    ></div>



    <!-- Main Content -->

    <div class="main-area">

      <!-- Topbar -->

      <header class="topbar">

        <button

          type="button"

          class="menu-btn"

          @click="sidebarOpen = !sidebarOpen"

        >

          ☰

        </button>



        <div class="topbar-title">

          <h2>Profile & Settings</h2>

          <p>Manage your MufasirPay account</p>

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



      <!-- Content -->

      <main class="content">

        <!-- Profile Header -->

        <section class="profile-header-card">

          <div class="avatar">

            {{ initials }}

          </div>



          <div class="profile-header-info">

            <h2>

              {{ fullName || 'MufasirPay User' }}

            </h2>



            <p>{{ email }}</p>



            <span class="account-badge">

              MufasirPay Account

            </span>

          </div>

        </section>



        <!-- Personal Information -->

        <section class="card">

          <div class="card-header">

            <div>

              <h2>Personal Information</h2>



              <p>

                Your registered account information.

              </p>

            </div>



            <button

              v-if="!isEditing"

              type="button"

              class="edit-btn"

              @click="startEditing"

            >

              Edit Profile

            </button>

          </div>



          <div class="form-grid">

            <!-- Full Name -->

            <div class="field">

              <label>Full Name</label>



              <input

                v-model="fullName"

                type="text"

                :disabled="!isEditing"

                placeholder="Enter your full name"

              />

            </div>



            <!-- Email -->

            <div class="field">

              <label>Email Address</label>



              <input

                v-model="email"

                type="email"

                disabled

              />



              <small>

                Email address is managed by Supabase Auth.

              </small>

            </div>



            <!-- Phone -->

            <div class="field">

              <label>Phone Number</label>



              <input

                v-model="phone"

                type="tel"

                maxlength="11"

                :disabled="!isEditing"

                placeholder="08012345678"

                @input="

                  phone = phone

                    .replace(/\D/g, '')

                    .slice(0, 11)

                "

              />

            </div>



            <!-- Account Number -->

            <div class="field">

              <label>Account Number</label>



              <div class="account-input">

                <input

                  v-model="accountNumber"

                  type="text"

                  disabled

                />



                <button

                  type="button"

                  @click="copyAccountNumber"

                >

                  {{ copied ? 'Copied' : 'Copy' }}

                </button>

              </div>

            </div>

          </div>



          <!-- Edit Actions -->

          <div

            v-if="isEditing"

            class="edit-actions"

          >

            <button

              type="button"

              class="cancel-btn"

              @click="cancelEditing"

            >

              Cancel

            </button>



            <button

              type="button"

              class="save-btn"

              :disabled="isSaving"

              @click="saveProfile"

            >

              {{

                isSaving

                  ? 'Saving...'

                  : 'Save Changes'

              }}

            </button>

          </div>



          <div

            v-if="successMessage"

            class="message success-message"

          >

            ✓ {{ successMessage }}

          </div>



          <div

            v-if="errorMessage"

            class="message error-message"

          >

            ⚠ {{ errorMessage }}

          </div>

        </section>

        <!-- KYC & Account Verification -->

        <section class="card kyc-card">

          <div class="card-header">

            <div>

              <h2>Identity Verification</h2>

              <p>

                Verify your identity to prepare your account for additional

                financial services.

              </p>

            </div>



            <span

  class="kyc-status"

  :class="`kyc-status-${kycStatus}`"

>

  {{ kycLoading ? 'Loading...' : formatKycStatus(kycStatus) }}

</span>

          </div>



          <div class="kyc-content">

            <div class="kyc-icon" aria-hidden="true">

              🛡️

            </div>



            <div class="kyc-details">

              <h3>Protect your MufasirPay account</h3>



              <p>

                Identity verification helps protect your account and supports

                applicable financial compliance requirements.

              </p>



              <ul>

                <li>Secure identity verification</li>

                <li>Verification status tracking</li>

                <li>

                  Access to eligible services based on verification level

                </li>

              </ul>



              <button

                type="button"

                class="kyc-button"

                @click="showKycInfo = !showKycInfo"

              >

                {{

                  showKycInfo

                    ? 'Close information'

                    : 'Start verification'

                }}

                <span aria-hidden="true">→</span>

              </button>





                <div v-if="kycError" class="kyc-result" role="alert">{{ kycError }}</div>
              <div v-if="kycMessage" class="kyc-result" role="status">{{ kycMessage }}</div>
              <div v-if="showKycInfo && kycStatus !== 'verified'" class="kyc-info">
                <h3>Verify your identity</h3>
                <p>Enter your details exactly as they appear in your official identity records. Your information will be sent to the configured verification provider.</p>
                <form @submit.prevent="submitKyc">
                  <div class="kyc-field">
                    <label for="kyc-id-type">Identity type</label>
                    <select id="kyc-id-type" v-model="kycForm.idType" required>
                      <option value="nin">National Identification Number (NIN)</option>
                      <option value="bvn">Bank Verification Number (BVN)</option>
                    </select>
                  </div>
                  <div class="kyc-field">
                    <label for="kyc-id-number">Identity number</label>
                    <input id="kyc-id-number" v-model="kycForm.idNumber" type="password" inputmode="numeric" autocomplete="off" maxlength="11" minlength="11" pattern="[0-9]{11}" placeholder="Enter your 11-digit number" required />
                  </div>
                  <div class="kyc-field">
                    <label for="kyc-first-name">First name</label>
                    <input id="kyc-first-name" v-model.trim="kycForm.firstName" type="text" maxlength="100" autocomplete="given-name" placeholder="Enter your first name" required />
                  </div>
                  <div class="kyc-field">
                    <label for="kyc-last-name">Last name</label>
                    <input id="kyc-last-name" v-model.trim="kycForm.lastName" type="text" maxlength="100" autocomplete="family-name" placeholder="Enter your last name" required />
                  </div>
                  <div class="kyc-field">
                    <label for="kyc-dob">Date of birth</label>
                    <input id="kyc-dob" v-model="kycForm.dateOfBirth" type="date" :max="new Date().toISOString().slice(0, 10)" required />
                  </div>
                  <label class="kyc-consent">
                    <input v-model="kycConsent" type="checkbox" required />
                    <span>I consent to the processing of my identity details for identity verification.</span>
                  </label>
                  <button type="submit" class="kyc-button" :disabled="kycSubmitting || !kycConsent">
                    {{ kycSubmitting ? 'Verifying...' : 'Submit for verification' }}
                  </button>
                </form>
              </div>

            </div>

          </div>

        </section>

 <p v-if="kycError" class="kyc-error">

  {{ kycError }}

</p>



        <!-- Security -->

        <section class="card">

          <div class="card-header">

            <div>

              <h2>Security</h2>



              <p>

                Manage your account security.

              </p>

            </div>

          </div>



          <div class="security-item">

            <div>

              <h3>Change Password</h3>



              <p>

                Update your account password.

              </p>

            </div>



            <button

              type="button"

              class="secondary-btn"

              @click="changePassword"

            >

              Change Password

            </button>

          </div>

        </section>



        <!-- Account -->

        <section class="card danger-card">

          <div class="card-header">

            <div>

              <h2>Account</h2>



              <p>

                Manage your MufasirPay session.

              </p>

            </div>

          </div>



          <button

            type="button"

            class="logout-btn"

            :disabled="isLoggingOut"

            @click="logout"

          >

            {{

              isLoggingOut

                ? 'Logging out...'

                : 'Log Out'

            }}

          </button>

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



import { useRouter } from 'vue-router'



import { supabase } from '../lib/supabase'



const router = useRouter()



// ----------------------------------

// STATE

// ----------------------------------



const sidebarOpen = ref(false)



const fullName = ref('')

const phone = ref('')

const email = ref('')

const accountNumber = ref('')



const originalFullName = ref('')

const originalPhone = ref('')



const isEditing = ref(false)

const isSaving = ref(false)

const isLoggingOut = ref(false)



const successMessage = ref('')

const errorMessage = ref('')



const copied = ref(false)

const showKycInfo = ref(false)

const kycStatus = ref('not_started')

const kycLoading = ref(false)

const kycError = ref('')



const kycForm = ref({ idType: 'nin', idNumber: '', firstName: '', lastName: '', dateOfBirth: '' })
const kycConsent = ref(false)
const kycSubmitting = ref(false)
const kycMessage = ref('')

async function loadKycStatus() {
  kycLoading.value = true
  kycError.value = ''
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      kycError.value = 'Please log in to view your verification status.'
      return
    }
    const { data, error } = await supabase.from('kyc_verifications').select('status').eq('user_id', user.id).maybeSingle()
    if (error) throw error
    kycStatus.value = data?.status || 'not_started'
  } catch (error) {
    console.error('Unable to load KYC status:', error)
    kycError.value = 'Unable to load verification status. Please try again.'
  } finally {
    kycLoading.value = false
  }
}

async function submitKyc() {
  const { data: { session }, error } =
  await supabase.auth.getSession()

console.log('Has active session:', !!session)
console.log('Session error:', error?.message)
  kycError.value = ''
  kycMessage.value = ''
  if (!kycConsent.value) {
    kycError.value = 'Please consent to identity verification before continuing.'
    return
  }
  const idNumber = kycForm.value.idNumber.trim()
  const firstName = kycForm.value.firstName.trim()
  const lastName = kycForm.value.lastName.trim()
  const dateOfBirth = kycForm.value.dateOfBirth
  if (!/^\d{11}$/.test(idNumber)) {
    kycError.value = 'Your NIN or BVN must contain exactly 11 digits.'
    return
  }
  if (!firstName || !lastName || !dateOfBirth) {
    kycError.value = 'Please complete all required fields.'
    return
  }
  if (dateOfBirth >= new Date().toISOString().slice(0, 10)) {
    kycError.value = 'Please enter a valid date of birth.'
    return
  }
  kycSubmitting.value = true
  try {
    const { data: { session }, error: authError } = await supabase.auth.getSession()
    if (authError || !session) throw new Error('Your session has expired. Please log in again.')
    console.log(
  'Access token available:',
  !!session?.access_token,
)
    const { data, error } = await supabase.functions.invoke('verify-identity', {
      body: { idType: kycForm.value.idType, idNumber, firstName, lastName, dateOfBirth },
    })
    if (error) {
      console.error('Identity verification request failed:', error)
      throw new Error('We could not complete verification. Please try again later.')
    }
    if (data?.error) throw new Error(data.error)
    if (data?.status === 'verified') {
      kycStatus.value = 'verified'
      kycMessage.value = 'Your identity has been verified successfully.'
      showKycInfo.value = false
      kycForm.value.idNumber = ''
    } else if (data?.status === 'rejected') {
      kycStatus.value = 'rejected'
      kycMessage.value = data.message || 'Your identity could not be verified.'
      kycForm.value.idNumber = ''
    } else {
      kycMessage.value = data?.message || 'Your verification could not be confirmed. Please try again or contact support.'
    }
    await loadKycStatus()
  } catch (error: unknown) {
    console.error('KYC submission error:', error)
    kycError.value = error instanceof Error ? error.message : 'Something went wrong during verification.'
  } finally {
    kycSubmitting.value = false
  }
}

function formatKycStatus(status: string) {
  const labels: Record<string, string> = {
    not_started: 'Not verified', pending: 'Pending review', submitted: 'Submitted',
    verified: 'Verified', rejected: 'Verification unsuccessful', failed: 'Verification failed',
  }
  return labels[status] || 'Pending review'
}

// INITIALS

// ----------------------------------



const initials = computed(() => {

  const name = fullName.value.trim()



  if (!name) {

    return 'M'

  }



  const parts = name.split(/\s+/)



  if (parts.length === 1) {

    return parts[0]

      .charAt(0)

      .toUpperCase()

  }



  return (

    parts[0].charAt(0) +

    parts[parts.length - 1].charAt(0)

  ).toUpperCase()

})



// ----------------------------------

// NAVIGATION

// ----------------------------------



function go(path: string) {

  sidebarOpen.value = false

  router.push(path)

}



// ----------------------------------

// LOAD PROFILE

// ----------------------------------



async function loadProfile() {

  try {

    errorMessage.value = ''



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

      data,

      error

    } =

      await supabase

        .from('profiles')

        .select(

          'full_name, phone, account_number'

        )

        .eq(

          'id',

          session.user.id

        )

        .single()



    if (error) {

      console.error(

        'Profile loading error:',

        error

      )



      errorMessage.value =

        'Unable to load your profile.'



      return

    }



    fullName.value =

      data?.full_name || ''



    phone.value =

      data?.phone || ''



    accountNumber.value =

      data?.account_number || ''



    originalFullName.value =

      fullName.value



    originalPhone.value =

      phone.value

  } catch (error) {

    console.error(

      'Profile error:',

      error

    )



    errorMessage.value =

      'Something went wrong while loading your profile.'

  }

}



// ----------------------------------

// EDIT

// ----------------------------------



function startEditing() {

  successMessage.value = ''

  errorMessage.value = ''



  originalFullName.value =

    fullName.value



  originalPhone.value =

    phone.value



  isEditing.value = true

}



function cancelEditing() {

  fullName.value =

    originalFullName.value



  phone.value =

    originalPhone.value



  isEditing.value = false



  successMessage.value = ''

  errorMessage.value = ''



}



// ----------------------------------

// SAVE PROFILE

// ----------------------------------



async function saveProfile() {

  successMessage.value = ''

  errorMessage.value = ''



  const cleanedName =

    fullName.value.trim()



  const cleanedPhone =

    phone.value

      .replace(/\D/g, '')

      .trim()



  if (!cleanedName) {

    errorMessage.value =

      'Please enter your full name.'



    return

  }



  if (

    cleanedPhone &&

    !/^\d{11}$/.test(

      cleanedPhone

    )

  ) {

    errorMessage.value =

      'Please enter a valid 11-digit phone number.'



    return

  }



  isSaving.value = true



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



    const {

      error

    } =

      await supabase

        .from('profiles')

        .update({

          full_name:

            cleanedName,

          phone:

            cleanedPhone || null

        })

        .eq(

          'id',

          session.user.id

        )



    if (error) {

      throw new Error(

        error.message ||

          'Unable to update profile.'

      )

    }



    fullName.value =

      cleanedName



    phone.value =

      cleanedPhone



    originalFullName.value =

      cleanedName



    originalPhone.value =

      cleanedPhone



    isEditing.value = false



    successMessage.value =

      'Profile updated successfully.'

  } catch (error: any) {

    console.error(

      'Save profile error:',

      error

    )



    errorMessage.value =

      error?.message ||

      'Unable to save your profile.'

  } finally {

    isSaving.value = false

  }

}



// ----------------------------------

// COPY ACCOUNT NUMBER

// ----------------------------------



async function copyAccountNumber() {

  if (!accountNumber.value) {

    return

  }



  try {

    await navigator.clipboard.writeText(

      accountNumber.value

    )



    copied.value = true



    setTimeout(() => {

      copied.value = false

    }, 2000)

  } catch (error) {

    console.error(

      'Copy error:',

      error

    )



    errorMessage.value =

      'Unable to copy account number.'

  }

}



// ----------------------------------

// CHANGE PASSWORD

// ----------------------------------



async function changePassword() {

  errorMessage.value = ''

  successMessage.value = ''



  const {

    data: {

      session

    }

  } =

    await supabase.auth.getSession()



  if (!session?.user?.email) {

    errorMessage.value =

      'Your session has expired. Please log in again.'



    return

  }



  try {

    const {

      error

    } =

      await supabase.auth.resetPasswordForEmail(

        session.user.email,

        {

          redirectTo:

            `${window.location.origin}/login`

        }

      )



    if (error) {

      throw error

    }



    successMessage.value =

      'A password reset link has been sent to your email.'

  } catch (error: any) {

    console.error(

      'Password reset error:',

      error

    )



    errorMessage.value =

      error?.message ||

      'Unable to send the password reset email.'

  }

}



// ----------------------------------

// LOGOUT

// ----------------------------------



async function logout() {

  errorMessage.value = ''

  successMessage.value = ''



  isLoggingOut.value = true



  try {

    const {

      error

    } =

      await supabase.auth.signOut()



    if (error) {

      throw error

    }



    router.push('/login')

  } catch (error: any) {

    console.error(

      'Logout error:',

      error

    )



    errorMessage.value =

      error?.message ||

      'Unable to log out.'

  } finally {

    isLoggingOut.value = false

  }

}



// ----------------------------------

// PAGE LOAD

// ----------------------------------



onMounted(() => {

  loadProfile()

  loadKycStatus()

})

</script>



<style scoped>



* {

  box-sizing: border-box;

}



.profile-page {

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



  padding: 24px 15px;



  box-shadow:

    8px 0 30px

    rgba(

      7,

      67,

      47,

      0.08

    );

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



.sidebar-brand h1 {

  margin: 0;



  color: white;



  font-size: 18px;



  font-weight: 800;



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





/* =================================

   SIDEBAR NAV

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

   MAIN

================================= */



.main-area {

  margin-left: 250px;



  min-height: 100vh;



  background: #f7faf8;

}





/* =================================

   TOPBAR

================================= */



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

    #e5eee9;



  padding:

    0 30px;



  display: flex;



  align-items: center;



  justify-content: space-between;



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



  color:

    #162a21;



  letter-spacing:

    -0.4px;

}



.topbar-title p {

  margin:

    3px 0 0;



  color:

    #7b8b84;



  font-size:

    11px;

}



.topbar-user {

  display:

    flex;



  align-items:

    center;



  gap:

    10px;

}



.top-avatar {

  width:

    42px;



  height:

    42px;



  border-radius:

    13px;



  background:

    linear-gradient(

      135deg,

      #d8fff0,

      #61dc9b

    );



  color:

    #087b51;



  display:

    flex;



  align-items:

    center;



  justify-content:

    center;



  font-weight:

    800;



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

  display:

    block;



  font-size:

    12px;



  color:

    #1a2d24;

}



.top-user-info span {

  display:

    block;



  margin-top:

    2px;



  color:

    #7b8b84;



  font-size:

    10px;

}





/* =================================

   CONTENT

================================= */



.content {

  width:

    min(

      950px,

      94%

    );



  margin:

    30px auto 60px;

}





/* =================================

   PROFILE HEADER

================================= */



.profile-header-card {

  background:

    white;



  border-radius:

    22px;



  padding:

    28px;



  display:

    flex;



  align-items:

    center;



  gap:

    20px;



  margin-bottom:

    22px;



  border:

    1px solid

    #e6f0ea;



  box-shadow:

    0 10px 30px

    rgba(

      8,

      74,

      49,

      0.05

    );

}



.avatar {

  width:

    80px;



  height:

    80px;



  min-width:

    80px;



  border-radius:

    22px;



  background:

    linear-gradient(

      135deg,

      #0ea96a,

      #087b51

    );



  color:

    white;



  display:

    flex;



  align-items:

    center;



  justify-content:

    center;



  font-size:

    25px;



  font-weight:

    850;



  box-shadow:

    0 12px 25px

    rgba(

      8,

      139,

      84,

      0.17

    );



  position:

    relative;



  overflow:

    hidden;

}



.avatar::after {

  content:

    "";



  position:

    absolute;



  width:

    75px;



  height:

    75px;



  border-radius:

    50%;



  right:

    -38px;



  top:

    -38px;



  background:

    rgba(

      255,

      255,

      255,

      0.1

    );

}



.profile-header-info h2 {

  margin:

    0;



  font-size:

    25px;



  color:

    #172b22;



  letter-spacing:

    -0.5px;

}



.profile-header-info p {

  margin:

    6px 0 10px;



  color:

    #7b8b84;



  font-size:

    12px;

}



.account-badge {

  display:

    inline-block;



  background:

    #eaf9f1;



  color:

    #087b51;



  padding:

    6px 10px;



  border-radius:

    999px;



  font-size:

    10px;



  font-weight:

    800;



  border:

    1px solid

    #cbe9d9;

}





/* =================================

   CARDS

================================= */



.card {

  background:

    white;



  padding:

    28px;



  border-radius:

    22px;



  margin-bottom:

    22px;



  border:

    1px solid

    #e6f0ea;



  box-shadow:

    0 10px 30px

    rgba(

      8,

      74,

      49,

      0.05

    );

}



.card-header {

  display:

    flex;



  align-items:

    flex-start;



  justify-content:

    space-between;



  gap:

    20px;



  margin-bottom:

    25px;

}



.card-header h2 {

  margin:

    0;



  font-size:

    20px;



  color:

    #172b22;

}



.card-header p {

  margin:

    6px 0 0;



  color:

    #7c8c84;



  font-size:

    12px;

}





/* =================================

   EDIT BUTTON

================================= */



.edit-btn {

  border:

    1px solid

    #cbe9d9;



  background:

    #f0faf5;



  color:

    #087b51;



  padding:

    10px 15px;



  border-radius:

    10px;



  cursor:

    pointer;



  font-weight:

    800;



  font-size:

    11px;



  transition:

    background 0.2s ease,

    transform 0.2s ease;

}



.edit-btn:hover {

  background:

    #e4f7ed;



  transform:

    translateY(-1px);

}





/* =================================

   FORM

================================= */



.form-grid {

  display:

    grid;



  grid-template-columns:

    repeat(2, 1fr);



  gap:

    20px;

}



.field label {

  display:

    block;



  margin-bottom:

    8px;



  font-size:

    12px;



  font-weight:

    750;



  color:

    #30463c;

}



.field input {

  width:

    100%;



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



  color:

    #1a3026;



  background:

    white;



  transition:

    border-color 0.2s ease,

    box-shadow 0.2s ease;

}



.field input:focus {

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



.field input:disabled {

  background:

    #f5f9f7;



  color:

    #587066;



  cursor:

    not-allowed;

}



.field small {

  display:

    block;



  margin-top:

    6px;



  color:

    #96a39d;



  font-size:

    10px;

}





/* =================================

   ACCOUNT NUMBER

================================= */



.account-input {

  display:

    flex;



  gap:

    8px;

}



.account-input input {

  flex:

    1;

}



.account-input button {

  border:

    none;



  background:

    #063b2b;



  color:

    white;



  padding:

    0 15px;



  border-radius:

    11px;



  cursor:

    pointer;



  font-weight:

    800;



  font-size:

    11px;



  transition:

    background 0.2s ease;

}



.account-input button:hover {

  background:

    #087b51;

}





/* =================================

   EDIT ACTIONS

================================= */



.edit-actions {

  display:

    flex;



  justify-content:

    flex-end;



  gap:

    10px;



  margin-top:

    25px;

}



.cancel-btn,

.save-btn {

  border:

    none;



  padding:

    12px 18px;



  border-radius:

    10px;



  cursor:

    pointer;



  font-weight:

    800;



  font-size:

    12px;

}



.cancel-btn {

  background:

    #edf3f0;



  color:

    #53655d;

}



.cancel-btn:hover {

  background:

    #e3ebe7;

}



.save-btn {

  background:

    linear-gradient(

      135deg,

      #0ea96a,

      #078253

    );



  color:

    white;



  box-shadow:

    0 8px 18px

    rgba(

      8,

      139,

      84,

      0.15

    );

}



.save-btn:hover:not(:disabled) {

  transform:

    translateY(-1px);

}



.save-btn:disabled {

  opacity:

    0.6;



  cursor:

    not-allowed;



  box-shadow:

    none;

}





/* =================================

   MESSAGES

================================= */



.message {

  margin-top:

    20px;



  padding:

    13px 15px;



  border-radius:

    10px;



  font-size:

    12px;



  line-height:

    1.5;

}



.success-message {

  background:

    #eafaf2;



  color:

    #078052;



  border:

    1px solid

    #c8edd9;

}



.error-message {

  background:

    #fff2f0;



  color:

    #c45244;



  border:

    1px solid

    #ffd8d2;

}





/* =================================

   SECURITY

================================= */



.security-item {

  display:

    flex;



  align-items:

    center;



  justify-content:

    space-between;



  gap:

    20px;



  padding:

    18px;



  border:

    1px solid

    #dfece5;



  border-radius:

    14px;



  background:

    #fbfdfc;

}



.security-item h3 {

  margin:

    0;



  font-size:

    14px;



  color:

    #193128;

}



.security-item p {

  margin:

    5px 0 0;



  color:

    #7c8c84;



  font-size:

    11px;

}



.secondary-btn {

  border:

    1px solid

    #cbe5d7;



  background:

    white;



  color:

    #087b51;



  padding:

    11px 15px;



  border-radius:

    10px;



  cursor:

    pointer;



  font-weight:

    800;



  font-size:

    11px;

}



.secondary-btn:hover {

  background:

    #f0faf5;

}





/* =================================

   DANGER AREA

================================= */



.danger-card {

  border:

    1px solid

    #f5d8d3;



  background:

    #fffdfc;

}



.logout-btn {

  width:

    100%;



  border:

    1px solid

    #f4cfc8;



  background:

    #fff5f3;



  color:

    #c45244;



  padding:

    14px;



  border-radius:

    11px;



  cursor:

    pointer;



  font-weight:

    800;



  font-size:

    12px;



  transition:

    background 0.2s ease,

    transform 0.2s ease;

}



.logout-btn:hover:not(:disabled) {

  background:

    #ffebe7;



  transform:

    translateY(-1px);

}



.logout-btn:disabled {

  opacity:

    0.6;



  cursor:

    not-allowed;

}





/* =================================

   MOBILE OVERLAY

================================= */



.overlay {

  display:

    none;

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





/* =================================

   MOBILE

================================= */



@media (max-width: 700px) {



  .content {

    width:

      94%;



    margin-top:

      22px;

  }



  .profile-header-card {

    padding:

      22px;

  }



  .card {

    padding:

      22px;

  }



  .form-grid {

    grid-template-columns:

      1fr;

  }



  .card-header {

    flex-direction:

      column;

  }



  .security-item {

    flex-direction:

      column;



    align-items:

      stretch;

  }



  .secondary-btn {

    width:

      100%;

  }



  .top-user-info {

    display:

      none;

  }

}





/* =================================

   SMALL MOBILE

================================= */



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



  .profile-header-card {

    align-items:

      flex-start;



    flex-direction:

      column;

  }



  .avatar {

    width:

      64px;



    height:

      64px;



    min-width:

      64px;



    border-radius:

      18px;



    font-size:

      20px;

  }



  .profile-header-info h2 {

    font-size:

      20px;

  }



  .account-input {

    flex-direction:

      column;

  }



  .account-input button {

    padding:

      11px;

  }



  .edit-actions {

    flex-direction:

      column-reverse;

  }



  .cancel-btn,

  .save-btn {

    width:

      100%;

  }

}



/* KYC & ACCOUNT VERIFICATION */



.kyc-card {

  margin-top: 24px;

}



.kyc-status {

  display: inline-flex;

  align-items: center;

  white-space: nowrap;

  padding: 7px 12px;

  border-radius: 20px;

  background: #fff4d6;

  color: #8a5a00;

  font-size: 12px;

  font-weight: 700;

}



.kyc-content {

  display: flex;

  align-items: flex-start;

  gap: 18px;

  margin-top: 22px;

}



.kyc-icon {

  width: 52px;

  height: 52px;

  flex-shrink: 0;

  display: flex;

  align-items: center;

  justify-content: center;

  border-radius: 14px;

  background: #e5f6ed;

  font-size: 25px;

}



.kyc-details {

  flex: 1;

  min-width: 0;

}



.kyc-details h3 {

  margin: 0 0 9px;

  color: #063b2b;

  font-size: 17px;

}



.kyc-details p {

  margin: 0 0 14px;

  color: #64748b;

  font-size: 14px;

  line-height: 1.7;

}



.kyc-details ul {

  margin: 0 0 20px;

  padding-left: 20px;

  color: #475569;

  font-size: 13px;

  line-height: 2;

}



.kyc-button {

  display: inline-flex;

  align-items: center;

  justify-content: center;

  gap: 12px;

  padding: 12px 18px;

  border: none;

  border-radius: 10px;

  background: #0a8754;

  color: #fff;

  font-weight: 600;

  cursor: pointer;

  transition: background 0.2s ease;

}



.kyc-button:hover {

  background: #063b2b;

}



.kyc-info {

  margin-top: 18px;

  padding: 16px;

  border: 1px solid #b8e6ce;

  border-radius: 12px;

  background: #f0fbf5;

}



.kyc-info strong {

  display: block;

  margin-bottom: 8px;

  color: #063b2b;

}



.kyc-info p {

  margin: 0;

}



@media (max-width: 600px) {

  .kyc-content {

    gap: 12px;

  }



  .kyc-icon {

    width: 42px;

    height: 42px;

    font-size: 21px;

  }



  .kyc-card .card-header {

    align-items: flex-start;

    gap: 12px;

  }

}



.kyc-status-verified {

  background: #dcfce7;

  color: #166534;

}



.kyc-status-pending {

  background: #fef3c7;

  color: #92400e;

}



.kyc-status-rejected {

  background: #fee2e2;

  color: #991b1b;

}



.kyc-status-not_started {

  background: #fff4d6;

  color: #8a5a00;

}



.kyc-error {

  margin-top: 10px;

  color: #b91c1c;

  font-size: 13px;

}

.kyc-field {

  display: flex;

  flex-direction: column;

  gap: 8px;

  margin-bottom: 16px;

}



.kyc-field label {

  color: #063b2b;

  font-size: 13px;

  font-weight: 600;

}



.kyc-field input,

.kyc-field select {

  width: 100%;

  min-height: 44px;

  padding: 11px 12px;

  border: 1px solid #d1d5db;

  border-radius: 9px;

  background: #fff;

  color: #111827;

  font: inherit;

}



.kyc-field input:focus,

.kyc-field select:focus {

  outline: 2px solid #0ea96a;

  outline-offset: 1px;

}



.kyc-consent {

  display: flex;

  align-items: flex-start;

  gap: 10px;

  margin: 18px 0;

  color: #475569;

  font-size: 13px;

  line-height: 1.6;

}



.kyc-consent input {

  margin-top: 4px;

  accent-color: #0a8754;

  flex-shrink: 0;

}



.kyc-result {

  margin: 12px 0;

  color: #166534;

  font-size: 13px;

}




.kyc-field { display: flex; flex-direction: column; gap: 7px; margin-bottom: 16px; }
.kyc-field label { color: #063b2b; font-size: 13px; font-weight: 600; }
.kyc-field input, .kyc-field select { width: 100%; min-width: 0; padding: 12px; border: 1px solid #cbd5e1; border-radius: 9px; background: #fff; color: #0f172a; font: inherit; font-size: 14px; outline: none; }
.kyc-field input:focus, .kyc-field select:focus { border-color: #0a8754; box-shadow: 0 0 0 3px rgba(10, 135, 84, 0.12); }
.kyc-consent { display: flex; align-items: flex-start; gap: 10px; margin: 16px 0; color: #475569; font-size: 13px; line-height: 1.6; }
.kyc-consent input { margin-top: 4px; accent-color: #0a8754; }
.kyc-result { margin: 12px 0; color: #475569; font-size: 13px; line-height: 1.6; overflow-wrap: anywhere; }
.kyc-button:disabled { cursor: not-allowed; opacity: 0.6; }
.kyc-info form { margin-top: 18px; }
.kyc-info h3 { margin-bottom: 10px; }
.kyc-info p { margin-bottom: 12px; }
</style>
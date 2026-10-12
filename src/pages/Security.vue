<template>

  <div class="security-page">

    <header class="page-header">

      <div>

        <p class="eyebrow">ACCOUNT PROTECTION</p>

        <h1>Security Center</h1>

        <p class="subtitle">

          Manage your password and keep your MufasirPay account secure.

        </p>

      </div>



      <div class="header-icon">🛡️</div>

    </header>



    <section class="security-banner">

      <div class="banner-icon">✓</div>

      <div>

        <h2>Your account security matters</h2>

        <p>

          Use a strong, unique password and never share your login details

          or transaction credentials with anyone.

        </p>

      </div>

    </section>



    <section class="security-card">

      <div class="card-heading">

        <div class="card-icon">🔑</div>

        <div>

          <h2>Change Password</h2>

          <p>Update the password you use to sign in.</p>

        </div>

      </div>



      <form @submit.prevent="changePassword">

        <div class="field">

          <label for="currentPassword">Current password</label>

          <div class="password-input">

            <input

              id="currentPassword"

              v-model="currentPassword"

              :type="showCurrentPassword ? 'text' : 'password'"

              autocomplete="current-password"

              placeholder="Enter your current password"

              required

            />

            <button

              type="button"

              class="show-button"

              @click="showCurrentPassword = !showCurrentPassword"

            >

              {{ showCurrentPassword ? 'Hide' : 'Show' }}

            </button>

          </div>

        </div>



        <div class="field">

          <label for="newPassword">New password</label>

          <div class="password-input">

            <input

              id="newPassword"

              v-model="newPassword"

              :type="showNewPassword ? 'text' : 'password'"

              autocomplete="new-password"

              placeholder="Create a strong password"

              minlength="8"

              required

            />

            <button

              type="button"

              class="show-button"

              @click="showNewPassword = !showNewPassword"

            >

              {{ showNewPassword ? 'Hide' : 'Show' }}

            </button>

          </div>

          <p class="field-hint">

            Use at least 8 characters, including letters and numbers.

          </p>

        </div>



        <div class="field">

          <label for="confirmPassword">Confirm new password</label>

          <div class="password-input">

            <input

              id="confirmPassword"

              v-model="confirmPassword"

              :type="showConfirmPassword ? 'text' : 'password'"

              autocomplete="new-password"

              placeholder="Enter the new password again"

              required

            />

            <button

              type="button"

              class="show-button"

              @click="showConfirmPassword = !showConfirmPassword"

            >

              {{ showConfirmPassword ? 'Hide' : 'Show' }}

            </button>

          </div>

        </div>



        <div

          v-if="message"

          class="feedback"

          :class="messageType"

          role="status"

          aria-live="polite"

        >

          {{ message }}

        </div>



        <button

          type="submit"

          class="primary-button"

          :disabled="saving"

        >

          {{ saving ? 'Updating password...' : 'Update Password' }}

        </button>

      </form>

    </section>



    <section class="security-card options-card">

      <div class="card-heading">

        <div class="card-icon">🔐</div>

        <div>

          <h2>Additional Security</h2>

          <p>More account-protection features.</p>

        </div>

      </div>



      <div class="pin-panel">
        <h3>Transaction PIN</h3>
        <p class="pin-description">Use a six-digit PIN to authorize wallet transfers. Never share it with anyone.</p>
        <p v-if="pinStatusMessage" class="pin-feedback" :class="pinStatusType">{{ pinStatusMessage }}</p>
        <p v-if="pinConfigured" class="status-label">PIN is configured</p>
        <p v-else class="status-label">PIN is not configured</p>

        <form v-if="!pinConfigured" class="pin-form" @submit.prevent="createPin">
          <div class="field"><label for="newTransactionPin">New 6-digit PIN</label><input id="newTransactionPin" v-model="newPin" type="password" inputmode="numeric" pattern="[0-9]{6}" minlength="6" maxlength="6" autocomplete="new-password" placeholder="Enter 6 digits" required /></div>
          <div class="field"><label for="confirmTransactionPin">Confirm PIN</label><input id="confirmTransactionPin" v-model="confirmPin" type="password" inputmode="numeric" pattern="[0-9]{6}" minlength="6" maxlength="6" autocomplete="new-password" placeholder="Re-enter PIN" required /></div>
          <button class="primary-button" type="submit" :disabled="pinBusy">{{ pinBusy ? 'Saving PIN...' : 'Create Transaction PIN' }}</button>
        </form>

        <form v-else class="pin-form" @submit.prevent="changePin">
          <div class="field"><label for="currentTransactionPin">Current PIN</label><input id="currentTransactionPin" v-model="currentPin" type="password" inputmode="numeric" pattern="[0-9]{6}" minlength="6" maxlength="6" autocomplete="current-password" placeholder="Enter current PIN" required /></div>
          <div class="field"><label for="replacementTransactionPin">New PIN</label><input id="replacementTransactionPin" v-model="newPin" type="password" inputmode="numeric" pattern="[0-9]{6}" minlength="6" maxlength="6" autocomplete="new-password" placeholder="Enter new 6-digit PIN" required /></div>
          <div class="field"><label for="confirmReplacementPin">Confirm new PIN</label><input id="confirmReplacementPin" v-model="confirmPin" type="password" inputmode="numeric" pattern="[0-9]{6}" minlength="6" maxlength="6" autocomplete="new-password" placeholder="Re-enter new PIN" required /></div>
          <button class="primary-button" type="submit" :disabled="pinBusy">{{ pinBusy ? 'Updating PIN...' : 'Change Transaction PIN' }}</button>
        </form>
      </div>



      <div class="security-option">

        <div class="option-icon">▣</div>

        <div class="option-copy">

          <h3>Login sessions</h3>

          <p>

            Review and manage active sessions when session management

            is configured.

          </p>

          <span class="status-label">Coming soon</span>

        </div>

      </div>



      <p class="security-note">

        Keep your transaction PIN private. Login session management is not yet available.

      </p>

    </section>



    <button class="back-button" type="button" @click="goBack">

      ← Back to Dashboard

    </button>

  </div>

</template>



<script setup lang="ts">

import { ref, onMounted } from 'vue'

import { useRouter } from 'vue-router'

import { supabase } from '../lib/supabase'



const router = useRouter()



const currentPassword = ref('')

const newPassword = ref('')

const confirmPassword = ref('')



const showCurrentPassword = ref(false)

const showNewPassword = ref(false)

const showConfirmPassword = ref(false)



const saving = ref(false)

const message = ref('')

const messageType = ref<'success' | 'error'>('success')

const pinConfigured = ref(false)
const pinBusy = ref(false)
const newPin = ref('')
const confirmPin = ref('')
const currentPin = ref('')
const pinStatusMessage = ref('')
const pinStatusType = ref<'success' | 'error'>('success')

function showPinMessage(text: string, type: 'success' | 'error') {
  pinStatusMessage.value = text
  pinStatusType.value = type
}

async function loadPinStatus() {
  try {
    const { data, error } = await supabase.functions.invoke('get-transaction-pin-status', { body: {} })
    if (error) throw error
    pinConfigured.value = data?.configured === true
  } catch (error) {
    console.error('PIN status lookup failed:', error)
    showPinMessage('Could not load PIN status. Refresh the page to try again.', 'error')
  }
}

async function createPin() {
  pinStatusMessage.value = ''
  if (!/^\d{6}$/.test(newPin.value)) return showPinMessage('PIN must contain exactly 6 digits.', 'error')
  if (newPin.value !== confirmPin.value) return showPinMessage('The PINs do not match.', 'error')
  pinBusy.value = true
  try {
    const { data, error } = await supabase.functions.invoke('set-transaction-pin', { body: { pin: newPin.value } })
    if (error) throw new Error(data?.error || error.message)
    showPinMessage(data?.message || 'Transaction PIN created.', 'success')
    pinConfigured.value = true
    newPin.value = ''; confirmPin.value = ''
  } catch (error: any) {
    showPinMessage(error?.message || 'Could not create your PIN.', 'error')
  } finally { pinBusy.value = false }
}

async function changePin() {
  pinStatusMessage.value = ''
  if (!/^\d{6}$/.test(currentPin.value) || !/^\d{6}$/.test(newPin.value)) return showPinMessage('All PINs must contain exactly 6 digits.', 'error')
  if (newPin.value !== confirmPin.value) return showPinMessage('The new PINs do not match.', 'error')
  if (newPin.value === currentPin.value) return showPinMessage('Choose a different PIN.', 'error')
  pinBusy.value = true
  try {
    const { data, error } = await supabase.functions.invoke('change-transaction-pin', { body: { currentPin: currentPin.value, newPin: newPin.value } })
    if (error) throw new Error(data?.error || error.message)
    showPinMessage(data?.message || 'Transaction PIN changed.', 'success')
    currentPin.value = ''; newPin.value = ''; confirmPin.value = ''
  } catch (error: any) {
    showPinMessage(error?.message || 'Could not change your PIN.', 'error')
  } finally { pinBusy.value = false }
}




function showMessage(

  text: string,

  type: 'success' | 'error'

) {

  message.value = text

  messageType.value = type

}



async function changePassword() {

  message.value = ''



  if (

    !currentPassword.value ||

    !newPassword.value ||

    !confirmPassword.value

  ) {

    showMessage('Please complete all password fields.', 'error')

    return

  }



  if (newPassword.value.length < 8) {

    showMessage(

      'Your new password must contain at least 8 characters.',

      'error'

    )

    return

  }



  if (newPassword.value === currentPassword.value) {

    showMessage(

      'Choose a new password different from your current password.',

      'error'

    )

    return

  }



  if (newPassword.value !== confirmPassword.value) {

    showMessage('The new passwords do not match.', 'error')

    return

  }



  saving.value = true



  try {

    const {

      data: { user },

      error: userError

    } = await supabase.auth.getUser()



    if (userError || !user) {

      showMessage(

        'Your session could not be verified. Please sign in again.',

        'error'

      )

      return

    }



    if (!user.email) {

      showMessage(

        'An email address is required to verify your current password.',

        'error'

      )

      return

    }



    // Verify the current password before changing it.

    const { error: signInError } =

      await supabase.auth.signInWithPassword({

        email: user.email,

        password: currentPassword.value

      })



    if (signInError) {

      showMessage(

        'Your current password is incorrect. Please try again.',

        'error'

      )

      return

    }



    const { error: updateError } =

      await supabase.auth.updateUser({

        password: newPassword.value

      })



    if (updateError) {

      showMessage(

        updateError.message || 'Could not update your password.',

        'error'

      )

      return

    }



    currentPassword.value = ''

    newPassword.value = ''

    confirmPassword.value = ''



    showMessage('Your password has been updated successfully.', 'success')

  } catch (error) {

    console.error('Password update error:', error)



    showMessage(

      'Something went wrong. Please try again.',

      'error'

    )

  } finally {

    saving.value = false

  }

}



onMounted(() => { loadPinStatus() })

function goBack() {

  router.push('/dashboard')

}

</script>



<style scoped>

* {

  box-sizing: border-box;

}



.security-page {

  min-height: 100vh;

  padding: 36px;

  background: #f7faf8;

  color: #172a21;

  font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;

}



.page-header {

  display: flex;

  justify-content: space-between;

  align-items: center;

  gap: 20px;

  margin: 0 auto 28px;

  max-width: 1000px;

}



.eyebrow {

  margin: 0 0 8px;

  color: #0b9860;

  font-size: 10px;

  font-weight: 800;

  letter-spacing: 1.5px;

}



.page-header h1 {

  margin: 0;

  font-size: clamp(26px, 4vw, 34px);

  letter-spacing: -0.8px;

}



.subtitle {

  margin: 9px 0 0;

  color: #78877f;

  font-size: 13px;

  line-height: 1.6;

}



.header-icon {

  display: grid;

  place-items: center;

  flex-shrink: 0;

  width: 58px;

  height: 58px;

  border-radius: 18px;

  background: #e4f7ec;

  font-size: 26px;

}



.security-banner,

.security-card {

  max-width: 1000px;

  margin: 0 auto 20px;

  border: 1px solid #e5eee8;

  border-radius: 20px;

  background: #fff;

  box-shadow: 0 8px 24px rgba(9, 71, 46, 0.04);

}



.security-banner {

  display: flex;

  align-items: flex-start;

  gap: 15px;

  padding: 22px;

  background: #edf9f2;

  border-color: #d7efdf;

}



.banner-icon {

  display: grid;

  place-items: center;

  flex-shrink: 0;

  width: 36px;

  height: 36px;

  border-radius: 12px;

  background: #d6f2e1;

  color: #087b51;

  font-size: 18px;

  font-weight: 800;

}



.security-banner h2 {

  margin: 1px 0 6px;

  font-size: 15px;

}



.security-banner p {

  margin: 0;

  color: #587466;

  font-size: 12px;

  line-height: 1.7;

}



.security-card {

  padding: 26px;

}



.card-heading {

  display: flex;

  align-items: center;

  gap: 13px;

  margin-bottom: 24px;

}



.card-icon {

  display: grid;

  place-items: center;

  flex-shrink: 0;

  width: 46px;

  height: 46px;

  border-radius: 14px;

  background: #e5f9ef;

  font-size: 21px;

}



.card-heading h2 {

  margin: 0;

  font-size: 17px;

}



.card-heading p {

  margin: 5px 0 0;

  color: #87938c;

  font-size: 12px;

}



.field {

  margin-bottom: 19px;

}



.field label {

  display: block;

  margin-bottom: 8px;

  font-size: 12px;

  font-weight: 700;

}



.password-input {

  display: flex;

  align-items: center;

  border: 1px solid #dfe9e3;

  border-radius: 12px;

  background: #fff;

  transition: border-color 0.2s, box-shadow 0.2s;

}



.password-input:focus-within {

  border-color: #0a9b61;

  box-shadow: 0 0 0 3px rgba(10, 155, 97, 0.09);

}



.password-input input {

  width: 100%;

  min-width: 0;

  padding: 13px 14px;

  border: 0;

  outline: 0;

  background: transparent;

  color: #172a21;

  font: inherit;

  font-size: 13px;

}



.password-input input::placeholder {

  color: #a2ada6;

}



.show-button {

  flex-shrink: 0;

  padding: 10px 13px;

  border: 0;

  background: transparent;

  color: #087b51;

  font-size: 11px;

  font-weight: 800;

  cursor: pointer;

}



.field-hint {

  margin: 7px 0 0;

  color: #87938c;

  font-size: 11px;

  line-height: 1.5;

}



.feedback {

  margin: 16px 0;

  padding: 12px 14px;

  border: 1px solid transparent;

  border-radius: 11px;

  font-size: 12px;

  line-height: 1.6;

}



.feedback.success {

  color: #087b51;

  background: #edf9f2;

  border-color: #d5efdf;

}



.feedback.error {

  color: #92551c;

  background: #fff7e9;

  border-color: #f3dfbd;

}



.primary-button {

  width: 100%;

  margin-top: 5px;

  padding: 14px 18px;

  border: 0;

  border-radius: 12px;

  background: linear-gradient(135deg, #0eaa69, #087b51);

  color: #fff;

  font-size: 13px;

  font-weight: 800;

  cursor: pointer;

  transition: transform 0.2s, box-shadow 0.2s;

}



.primary-button:hover:not(:disabled) {

  transform: translateY(-1px);

  box-shadow: 0 8px 18px rgba(8, 123, 81, 0.18);

}



.primary-button:disabled {

  opacity: 0.65;

  cursor: not-allowed;

}



.options-card {

  margin-top: 20px;

}



.security-option {

  display: flex;

  align-items: flex-start;

  gap: 14px;

  padding: 18px 0;

  border-top: 1px solid #edf2ee;

}



.option-icon {

  display: grid;

  place-items: center;

  flex-shrink: 0;

  width: 40px;

  height: 40px;

  border-radius: 12px;

  background: #f0f7f3;

  color: #087b51;

  font-size: 17px;

  font-weight: 800;

}



.option-copy h3 {

  margin: 0;

  font-size: 13px;

}



.option-copy p {

  margin: 6px 0;

  color: #7d8b83;

  font-size: 12px;

  line-height: 1.6;

}



.status-label {

  display: inline-block;

  margin-top: 3px;

  color: #75857b;

  font-size: 10px;

  font-weight: 700;

}



.security-note {

  margin: 10px 0 0;

  color: #87938c;

  font-size: 11px;

  line-height: 1.6;

}



.back-button {

  display: block;

  max-width: 1000px;

  margin: 25px auto 0;

  padding: 10px 0;

  border: 0;

  background: transparent;

  color: #087b51;

  font-size: 12px;

  font-weight: 800;

  cursor: pointer;

}



.back-button:hover {

  color: #065f3e;

}



@media (max-width: 650px) {

  .security-page {

    padding: 22px 16px 35px;

  }



  .page-header {

    align-items: flex-start;

  }



  .header-icon {

    width: 46px;

    height: 46px;

    border-radius: 14px;

    font-size: 21px;

  }



  .security-card {

    padding: 20px 17px;

  }



  .security-banner {

    padding: 18px;

  }

}


.pin-panel { margin-top: 22px; padding: 20px; border: 1px solid #e4ece7; border-radius: 16px; background: #fbfdfc; }
.pin-panel h3 { margin: 0 0 8px; color: #172a21; }
.pin-description { color: #63746b; line-height: 1.6; margin-bottom: 14px; }
.pin-form { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 14px; margin-top: 16px; }
.pin-form .primary-button { align-self: end; }
.pin-feedback { padding: 10px 12px; border-radius: 8px; margin: 10px 0; }
.pin-feedback.success { color: #176b43; background: #e8f7ee; }
.pin-feedback.error { color: #a32828; background: #fff0f0; }
</style>

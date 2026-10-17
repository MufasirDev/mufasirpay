
<template>
  <div class="reset-page">
    <div class="reset-card">
      <div class="logo">M</div>

      <h1>Set New Password</h1>
      <p class="subtitle">
        Enter your new password below to regain access to your MufasirPay account.
      </p>

      <form v-if="recoveryReady && !success" @submit.prevent="updatePassword">
        <label for="password">New Password</label>
        <input
          id="password"
          v-model="password"
          type="password"
          placeholder="Enter new password"
          autocomplete="new-password"
          minlength="8"
          required
        />

        <label for="confirmPassword">Confirm New Password</label>
        <input
          id="confirmPassword"
          v-model="confirmPassword"
          type="password"
          placeholder="Confirm new password"
          autocomplete="new-password"
          minlength="8"
          required
        />

        <p v-if="errorMessage" class="message error">
          {{ errorMessage }}
        </p>

        <button type="submit" :disabled="loading">
          {{ loading ? 'Updating...' : 'Update Password' }}
        </button>
      </form>

      <div v-if="success" class="message success">
        Your password has been updated successfully.
        You can now log in with your new password.
      </div>

      <div v-if="!recoveryReady && !success" class="message error">
        {{ errorMessage || 'Checking your password reset link...' }}
      </div>

      <router-link to="/login" class="back-link">
        ← Back to Login
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import type { AuthChangeEvent, Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'



const password = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const recoveryReady = ref(false)
const success = ref(false)
const errorMessage = ref('')

let recoverySubscription: { unsubscribe: () => void } | undefined
let recoveryEventReceived = false

onMounted(async () => {
  // Listen for Supabase's PASSWORD_RECOVERY event.
  const { data } = supabase.auth.onAuthStateChange(
    (event: AuthChangeEvent, session: Session | null) => {
      if (event === 'PASSWORD_RECOVERY' && session) {
        recoveryEventReceived = true
        recoveryReady.value = true
        errorMessage.value = ''
      }
    }
  )

  recoverySubscription = data.subscription

  // Support recovery links that provide a code in the URL.
  const url = new URL(window.location.href)
  const code = url.searchParams.get('code')

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      errorMessage.value =
        'This reset link is invalid or expired. Please request a new one.'
      return
    }

    if (supabase.auth.getSession) {
      const { data: sessionData } = await supabase.auth.getSession()

      if (sessionData.session) {
        recoveryReady.value = true
        window.history.replaceState({}, document.title, url.pathname)
        return
      }
    }
  }

  // Give the recovery event a short opportunity to arrive when
  // Supabase returns a recovery token in the URL hash.
  await new Promise((resolve) => setTimeout(resolve, 500))

  if (recoveryEventReceived) return

  const { data: sessionData } = await supabase.auth.getSession()

  if (sessionData.session) {
    recoveryReady.value = true
  } else {
    errorMessage.value =
      'This reset link is invalid or expired. Please request a new one.'
  }
})

onUnmounted(() => {
  recoverySubscription?.unsubscribe()
})

const updatePassword = async () => {
  if (loading.value) return

  errorMessage.value = ''

  if (password.value.length < 8) {
    errorMessage.value = 'Your password must contain at least 8 characters.'
    return
  }

  if (password.value !== confirmPassword.value) {
    errorMessage.value = 'The passwords do not match.'
    return
  }

  loading.value = true

  try {
    const { data: sessionData } = await supabase.auth.getSession()

    if (!sessionData.session) {
      errorMessage.value =
        'Your reset session has expired. Please request a new reset link.'
      return
    }

    const { error } = await supabase.auth.updateUser({
      password: password.value
    })

    if (error) throw error

    success.value = true
    password.value = ''
    confirmPassword.value = ''

    // End the recovery session so the user can sign in normally.
    await supabase.auth.signOut({ scope: 'local' })
  } catch (error: unknown) {
    console.error('Password update failed:', error)

    errorMessage.value =
      error instanceof Error
        ? error.message
        : 'Unable to update your password. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.reset-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  box-sizing: border-box;
  background: #f7faf8;
}

.reset-card {
  width: 100%;
  max-width: 440px;
  padding: 40px;
  box-sizing: border-box;
  border-radius: 24px;
  background: #fff;
  box-shadow: 0 20px 60px rgba(6, 59, 43, 0.1);
}

.logo {
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
  background: linear-gradient(145deg, #77e7aa, #0ea96a);
  color: #063b2b;
  font-size: 28px;
  font-weight: 900;
  margin-bottom: 24px;
}

h1 {
  margin: 0 0 12px;
  color: #10271d;
  font-size: 28px;
}

.subtitle {
  margin-bottom: 28px;
  color: #6b7b73;
  font-size: 14px;
  line-height: 1.7;
}

label {
  display: block;
  margin: 18px 0 8px;
  color: #1c3429;
  font-size: 14px;
  font-weight: 700;
}

input {
  width: 100%;
  padding: 14px 16px;
  box-sizing: border-box;
  border: 1px solid #d9e6df;
  border-radius: 12px;
  outline: none;
  background: #fbfdfc;
  color: #142a20;
  font-size: 15px;
}

input:focus {
  border-color: #0ea96a;
  box-shadow: 0 0 0 3px rgba(14, 169, 106, 0.11);
}

button {
  width: 100%;
  margin-top: 22px;
  padding: 15px;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, #0ea96a, #078253);
  color: #fff;
  font-size: 15px;
  font-weight: 800;
  cursor: pointer;
}

button:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.message {
  margin-top: 18px;
  padding: 13px;
  border-radius: 10px;
  font-size: 13px;
  line-height: 1.6;
}

.success {
  color: #065f46;
  background: #ecfdf5;
  border: 1px solid #a7f3d0;
}

.error {
  color: #be123c;
  background: #fff1f2;
  border: 1px solid #ffd5dc;
}

.back-link {
  display: block;
  margin-top: 24px;
  text-align: center;
  color: #0a8754;
  font-size: 14px;
  font-weight: 700;
  text-decoration: none;
}

@media (max-width: 480px) {
  .reset-card {
    padding: 28px 22px;
  }

  h1 {
    font-size: 25px;
  }
}
</style>


<template>
  <div class="recovery-page">
    <div class="recovery-card">
      <div class="logo">M</div>

      <h1>Forgot Password?</h1>
      <p class="subtitle">
        Enter the email address associated with your MufasirPay account.
        We'll send you a link to reset your password.
      </p>

      <form @submit.prevent="sendResetEmail">
        <label for="email">Email Address</label>
        <input
          id="email"
          v-model.trim="email"
          type="email"
          placeholder="Enter your registered email"
          autocomplete="email"
          required
        />

        <div v-if="message" class="message success">
          {{ message }}
        </div>

        <div v-if="errorMessage" class="message error">
          {{ errorMessage }}
        </div>

        <button type="submit" :disabled="loading">
          {{ loading ? 'Sending link...' : 'Send Reset Link' }}
        </button>
      </form>

      <router-link to="/login" class="back-link">
        ← Back to Login
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { supabase } from '../lib/supabase'

const email = ref('')
const loading = ref(false)
const message = ref('')
const errorMessage = ref('')

const sendResetEmail = async () => {
  if (loading.value) return

  loading.value = true
  message.value = ''
  errorMessage.value = ''

  try {
    const cleanEmail = email.value.trim().toLowerCase()

    const { error } = await supabase.auth.resetPasswordForEmail(
      cleanEmail,
      {
        redirectTo: `${window.location.origin}/reset-password`
      }
    )

    if (error) throw error

    message.value =
      'If an account exists for this email, a password reset link will be sent. Please check your inbox and spam folder.'
  } catch (error: unknown) {
    console.error('Password reset request failed:', error)

    errorMessage.value =
      'We could not send the reset email. Please try again later.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.recovery-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  box-sizing: border-box;
  background: #f7faf8;
}

.recovery-card {
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
  margin-bottom: 8px;
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
  margin-top: 20px;
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
  margin-top: 16px;
  padding: 12px;
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
  .recovery-card {
    padding: 28px 22px;
  }

  h1 {
    font-size: 25px;
  }
}
</style>

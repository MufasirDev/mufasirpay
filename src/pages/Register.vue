<template>
  <div class="auth-page">

    <div class="auth-left">
      <div class="brand">
        <div class="brand-icon">M</div>
        <span>Mufasir<span>Pay</span></span>
      </div>

      <div class="auth-message">
        <span>WELCOME TO MUFASIRPAY</span>

        <h1>
          Your money.
          <strong>Your future.</strong>
        </h1>

        <p>
          Create your MufasirPay account and get access to a simple,
          secure digital wallet built for everyday payments.
        </p>

        <div class="benefits">
          <div>
            <b>✓</b>
            <span>Secure digital wallet</span>
          </div>

          <div>
            <b>✓</b>
            <span>Fast money transfers</span>
          </div>

          <div>
            <b>✓</b>
            <span>Easy transaction tracking</span>
          </div>
        </div>
      </div>
    </div>

    <div class="auth-right">

      <div class="auth-box">

        <div class="mobile-brand">
          <div class="brand-icon">M</div>
          <span>Mufasir<span>Pay</span></span>
        </div>

        <div class="form-heading">
          <h2>Create your account</h2>
          <p>Enter your details to get started.</p>
        </div>

        <form @submit.prevent="registerUser">

          <div class="input-group">
            <label>Full Name</label>

            <input
              v-model="fullName"
              type="text"
              placeholder="Enter your full name"
              required
            />
          </div>

          <div class="input-group">
            <label>Email Address</label>

            <input
              v-model="email"
              type="email"
              placeholder="you@example.com"
              required
            />
          </div>

          <div class="input-group">
            <label>Phone Number</label>

            <input
              v-model="phone"
              type="tel"
              placeholder="08012345678"
              required
            />
          </div>

          <div class="input-group">
            <label>Password</label>

            <input
              v-model="password"
              type="password"
              placeholder="Create a strong password"
              minlength="6"
              required
            />
          </div>

          <div
            v-if="errorMessage"
            class="error-message"
          >
            {{ errorMessage }}
          </div>

          <div
            v-if="successMessage"
            class="success-message"
          >
            {{ successMessage }}
          </div>

          <button
            type="submit"
            class="register-button"
            :disabled="loading"
          >
            {{ loading ? 'Creating account...' : 'Create Account →' }}
          </button>

        </form>

        <p class="login-text">
          Already have an account?

          <router-link to="/login">
            Log in
          </router-link>
        </p>

        <router-link to="/" class="back-home">
          ← Back to home
        </router-link>

      </div>

    </div>

  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../lib/supabase'

const router = useRouter()

const fullName = ref('')
const email = ref('')
const phone = ref('')
const password = ref('')

const loading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const registerUser = async () => {
  errorMessage.value = ''
  successMessage.value = ''
  loading.value = true

  try {
    const { data, error } = await supabase.auth.signUp({
      email: email.value,
      password: password.value,
      options: {
        data: {
          full_name: fullName.value,
          phone: phone.value
        }
      }
    })

    if (error) {
      throw error
    }

    if (!data.user) {
      throw new Error('Unable to create account.')
    }

    successMessage.value =
      'Account created successfully!'

    setTimeout(() => {
      router.push('/dashboard')
    }, 1000)

  } catch (error: any) {

    errorMessage.value =
      error.message || 'Something went wrong.'

  } finally {
    loading.value = false
  }
}
</script>

<style scoped>

/* =================================
   REGISTER / AUTH PAGE
================================= */

.auth-page {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 1fr 1fr;

  background:
    radial-gradient(
      circle at top right,
      rgba(24, 184, 117, 0.08),
      transparent 32%
    ),
    #f7faf8;
}


/* =================================
   LEFT BRAND PANEL
================================= */

.auth-left {
  position: relative;
  overflow: hidden;

  background:
    radial-gradient(
      circle at 85% 15%,
      rgba(24, 184, 117, 0.3),
      transparent 32%
    ),
    linear-gradient(
      145deg,
      #042f24 0%,
      #063b2b 48%,
      #0a8754 100%
    );

  color: white;

  padding: 55px 9%;

  display: flex;
  flex-direction: column;
}


/* Decorative circles */

.auth-left::before {
  content: "";

  position: absolute;

  width: 300px;
  height: 300px;

  right: -110px;
  bottom: -110px;

  border-radius: 50%;

  background: rgba(24, 184, 117, 0.12);
}


.auth-left::after {
  content: "";

  position: absolute;

  width: 180px;
  height: 180px;

  left: -90px;
  top: -70px;

  border-radius: 50%;

  background: rgba(255, 255, 255, 0.035);
}


/* =================================
   BRAND
================================= */

.brand,
.mobile-brand {
  position: relative;
  z-index: 2;

  display: flex;
  align-items: center;

  gap: 10px;

  font-size: 21px;
  font-weight: 900;
}


.brand-icon {
  position: relative;
  overflow: hidden;

  width: 40px;
  height: 40px;

  flex-shrink: 0;

  border-radius: 13px;

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

  font-weight: 950;
  font-size: 20px;
  letter-spacing: -2px;

  box-shadow:
    0 9px 22px rgba(6, 59, 43, 0.25),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
}


/* Logo decorative strokes */

.brand-icon::before {
  content: "";

  position: absolute;

  width: 25px;
  height: 6px;

  top: 8px;
  left: 9px;

  border-radius: 50%;

  border-top: 3px solid rgba(255, 255, 255, 0.95);
  border-left: 2px solid rgba(255, 255, 255, 0.55);

  transform: rotate(-15deg);
}


.brand-icon::after {
  content: "";

  position: absolute;

  width: 21px;
  height: 7px;

  right: 5px;
  bottom: 6px;

  border-radius: 50%;

  background: rgba(4, 47, 36, 0.28);

  transform: rotate(-25deg);
}


.brand span span,
.mobile-brand span span {
  color: #a9edc9;
}


/* =================================
   LEFT MESSAGE
================================= */

.auth-message {
  position: relative;
  z-index: 2;

  max-width: 520px;

  margin: auto 0;
}


.auth-message > span {
  font-size: 11px;

  font-weight: 800;

  letter-spacing: 1.5px;

  color: #bcefd5;
}


.auth-message h1 {
  font-size: clamp(45px, 5vw, 70px);

  line-height: 1.02;

  letter-spacing: -3px;

  margin: 18px 0 25px;

  font-weight: 900;
}


.auth-message h1 strong {
  display: block;

  color: #a9edc9;
}


.auth-message p {
  max-width: 500px;

  line-height: 1.8;

  color: #d7f3e5;

  font-size: 15px;
}


/* =================================
   BENEFITS
================================= */

.benefits {
  margin-top: 35px;
}


.benefits div {
  display: flex;
  align-items: center;

  gap: 12px;

  margin-bottom: 15px;

  font-size: 14px;

  font-weight: 600;

  color: #effcf6;
}


.benefits b {
  width: 27px;
  height: 27px;

  flex-shrink: 0;

  border-radius: 50%;

  background: rgba(255, 255, 255, 0.13);

  border: 1px solid rgba(255, 255, 255, 0.12);

  display: flex;
  align-items: center;
  justify-content: center;

  color: #baf5d8;
}


/* =================================
   RIGHT SIDE
================================= */

.auth-right {
  display: flex;
  align-items: center;
  justify-content: center;

  padding: 50px;
}


/* =================================
   REGISTER CARD
================================= */

.auth-box {
  width: 100%;
  max-width: 450px;

  background: #ffffff;

  padding: 42px;

  border-radius: 22px;

  box-shadow:
    0 25px 70px rgba(6, 59, 43, 0.1),
    0 8px 25px rgba(6, 59, 43, 0.04);
}


/* =================================
   MOBILE BRAND
================================= */

.mobile-brand {
  display: none;

  color: #10271d;

  margin-bottom: 30px;
}


/* =================================
   FORM HEADING
================================= */

.form-heading {
  margin-bottom: 30px;
}


.form-heading h2 {
  color: #10271d;

  font-size: 28px;

  margin-bottom: 8px;

  font-weight: 900;

  letter-spacing: -0.5px;
}


.form-heading p {
  color: #74837b;

  font-size: 14px;

  line-height: 1.6;
}


/* =================================
   INPUTS
================================= */

.input-group {
  margin-bottom: 18px;
}


.input-group label {
  display: block;

  color: #1c3429;

  font-size: 13px;

  font-weight: 700;

  margin-bottom: 8px;
}


.input-group input {
  width: 100%;

  box-sizing: border-box;

  padding: 14px 15px;

  border: 1px solid #d8e6df;

  border-radius: 11px;

  outline: none;

  background: #fbfdfc;

  color: #142a20;

  font-family: inherit;

  font-size: 14px;

  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    background 0.2s ease;
}


.input-group input::placeholder {
  color: #9aa9a2;
}


.input-group input:hover {
  border-color: #b9d7c9;
}


.input-group input:focus {
  border-color: #0ea96a;

  background: #ffffff;

  box-shadow:
    0 0 0 3px rgba(14, 169, 106, 0.11);
}


/* =================================
   REGISTER BUTTON
================================= */

.register-button {
  width: 100%;

  padding: 15px;

  border: none;

  border-radius: 11px;

  background:
    linear-gradient(
      135deg,
      #0ea96a,
      #078253
    );

  color: white;

  font-weight: 800;

  font-size: 15px;

  margin-top: 8px;

  cursor: pointer;

  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    background 0.2s ease;

  box-shadow:
    0 10px 22px rgba(14, 169, 106, 0.18);
}


.register-button:hover {
  background:
    linear-gradient(
      135deg,
      #0fae70,
      #066f48
    );

  transform: translateY(-1px);

  box-shadow:
    0 14px 28px rgba(14, 169, 106, 0.24);
}


.register-button:active {
  transform: translateY(0);
}


.register-button:disabled {
  opacity: 0.6;

  cursor: not-allowed;

  transform: none;

  box-shadow: none;
}


/* =================================
   MESSAGES
================================= */

.error-message,
.success-message {
  padding: 12px 13px;

  border-radius: 10px;

  font-size: 12px;

  line-height: 1.5;

  margin-bottom: 15px;
}


.error-message {
  background: #fff1f2;

  border: 1px solid #ffd5dc;

  color: #be123c;
}


.success-message {
  background: #eafaf2;

  border: 1px solid #c8edd9;

  color: #16804a;
}


/* =================================
   LOGIN LINK
================================= */

.login-text {
  text-align: center;

  color: #77847d;

  font-size: 13px;

  margin-top: 25px;
}


.login-text a {
  color: #0a8754;

  font-weight: 800;

  text-decoration: none;

  transition: color 0.2s ease;
}


.login-text a:hover {
  color: #063b2b;
}


/* =================================
   BACK HOME
================================= */

.back-home {
  display: block;

  text-align: center;

  margin-top: 20px;

  color: #7a8881;

  font-size: 12px;

  text-decoration: none;

  transition: color 0.2s ease;
}


.back-home:hover {
  color: #0a8754;
}


/* =================================
   TABLET / MOBILE
================================= */

@media (max-width: 850px) {

  .auth-page {
    grid-template-columns: 1fr;
  }

  .auth-left {
    display: none;
  }

  .auth-right {
    min-height: 100vh;

    padding: 25px;
  }

  .mobile-brand {
    display: flex;
  }

  .auth-box {
    box-shadow: none;

    padding: 30px 25px;
  }

}


/* =================================
   SMALL MOBILE
================================= */

@media (max-width: 480px) {

  .auth-right {
    padding: 15px;
  }

  .auth-box {
    padding: 25px 20px;

    border-radius: 18px;
  }

  .mobile-brand {
    margin-bottom: 24px;
  }

  .form-heading h2 {
    font-size: 25px;
  }

  .input-group input {
    padding: 13px 14px;
  }

  .register-button {
    padding: 14px;
  }

}

</style>
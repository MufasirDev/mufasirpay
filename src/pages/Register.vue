<template>
<div class="auth-page">
<div class="auth-left">
<div class="brand">
<div class="brand-icon"><img src="/mufasirpay.logo.png" alt="MufasirPay logo" style="width: 100%; height: 100%; object-fit: contain; position: relative; z-index: 1;" /></div>
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
<div class="brand-icon"><img src="/logo.png" alt="MufasirPay logo" style="width: 100%; height: 100%; object-fit: contain; position: relative; z-index: 1;" /></div>
<span>Mufasir<span>Pay</span></span>
</div>
<div class="form-heading">
<h2>Create your account</h2>
<p>
Enter your details to get started.
</p>
</div>
<form @submit.prevent="registerUser">
<!-- FULL NAME -->
<div class="input-group">
<label>Full Name</label>
<input
v-model="fullName"
type="text"
placeholder="Enter your full name"
required
/>
</div>
<!-- EMAIL -->
<div class="input-group">
<label>Email Address</label>
<input
v-model="email"
type="email"
placeholder="you@gmail.com"
required
/>
<small class="input-hint">
Use your normal Gmail address.
</small>
</div>
<!-- ACCOUNT -->
<div class="input-group">
<label>MufasirPay Account</label>
<select
v-model="accountNumber"
required
>
<option value="1">
Account 1
</option>
<option value="2">
Account 2
</option>
<option value="3">
Account 3
</option>
</select>
<small class="input-hint">
You can create up to 3 test accounts using the same Gmail.
</small>
</div>
<!-- PHONE -->
<div class="input-group">
<label>Phone Number</label>
<input
v-model="phone"
type="tel"
placeholder="08012345678"
required
/>
</div>
<!-- PASSWORD -->
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
<!-- CONFIRM PASSWORD -->
<div class="input-group">
<label for="confirm-password">Confirm Password</label>
<input
id="confirm-password"
v-model="confirmPassword"
type="password"
placeholder="Re-enter your password"
minlength="6"
autocomplete="new-password"
required
/>
<small v-if="confirmPassword && password !== confirmPassword" class="input-hint password-mismatch">
Passwords do not match.
</small>
<small v-else-if="confirmPassword && password === confirmPassword" class="input-hint password-match">
Passwords match.
</small>
</div>
<!-- ERROR -->
<div
v-if="errorMessage"
class="error-message"
>
{{ errorMessage }}
</div>
<!-- SUCCESS -->
<div
v-if="successMessage"
class="success-message"
>
{{ successMessage }}
</div>
<!-- BUTTON -->
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
<router-link
to="/"
class="back-home"
>
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
const confirmPassword = ref('')
const accountNumber = ref('1')
const loading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
/*
|--------------------------------------------------------------------------
| CREATE ACCOUNT EMAIL
|--------------------------------------------------------------------------
|
| Account 1:
| example@gmail.com
|
| Account 2:
| example+2@gmail.com
|
| Account 3:
| example+3@gmail.com
|
*/
const getAccountEmail = () => {
const cleanEmail = email.value
.trim()
.toLowerCase()
/*
|----------------------------------------------------------------------
| Account 1
|----------------------------------------------------------------------
*/
if (accountNumber.value === '1') {
return cleanEmail
}
/*
|----------------------------------------------------------------------
| Account 2 / Account 3
|----------------------------------------------------------------------
*/
const [username, domain] = cleanEmail.split('@')
if (!username || !domain) {
return cleanEmail
}
return `${username}+${accountNumber.value}@${domain}`
}
/*
|--------------------------------------------------------------------------
| REGISTER USER
|--------------------------------------------------------------------------
*/
const registerUser = async () => {
if (loading.value) return
errorMessage.value = ''
successMessage.value = ''

if (password.value !== confirmPassword.value) {
errorMessage.value = 'Passwords do not match. Please confirm your password.'
return
}

loading.value = true
try {
/*
|----------------------------------------------------------------------
| Generate actual Supabase email
|----------------------------------------------------------------------
*/
const accountEmail = getAccountEmail()
console.log(
'Creating MufasirPay account:',
accountNumber.value,
accountEmail
)
/*
|----------------------------------------------------------------------
| CREATE SUPABASE ACCOUNT
|----------------------------------------------------------------------
*/
const { data, error } =
await supabase.auth.signUp({
email: accountEmail,
password: password.value,
options: {
data: {
full_name: fullName.value.trim(),
phone: phone.value.trim(),
account_number: accountNumber.value,
base_email: email.value
.trim()
.toLowerCase()
}
}
})
/*
|----------------------------------------------------------------------
| SUPABASE ERROR
|----------------------------------------------------------------------
*/
if (error) {
throw error
}
/*
|----------------------------------------------------------------------
| USER WAS NOT CREATED
|----------------------------------------------------------------------
*/
if (!data.user) {
throw new Error(
'Unable to create account.'
)
}
/*
|----------------------------------------------------------------------
| USER CREATED + SESSION AVAILABLE
|----------------------------------------------------------------------
*/
if (data.session) {
successMessage.value =
`Account ${accountNumber.value} created successfully!`
setTimeout(() => {
router.replace('/dashboard')
}, 800)
return
}
/*
|----------------------------------------------------------------------
| EMAIL CONFIRMATION ENABLED
|----------------------------------------------------------------------
*/
successMessage.value =
`Account ${accountNumber.value} created successfully! Please check your Gmail and verify your account before logging in.`
} catch (error: any) {
console.error(
'Registration error:',
error
)
/*
|----------------------------------------------------------------------
| FRIENDLIER ERROR MESSAGES
|----------------------------------------------------------------------
*/
if (
error?.message
?.toLowerCase()
?.includes('already registered')
) {
errorMessage.value =
`Account ${accountNumber.value} already exists. Please select another account or log in.`
} else {
errorMessage.value =
error?.message ||
'Something went wrong while creating your account.'
}
} finally {
loading.value = false
}
}
</script>
<style>

/* =========================================
   MUFASIRPAY - PREMIUM REGISTRATION PAGE
========================================= */

.auth-page {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 0.95fr 1.05fr;
  background: #f5f9f7;
  overflow-x: hidden;
  font-family: inherit;
}

/* =========================================
   LEFT BRAND PANEL
========================================= */

.auth-left {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  min-height: 100vh;
  padding: 48px 9%;
  display: flex;
  flex-direction: column;
  color: #fff;

  background:
    radial-gradient(
      circle at 85% 15%,
      rgba(91, 231, 165, 0.2),
      transparent 30%
    ),
    radial-gradient(
      circle at 10% 90%,
      rgba(20, 184, 117, 0.2),
      transparent 35%
    ),
    linear-gradient(
      145deg,
      #03291f 0%,
      #06422f 52%,
      #08794e 100%
    );
}

.auth-left::before,
.auth-left::after {
  content: "";
  position: absolute;
  z-index: -1;
  border-radius: 50%;
  pointer-events: none;
}

.auth-left::before {
  width: 420px;
  height: 420px;
  right: -190px;
  bottom: -160px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow:
    0 0 0 35px rgba(255, 255, 255, 0.025),
    0 0 0 75px rgba(255, 255, 255, 0.02);
}

.auth-left::after {
  width: 240px;
  height: 240px;
  left: -130px;
  top: 25%;
  background: rgba(255, 255, 255, 0.025);
}

/* =========================================
   BRAND
========================================= */

.brand,
.mobile-brand {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 22px;
  font-weight: 900;
  letter-spacing: -0.8px;
}

.brand-icon {
  position: relative;
  overflow: hidden;
  width: 43px;
  height: 43px;
  flex-shrink: 0;
  border-radius: 13px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(
    145deg,
    #e1fff1,
    #77e7aa 48%,
    #18b875
  );
  box-shadow:
    0 8px 22px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
}

.brand-icon img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.brand span span,
.mobile-brand span span {
  color: #a9edc9;
}

/* =========================================
   LEFT MESSAGE
========================================= */

.auth-message {
  position: relative;
  z-index: 2;
  max-width: 510px;
  margin: auto 0;
  padding: 70px 0;
}

.auth-message > span {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  color: #a9edc9;
  font-size: 11px;
  font-weight: 850;
  letter-spacing: 2px;
}

.auth-message > span::before {
  content: "";
  width: 25px;
  height: 2px;
  border-radius: 5px;
  background: #55d99a;
}

.auth-message h1 {
  margin: 22px 0;
  font-size: clamp(46px, 5vw, 68px);
  line-height: 1.04;
  letter-spacing: -3.5px;
  font-weight: 900;
}

.auth-message h1 strong {
  display: block;
  color: #a9edc9;
}

.auth-message p {
  max-width: 440px;
  color: rgba(237, 255, 245, 0.8);
  font-size: 15px;
  line-height: 1.85;
}

/* =========================================
   BENEFITS
========================================= */

.benefits {
  display: grid;
  gap: 14px;
  margin-top: 36px;
}

.benefits div {
  display: flex;
  align-items: center;
  gap: 13px;
  color: #effcf6;
  font-size: 14px;
  font-weight: 600;
}

.benefits b {
  width: 29px;
  height: 29px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  color: #baf5d8;
  background: rgba(169, 237, 201, 0.13);
  border: 1px solid rgba(169, 237, 201, 0.2);
}

/* =========================================
   RIGHT SIDE
========================================= */

.auth-right {
  min-width: 0;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 45px 35px;
  background:
    radial-gradient(
      circle at 100% 0%,
      rgba(24, 184, 117, 0.07),
      transparent 32%
    ),
    #f7faf8;
}

/* =========================================
   REGISTER CARD
========================================= */

.auth-box {
  width: 100%;
  max-width: 490px;
  padding: 42px;
  border: 1px solid rgba(15, 75, 48, 0.07);
  border-radius: 23px;
  background: #ffffff;
  box-shadow:
    0 24px 65px rgba(6, 59, 43, 0.075),
    0 5px 18px rgba(6, 59, 43, 0.035);
}

/* =========================================
   MOBILE BRAND
========================================= */

.mobile-brand {
  display: none;
  color: #10271d;
  margin-bottom: 32px;
}

/* =========================================
   FORM HEADING
========================================= */

.form-heading {
  margin-bottom: 29px;
}

.form-heading h2 {
  margin: 0 0 9px;
  color: #10271d;
  font-size: 29px;
  font-weight: 900;
  letter-spacing: -1.1px;
}

.form-heading p {
  margin: 0;
  color: #819087;
  font-size: 14px;
  line-height: 1.7;
}

/* =========================================
   INPUTS
========================================= */

.input-group {
  margin-bottom: 18px;
}

.input-group label {
  display: block;
  margin-bottom: 8px;
  color: #20392c;
  font-size: 13px;
  font-weight: 750;
}

.input-group input,
.input-group select {
  width: 100%;
  min-height: 49px;
  box-sizing: border-box;
  padding: 13px 15px;
  border: 1px solid #dce8e1;
  border-radius: 11px;
  outline: none;
  background: #f9fcfa;
  color: #142a20;
  font-family: inherit;
  font-size: 14px;
  transition: all 0.22s ease;
}

.input-group input::placeholder {
  color: #a2afa8;
}

.input-group input:hover,
.input-group select:hover {
  border-color: #a9cdb9;
  background: #ffffff;
}

.input-group input:focus,
.input-group select:focus {
  border-color: #0ea96a;
  background: #ffffff;
  box-shadow: 0 0 0 4px rgba(14, 169, 106, 0.09);
}

.input-group select {
  cursor: pointer;
}

/* =========================================
   INPUT HINTS
========================================= */

.input-hint {
  display: block;
  margin-top: 7px;
  color: #84938c;
  font-size: 11px;
  line-height: 1.5;
}

.password-mismatch {
  color: #be123c;
}

.password-match {
  color: #16804a;
}

/* =========================================
   REGISTER BUTTON
========================================= */

.register-button {
  width: 100%;
  min-height: 51px;
  margin-top: 8px;
  padding: 14px 18px;
  border: none;
  border-radius: 12px;
  background: linear-gradient(
    135deg,
    #10b978,
    #078253
  );
  color: #ffffff;
  font-family: inherit;
  font-size: 15px;
  font-weight: 800;
  cursor: pointer;
  box-shadow: 0 9px 22px rgba(14, 169, 106, 0.19);
  transition: all 0.22s ease;
}

.register-button:hover:not(:disabled) {
  transform: translateY(-2px);
  background: linear-gradient(
    135deg,
    #12c581,
    #067348
  );
  box-shadow: 0 13px 28px rgba(14, 169, 106, 0.25);
}

.register-button:active:not(:disabled) {
  transform: translateY(0);
}

.register-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  box-shadow: none;
}

/* =========================================
   ERROR AND SUCCESS MESSAGES
========================================= */

.error-message,
.success-message {
  padding: 13px 15px;
  margin-bottom: 16px;
  border-radius: 11px;
  font-size: 12px;
  line-height: 1.6;
}

.error-message {
  color: #be123c;
  background: #fff1f2;
  border: 1px solid #ffd5dc;
}

.success-message {
  color: #16804a;
  background: #eafaf2;
  border: 1px solid #c8edd9;
}

/* =========================================
   LOGIN LINK
========================================= */

.login-text {
  margin-top: 25px;
  color: #819087;
  font-size: 13px;
  text-align: center;
}

.login-text a {
  color: #078253;
  font-weight: 850;
  text-decoration: none;
  transition: color 0.2s ease;
}

.login-text a:hover {
  color: #034b32;
  text-decoration: underline;
}

/* =========================================
   BACK HOME
========================================= */

.back-home {
  display: block;
  margin-top: 20px;
  color: #89968f;
  font-size: 12px;
  font-weight: 600;
  text-align: center;
  text-decoration: none;
  transition: color 0.2s ease;
}

.back-home:hover {
  color: #078253;
}

/* =========================================
   TABLET
========================================= */

@media (max-width: 1050px) {
  .auth-page {
    grid-template-columns: 0.85fr 1.15fr;
  }

  .auth-left {
    padding: 40px 8%;
  }

  .auth-message h1 {
    font-size: clamp(42px, 5vw, 55px);
    letter-spacing: -2.5px;
  }

  .auth-right {
    padding: 35px 25px;
  }

  .auth-box {
    padding: 34px;
  }
}

/* =========================================
   MOBILE
========================================= */

@media (max-width: 850px) {
  .auth-page {
    display: block;
    min-height: 100vh;
    background: #f5f9f7;
  }

  .auth-left {
    display: none;
  }

  .auth-right {
    min-height: 100vh;
    box-sizing: border-box;
    padding: 30px 22px;
    align-items: flex-start;
  }

  .mobile-brand {
    display: flex;
  }

  .auth-box {
    max-width: 490px;
    padding: 32px;
    margin: auto;
    box-shadow:
      0 15px 45px rgba(6, 59, 43, 0.07),
      0 3px 12px rgba(6, 59, 43, 0.025);
  }
}

/* =========================================
   SMALL MOBILE
========================================= */

@media (max-width: 480px) {
  .auth-right {
    padding: 20px 14px;
  }

  .auth-box {
    padding: 25px 20px;
    border-radius: 17px;
  }

  .mobile-brand {
    margin-bottom: 26px;
    font-size: 20px;
  }

  .brand-icon {
    width: 39px;
    height: 39px;
  }

  .form-heading {
    margin-bottom: 24px;
  }

  .form-heading h2 {
    font-size: 25px;
  }

  .input-group {
    margin-bottom: 16px;
  }

  .input-group input,
  .input-group select {
    min-height: 47px;
    padding: 12px 13px;
  }

  .register-button {
    min-height: 49px;
  }
}

/* =========================================
   SHORT SCREENS
========================================= */

@media (min-width: 851px) and (max-height: 850px) {
  .auth-right {
    align-items: flex-start;
  }

  .auth-box {
    margin: 15px 0;
  }

  .auth-message {
    padding: 35px 0;
  }
}

/* =========================================
   ACCESSIBILITY
========================================= */

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    scroll-behavior: auto !important;
    transition-duration: 0.01ms !important;
    animation-duration: 0.01ms !important;
  }
}
</style>
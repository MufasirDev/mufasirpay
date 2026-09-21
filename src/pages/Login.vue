<template>
  <div class="login-page">

    <div class="login-container">

      <!-- LEFT SIDE -->
      <div class="login-brand">
        <div class="brand-logo">M</div>

        <h1>Welcome back</h1>

        <p>
          Login to your MufasirPay account and manage your
          money with ease.
        </p>

        <div class="brand-feature">
          <span>✓</span>
          Secure wallet
        </div>

        <div class="brand-feature">
          <span>✓</span>
          Fast transfers
        </div>

        <div class="brand-feature">
          <span>✓</span>
          Easy bill payments
        </div>
      </div>


      <!-- LOGIN FORM -->
      <div class="login-card">

        <div class="mobile-logo">M</div>

        <h2>Login to MufasirPay</h2>

        <p class="subtitle">
          Enter your details to continue
        </p>


        <form @submit.prevent="loginUser">

          <!-- EMAIL -->
          <div class="form-group">
            <label>Email Address</label>

            <input
              v-model="email"
              type="email"
              placeholder="Enter your email"
              required
            />
          </div>


          <!-- PASSWORD -->
          <div class="form-group">
            <label>Password</label>

            <input
              v-model="password"
              type="password"
              placeholder="Enter your password"
              required
            />
          </div>


          <!-- ERROR -->
          <div
            v-if="errorMessage"
            class="message error"
          >
            {{ errorMessage }}
          </div>


          <!-- LOGIN BUTTON -->
          <button
            type="submit"
            class="login-button"
            :disabled="loading"
          >
            <span v-if="loading">
              Logging in...
            </span>

            <span v-else>
              Login
            </span>
          </button>

        </form>


        <!-- REGISTER -->
        <p class="register-text">
          Don't have an account?

          <router-link to="/register">
            Create Account
          </router-link>
        </p>

        <router-link
          to="/"
          class="back-home"
        >
          ← Back to Home
        </router-link>

      </div>

    </div>

  </div>
</template>


<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../lib/supabase'

const router = useRouter()

const email = ref('')
const password = ref('')
const loading = ref(false)
const errorMessage = ref('')

/*
|--------------------------------------------------------------------------
| CHECK EXISTING SESSION
|--------------------------------------------------------------------------
| If the user is already logged in and visits /login,
| send them directly to the dashboard.
*/
onMounted(async () => {
  const { data } = await supabase.auth.getSession()

  if (data.session) {
    router.replace('/dashboard')
  }
})

/*
|--------------------------------------------------------------------------
| LOGIN
|--------------------------------------------------------------------------
*/
const loginUser = async () => {
  if (loading.value) return

  errorMessage.value = ''
  loading.value = true

  try {
    const { data, error } =
      await supabase.auth.signInWithPassword({
        email: email.value.trim(),
        password: password.value
      })

    if (error) {
      errorMessage.value =
        'Invalid email or password. Please check your details and try again.'
      return
    }

    if (!data.session) {
      errorMessage.value =
        'Login was not completed. Please try again.'
      return
    }

    // Successful login
    await router.replace('/dashboard')

  } catch (error: any) {
    console.error('Login error:', error)

    errorMessage.value =
      error?.message ||
      'Unable to login. Please check your email and password.'

  } finally {
    loading.value = false
  }
}
</script>


<style scoped>

/* =================================
   LOGIN PAGE
================================= */

.login-page {
  min-height: 100vh;
  background:
    radial-gradient(circle at top left, rgba(24, 184, 117, 0.08), transparent 35%),
    #f7faf8;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 30px;
}


/* =================================
   MAIN CONTAINER
================================= */

.login-container {
  width: 100%;
  max-width: 1050px;
  min-height: 650px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  background: #ffffff;
  border-radius: 28px;
  overflow: hidden;

  box-shadow:
    0 30px 80px rgba(6, 59, 43, 0.12),
    0 8px 25px rgba(6, 59, 43, 0.05);
}


/* =================================
   LEFT BRAND PANEL
================================= */

.login-brand {
  position: relative;
  overflow: hidden;

  background:
    radial-gradient(
      circle at 85% 15%,
      rgba(24, 184, 117, 0.35),
      transparent 32%
    ),
    linear-gradient(
      145deg,
      #042f24 0%,
      #063b2b 45%,
      #0a8754 100%
    );

  color: white;
  padding: 70px 55px;

  display: flex;
  flex-direction: column;
  justify-content: center;
}


/* Decorative background glow */

.login-brand::before {
  content: "";
  position: absolute;
  width: 260px;
  height: 260px;
  border-radius: 50%;
  right: -90px;
  bottom: -90px;
  background: rgba(24, 184, 117, 0.12);
  filter: blur(2px);
}

.login-brand::after {
  content: "";
  position: absolute;
  width: 180px;
  height: 180px;
  border-radius: 50%;
  left: -90px;
  top: -80px;
  background: rgba(255, 255, 255, 0.035);
}


/* =================================
   BRAND LOGO
================================= */

.brand-logo,
.mobile-logo {
  position: relative;
  overflow: hidden;

  width: 62px;
  height: 62px;
  min-width: 62px;

  border-radius: 18px;

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

  font-size: 29px;
  font-weight: 950;
  letter-spacing: -2px;

  box-shadow:
    0 12px 28px rgba(6, 59, 43, 0.28),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);

  z-index: 2;
}


/* Logo decorative strokes */

.brand-logo::before,
.mobile-logo::before {
  content: "";
  position: absolute;

  width: 34px;
  height: 7px;

  top: 12px;
  left: 15px;

  border-radius: 50%;

  border-top: 3px solid rgba(255, 255, 255, 0.95);
  border-left: 2px solid rgba(255, 255, 255, 0.6);

  transform: rotate(-15deg);
}


.brand-logo::after,
.mobile-logo::after {
  content: "";
  position: absolute;

  width: 28px;
  height: 10px;

  right: 7px;
  bottom: 9px;

  border-radius: 50%;

  background: rgba(4, 47, 36, 0.28);

  transform: rotate(-25deg);
}


/* =================================
   BRAND CONTENT
================================= */

.login-brand h1 {
  position: relative;
  z-index: 2;

  font-size: 42px;
  line-height: 1.1;

  margin: 30px 0 15px;

  font-weight: 900;
  letter-spacing: -1.5px;
}


.login-brand p {
  position: relative;
  z-index: 2;

  max-width: 420px;

  line-height: 1.75;

  color: #d8f5e8;

  font-size: 15px;
}


/* =================================
   BRAND FEATURES
================================= */

.brand-feature {
  position: relative;
  z-index: 2;

  margin-top: 24px;

  display: flex;
  align-items: center;

  gap: 12px;

  color: #eefcf6;
  font-size: 14px;
  font-weight: 600;
}


.brand-feature span {
  width: 27px;
  height: 27px;

  flex-shrink: 0;

  border-radius: 50%;

  background: rgba(255, 255, 255, 0.14);

  border: 1px solid rgba(255, 255, 255, 0.15);

  display: flex;
  align-items: center;
  justify-content: center;

  color: #baf5d8;
}


/* =================================
   LOGIN CARD
================================= */

.login-card {
  padding: 70px 55px;

  display: flex;
  flex-direction: column;
  justify-content: center;

  background: #ffffff;
}


/* Hidden on desktop */

.mobile-logo {
  display: none;
}


/* =================================
   HEADINGS
================================= */

.login-card h2 {
  color: #10271d;

  font-size: 30px;
  line-height: 1.2;

  margin: 0 0 8px;

  font-weight: 900;
  letter-spacing: -0.6px;
}


.subtitle {
  color: #6b7b73;

  margin-bottom: 35px;

  font-size: 14px;
  line-height: 1.6;
}


/* =================================
   FORM
================================= */

.form-group {
  margin-bottom: 20px;
}


.form-group label {
  display: block;

  margin-bottom: 8px;

  color: #1c3429;

  font-size: 14px;
  font-weight: 700;
}


.form-group input {
  width: 100%;
  box-sizing: border-box;

  padding: 15px 16px;

  border: 1px solid #d9e6df;

  border-radius: 12px;

  outline: none;

  background: #fbfdfc;

  color: #142a20;

  font-size: 15px;

  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    background 0.2s ease;
}


.form-group input::placeholder {
  color: #9aa9a2;
}


.form-group input:hover {
  border-color: #b8d7c9;
}


.form-group input:focus {
  border-color: #0ea96a;

  background: #ffffff;

  box-shadow:
    0 0 0 3px rgba(14, 169, 106, 0.11);
}


/* =================================
   ERROR MESSAGE
================================= */

.message {
  padding: 13px 15px;

  border-radius: 12px;

  margin-bottom: 18px;

  font-size: 14px;
  line-height: 1.5;
}


.error {
  background: #fff1f2;

  border: 1px solid #ffd5dc;

  color: #be123c;
}


/* =================================
   LOGIN BUTTON
================================= */

.login-button {
  width: 100%;

  padding: 15px 18px;

  border: none;

  border-radius: 12px;

  background:
    linear-gradient(
      135deg,
      #0ea96a,
      #078253
    );

  color: #ffffff;

  font-size: 15px;

  font-weight: 800;

  cursor: pointer;

  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    background 0.2s ease;

  box-shadow:
    0 10px 22px rgba(14, 169, 106, 0.18);
}


.login-button:hover {
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


.login-button:active {
  transform: translateY(0);
}


.login-button:disabled {
  opacity: 0.7;

  cursor: not-allowed;

  transform: none;

  box-shadow: none;
}


/* =================================
   REGISTER LINK
================================= */

.register-text {
  margin-top: 25px;

  text-align: center;

  color: #718079;

  font-size: 14px;
}


.register-text a {
  color: #0a8754;

  font-weight: 800;

  text-decoration: none;

  transition: color 0.2s ease;
}


.register-text a:hover {
  color: #063b2b;
}


/* =================================
   BACK HOME
================================= */

.back-home {
  margin-top: 18px;

  text-align: center;

  color: #718079;

  text-decoration: none;

  font-size: 14px;

  transition:
    color 0.2s ease,
    transform 0.2s ease;
}


.back-home:hover {
  color: #0a8754;
}


/* =================================
   MOBILE
================================= */

@media (max-width: 800px) {

  .login-page {
    padding: 20px;
  }

  .login-container {
    grid-template-columns: 1fr;

    min-height: auto;

    border-radius: 22px;
  }

  .login-brand {
    display: none;
  }

  .login-card {
    padding: 45px 30px;
  }

  .mobile-logo {
    display: flex;

    margin-bottom: 25px;
  }

  .login-card h2 {
    font-size: 27px;
  }

}


/* =================================
   SMALL MOBILE
================================= */

@media (max-width: 480px) {

  .login-page {
    padding: 14px;
  }

  .login-container {
    border-radius: 18px;
  }

  .login-card {
    padding: 35px 22px;
  }

  .mobile-logo {
    width: 56px;
    height: 56px;
    min-width: 56px;

    border-radius: 16px;

    font-size: 26px;
  }

  .login-card h2 {
    font-size: 25px;
  }

  .subtitle {
    margin-bottom: 28px;
  }

  .form-group input {
    padding: 14px;
  }

}

</style>
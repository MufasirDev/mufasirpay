import { createRouter, createWebHistory } from 'vue-router'

import { supabase } from '../lib/supabase'

import Home from '../pages/Home.vue'
import Register from '../pages/Register.vue'
import Login from '../pages/Login.vue'
import Dashboard from '../pages/Dashboard.vue'
import Wallet from '../pages/Wallet.vue'
import Transfer from '../pages/Transfer.vue'
import Transactions from '../pages/Transactions.vue'
import Airtime from '../pages/Airtime.vue'
import Profile from '../pages/Profile.vue'
import Bills from '../pages/Bills.vue'

const router = createRouter({
  history: createWebHistory(),

  routes: [
    {
      path: '/',
      name: 'Home',
      component: Home
    },

    {
      path: '/register',
      name: 'Register',
      component: Register
    },

    {
      path: '/login',
      name: 'Login',
      component: Login
    },

    // ================================
    // PROTECTED PAGES
    // ================================

    {
      path: '/dashboard',
      name: 'Dashboard',
      component: Dashboard,
      meta: {
        requiresAuth: true
      }
    },

    {
      path: '/wallet',
      name: 'Wallet',
      component: Wallet,
      meta: {
        requiresAuth: true
      }
    },

    {
      path: '/transfer',
      name: 'Transfer',
      component: Transfer,
      meta: {
        requiresAuth: true
      }
    },

    {
      path: '/transactions',
      name: 'Transactions',
      component: Transactions,
      meta: {
        requiresAuth: true
      }
    },

    {
      path: '/airtime',
      name: 'Airtime',
      component: Airtime,
      meta: {
        requiresAuth: true
      }
    },

    {
      path: '/profile',
      name: 'Profile',
      component: Profile,
      meta: {
        requiresAuth: true
      }
    },

    {
      path: '/bills',
      name: 'Bills',
      component: Bills,
      meta: {
        requiresAuth: true
      }
    }
  ]
})

// ============================================
// AUTHENTICATION GUARD
// ============================================

router.beforeEach(async (to) => {
  const {
    data: { session }
  } = await supabase.auth.getSession()

  // User is NOT logged in
  if (to.meta.requiresAuth && !session) {
    return {
      name: 'Login'
    }
  }

  // User IS already logged in
  // Don't allow them to go back to login
  if (to.name === 'Login' && session) {
    return {
      name: 'Dashboard'
    }
  }

  return true
})

export default router
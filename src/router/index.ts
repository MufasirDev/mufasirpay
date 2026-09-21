import { createRouter, createWebHistory } from 'vue-router'

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
    {
      path: '/dashboard',
      name: 'Dashboard',
      component: Dashboard
    },
    {
      path: '/wallet',
      name: 'Wallet',
      component: Wallet
    },
    {
      path: '/transfer',
      name: 'Transfer',
      component: Transfer
    },
    {
      path: '/transactions',
      name: 'Transactions',
      component: Transactions
    },
    {
      path: '/airtime',
      name: 'Airtime',
      component: Airtime
    },
    {
      path: '/profile',
      name: 'Profile',
      component: Profile
    },
    {
  path: '/bills',
  name: 'Bills',
  component: Bills
},
  ]
})

export default router
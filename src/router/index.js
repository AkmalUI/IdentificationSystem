import { createRouter, createWebHistory } from 'vue-router'

// Import your pages/components
import Profile from '@/pages/Profile.vue'
import Product from '@/pages/Product.vue'

// Define routes
const routes = [
  { path: '/', redirect: '/product' }, // default redirect
  { path: '/product', name: 'Product', component: Product },
  { path: '/profile', name: 'Profile', component: Profile },
]

// Create router instance
const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router

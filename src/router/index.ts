import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/Login.vue'
import Home from '../views/Home.vue'
import NotFound from '../views/NotFound.vue'
import { useAuthStore } from '@/stores/auth'

const routes = [
  { path: '/', redirect: '/home' },
  { path: '/login', component: Login, meta: { requiresAuth: false } },
  { path: '/home', component: Home, meta: { requiresAuth: true } },
  { path: '/:pathMatch(.*)*', component: NotFound }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore()
  const isAuthenticated = authStore.isLoggedIn

  if (to.meta.requiresAuth && !isAuthenticated) {
    next({ path: '/login', query: { redirect: to.fullPath } })
  } else if (to.path === '/login' && isAuthenticated) {
    next({ path: '/home' })
  } else {
    next()
  }
})

export default router

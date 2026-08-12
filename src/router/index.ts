import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/Login.vue'
import Home from '../views/Home.vue'
import NotFound from '../views/NotFound.vue'
import HomePage from '../views/pages/HomePage.vue'
import BrandManage from '../views/pages/BrandManage.vue'
import Statistics from '../views/pages/Statistics.vue'
import UserManage from '../views/pages/UserManage.vue'
import RoleManage from '../views/pages/RoleManage.vue'
import SystemConfig from '../views/pages/SystemConfig.vue'
import { useAuthStore } from '@/stores/auth'

const routes = [
  { path: '/', redirect: '/home' },
  { path: '/login', component: Login, meta: { requiresAuth: false } },
  {
    path: '/home',
    component: Home,
    meta: { requiresAuth: true },
    children: [
      { path: '', component: HomePage },
      { path: 'brand-manage', component: BrandManage },
      { path: 'statistics', component: Statistics },
      { path: 'user-manage', component: UserManage },
      { path: 'role-manage', component: RoleManage },
      { path: 'system-config', component: SystemConfig },
    ],
  },
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

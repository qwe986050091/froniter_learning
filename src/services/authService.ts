import { frontierService } from '@/api'
import { useAuthStore } from '@/stores/auth'
import type { LoginRequest } from '@/types'

export async function login(req: LoginRequest) {
  const res = await frontierService.login(req)
  const authStore = useAuthStore()

  if (res.token) {
    authStore.setToken(res.token)
  }
  if (res.refreshToken) {
    authStore.setRefreshToken(res.refreshToken)
  }
  if (res.userInfo) {
    authStore.setUserInfo(res.userInfo)
  }

  return res
}

export async function logout() {
  const authStore = useAuthStore()
  try {
    await frontierService.logout()
  } catch {
    // ignore
  }
  authStore.clear()
}

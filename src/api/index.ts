import { useAuthStore } from '@/stores/auth'
import type { LoginRequest, LoginResponse, MenuItem, ServiceException } from '../types'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

export class FrontierServiceImpl {
  private getAuthHeaders(): Record<string, string> {
    const authStore = useAuthStore()
    return authStore.getAuthHeader()
  }

  // 统一处理 401（登录失效）：清除本地登录态并跳转登录页
  private handleUnauthorized() {
    const authStore = useAuthStore()
    authStore.clear()
    // 使用整页跳转，避免与 router 产生循环依赖
    if (window.location.pathname !== '/login') {
      window.location.assign('/login')
    }
  }

  // 统一请求封装：auth=true 时自动附带 token；遇到 401 自动跳转登录页
  private async request<T>(
    path: string,
    options: RequestInit = {},
    auth = false
  ): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    if (auth) {
      Object.assign(headers, this.getAuthHeaders())
    }

    const response = await fetch(`${BASE_URL}${path}`, { ...options, headers })

    // 登录失效（后端在 token 无效/缺失时返回 401）
    if (response.status === 401) {
      this.handleUnauthorized()
      const error: ServiceException = {
        code: 'UNAUTHORIZED',
        description: '登录已失效，请重新登录',
      }
      throw error
    }

    if (!response.ok) {
      const data = await response.json().catch(() => null)
      const error: ServiceException = {
        code: data?.code || String(response.status),
        description: data?.message || response.statusText || '请求失败',
      }
      throw error
    }

    if (response.status === 204) {
      return undefined as T
    }
    return response.json() as Promise<T>
  }

  async login(req: LoginRequest): Promise<LoginResponse> {
    return this.request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(req),
    })
  }

  async logout(): Promise<void> {
    try {
      await this.request<void>('/auth/logout', { method: 'POST' }, true)
    } catch {
      // ignore logout errors
    }
  }

  async getMenu(): Promise<MenuItem[]> {
    return this.request<MenuItem[]>('/menu', { method: 'GET' }, true)
  }
}

export const frontierService = new FrontierServiceImpl()

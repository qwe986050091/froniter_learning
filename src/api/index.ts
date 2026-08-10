import { useAuthStore } from '@/stores/auth'
import type { LoginRequest, LoginResponse, MenuItem, ServiceException } from '../types'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

export class FrontierServiceImpl {
  private getAuthHeaders(): Record<string, string> {
    const authStore = useAuthStore()
    return authStore.getAuthHeader()
  }

  async login(req: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(req),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => null)
        const error: ServiceException = {
          code: data?.code || String(response.status),
          description: data?.message || response.statusText || '请求失败',
        }
        throw error
      }

      const data = await response.json() as LoginResponse
      return data
    } catch (err) {
      if (this.isServiceException(err)) {
        throw err
      }
      const error: ServiceException = {
        code: 'NETWORK_ERROR',
        description: err instanceof Error ? err.message : '网络异常',
      }
      throw error
    }
  }

  async logout(): Promise<void> {
    try {
      await fetch(`${BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          ...this.getAuthHeaders(),
          'Content-Type': 'application/json',
        },
      })
    } catch {
      // ignore logout errors
    }
  }

  async getMenu(): Promise<MenuItem[]> {
    try {
      const response = await fetch(`${BASE_URL}/menu`, {
        method: 'GET',
        headers: {
          ...this.getAuthHeaders(),
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const data = await response.json().catch(() => null)
        const error: ServiceException = {
          code: data?.code || String(response.status),
          description: data?.message || response.statusText || '获取菜单失败',
        }
        throw error
      }

      return await response.json() as MenuItem[]
    } catch (err) {
      if (this.isServiceException(err)) {
        throw err
      }
      const error: ServiceException = {
        code: 'NETWORK_ERROR',
        description: err instanceof Error ? err.message : '网络异常',
      }
      throw error
    }
  }

  private isServiceException(err: unknown): err is ServiceException {
    return (
      typeof err === 'object' &&
      err !== null &&
      'code' in err &&
      'description' in err
    )
  }
}

export const frontierService = new FrontierServiceImpl()

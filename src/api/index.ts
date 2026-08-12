import { useAuthStore } from '@/stores/auth'
import type {
  Brand,
  BrandCreateRequest,
  BrandPageResult,
  BrandQuery,
  BrandSortRequest,
  BrandStatusRequest,
  BrandUpdateRequest,
  LoginRequest,
  LoginResponse,
  MenuItem,
  ServiceException,
} from '../types'

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
      const redirect = encodeURIComponent(window.location.pathname + window.location.search)
      window.location.assign(`/login?redirect=${redirect}`)
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

  // 把查询对象拼成 URLSearchParams（跳过空值）
  private buildSearchParams(
    query: Record<string, string | number | boolean | undefined | null>
  ): string {
    const params = new URLSearchParams()
    for (const [k, v] of Object.entries(query)) {
      if (v === undefined || v === null || v === '') continue
      params.append(k, String(v))
    }
    const str = params.toString()
    return str ? `?${str}` : ''
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

  // ==================== 品牌管理 ====================

  async listBrand(query: BrandQuery = {}): Promise<BrandPageResult> {
    const qs = this.buildSearchParams({
      name: query.name,
      status: query.status,
      page: query.page ?? 1,
      pageSize: query.pageSize ?? 10,
    })
    return this.request<BrandPageResult>(`/brand${qs}`, { method: 'GET' }, true)
  }

  async getBrandById(id: number): Promise<Brand> {
    return this.request<Brand>(`/brand/${id}`, { method: 'GET' }, true)
  }

  async createBrand(req: BrandCreateRequest): Promise<Brand> {
    return this.request<Brand>('/brand', {
      method: 'POST',
      body: JSON.stringify(req),
    }, true)
  }

  async updateBrand(req: BrandUpdateRequest): Promise<Brand> {
    return this.request<Brand>(`/brand/${req.id}`, {
      method: 'PUT',
      body: JSON.stringify(req),
    }, true)
  }

  async deleteBrandById(id: number): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/brand/${id}`, { method: 'DELETE' }, true)
  }

  async updateBrandStatus(req: BrandStatusRequest): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/brand/${req.id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status: req.status }),
    }, true)
  }

  async updateBrandSort(req: BrandSortRequest): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/brand/${req.id}/sort`, {
      method: 'PATCH',
      body: JSON.stringify({ sort: req.sort }),
    }, true)
  }
}

export const frontierService = new FrontierServiceImpl()

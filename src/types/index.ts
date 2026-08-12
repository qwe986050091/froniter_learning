export interface LoginRequest {
  username: string
  password: string
  captcha?: string
  loginType?: string
}

export interface LoginResponse {
  code: string
  message: string
  token?: string
  refreshToken?: string
  userInfo?: UserInfo
}

export interface UserInfo {
  userId: string
  username: string
  nickname?: string
  avatar?: string
  roles?: string[]
  extra?: Record<string, string>
}

export interface ServiceException {
  code: string
  description: string
}

export interface MenuItem {
  id: string
  name: string
  icon?: string
  path?: string
  desc?: string
  children?: MenuItem[]
}

// ==================== 品牌管理 ====================

export interface Brand {
  id?: number
  name: string
  logo?: string
  firstLetter: string
  category: string
  description?: string
  sort?: number
  status?: number // 1 启用 0 禁用
  createTime?: string
}

export interface BrandQuery {
  name?: string
  status?: number // 1 启用 0 禁用；不传表示全部
  page?: number // 页码，从 1 开始
  pageSize?: number // 每页条数
}

export interface BrandPageResult {
  list: Brand[]
  total: number
  page: number
  pageSize: number
}

export interface BrandCreateRequest {
  name: string
  logo?: string
  firstLetter: string
  category: string
  description?: string
  sort?: number
  status?: number
}

export interface BrandUpdateRequest {
  id: number
  name: string
  logo?: string
  firstLetter: string
  category: string
  description?: string
  sort?: number
  status?: number
}

export interface BrandStatusRequest {
  id: number
  status: number
}

export interface BrandSortRequest {
  id: number
  sort: number
}

export interface FrontierService {
  login(req: LoginRequest): Promise<LoginResponse>
  getMenu(): Promise<MenuItem[]>

  listBrand(query: BrandQuery): Promise<BrandPageResult>
  getBrandById(id: number): Promise<Brand>
  createBrand(req: BrandCreateRequest): Promise<Brand>
  updateBrand(req: BrandUpdateRequest): Promise<Brand>
  deleteBrandById(id: number): Promise<boolean>
  updateBrandStatus(req: BrandStatusRequest): Promise<boolean>
  updateBrandSort(req: BrandSortRequest): Promise<boolean>
}

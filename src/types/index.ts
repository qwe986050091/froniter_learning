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
  id: number
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

// ==================== 平台分类 & 平台属性 ====================

export interface Category {
  id: number
  name: string
  parentId: number // 一级分类 parentId = 0
  level: 1 | 2 | 3
  sort?: number
  status?: number // 1 启用 0 禁用
  createTime?: string
}

export interface PlatformAttr {
  id: number
  name: string
  categoryId: number // 所属三级分类 id
  sort?: number
  status?: number
  createTime?: string
}

export interface PlatformAttrValue {
  id: number
  attrId: number
  value: string
  sort?: number
}

export interface PlatformAttrWithValues extends PlatformAttr {
  values: PlatformAttrValue[]
}

export interface CategoryQuery {
  level?: 1 | 2 | 3
  parentId?: number
}

export interface PlatformAttrQuery {
  categoryId?: number
  name?: string
  status?: number
  page?: number
  pageSize?: number
}

export interface PlatformAttrPageResult {
  list: PlatformAttrWithValues[]
  total: number
  page: number
  pageSize: number
}

export interface CategoryCreateRequest {
  name: string
  parentId: number
  level: 1 | 2 | 3
  sort?: number
  status?: number
}

export interface CategoryUpdateRequest {
  id: number
  name: string
  parentId?: number
  level?: 1 | 2 | 3
  sort?: number
  status?: number
}

export interface PlatformAttrCreateRequest {
  name: string
  categoryId: number
  values: string[]
  sort?: number
  status?: number
}

export interface PlatformAttrUpdateRequest {
  id: number
  name: string
  categoryId?: number
  values: string[]
  sort?: number
  status?: number
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

  // 分类
  listCategory(query?: CategoryQuery): Promise<Category[]>
  createCategory(req: CategoryCreateRequest): Promise<Category>
  updateCategory(req: CategoryUpdateRequest): Promise<Category>
  updateCategoryStatus(req: { id: number; status: number }): Promise<{ success: boolean }>
  deleteCategoryById(id: number): Promise<{ success: boolean }>

  // 平台属性
  listPlatformAttr(query?: PlatformAttrQuery): Promise<PlatformAttrPageResult>
  getPlatformAttrById(id: number): Promise<PlatformAttrWithValues>
  createPlatformAttr(req: PlatformAttrCreateRequest): Promise<PlatformAttr>
  updatePlatformAttr(req: PlatformAttrUpdateRequest): Promise<PlatformAttr>
  deletePlatformAttrById(id: number): Promise<{ success: boolean }>
}

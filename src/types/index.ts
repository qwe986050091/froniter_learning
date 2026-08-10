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

export interface FrontierService {
  login(req: LoginRequest): Promise<LoginResponse>
}

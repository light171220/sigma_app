import { ValidationError } from './common.types'

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  errors?: ValidationError[]
  message?: string
  timestamp: string
  requestId: string
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: PaginationInfo
}

export interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrevious: boolean
}

export interface ApiError {
  code: string
  message: string
  details?: any
  field?: string
  stack?: string
}

export interface ApiRequestConfig {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  url: string
  params?: Record<string, any>
  data?: any
  headers?: Record<string, string>
  timeout?: number
  retries?: number
  retryDelay?: number
}

export interface ApiClient {
  get<T = any>(url: string, config?: Partial<ApiRequestConfig>): Promise<ApiResponse<T>>
  post<T = any>(url: string, data?: any, config?: Partial<ApiRequestConfig>): Promise<ApiResponse<T>>
  put<T = any>(url: string, data?: any, config?: Partial<ApiRequestConfig>): Promise<ApiResponse<T>>
  patch<T = any>(url: string, data?: any, config?: Partial<ApiRequestConfig>): Promise<ApiResponse<T>>
  delete<T = any>(url: string, config?: Partial<ApiRequestConfig>): Promise<ApiResponse<T>>
  upload<T = any>(url: string, file: File, config?: Partial<ApiRequestConfig>): Promise<ApiResponse<T>>
}

export interface AuthApiEndpoints {
  login: '/auth/login'
  register: '/auth/register'
  logout: '/auth/logout'
  refresh: '/auth/refresh'
  forgotPassword: '/auth/forgot-password'
  resetPassword: '/auth/reset-password'
  profile: '/auth/profile'
  updateProfile: '/auth/profile'
  changePassword: '/auth/change-password'
  socialLogin: '/auth/social'
}

export interface AppApiEndpoints {
  list: '/apps'
  create: '/apps'
  get: '/apps/:id'
  update: '/apps/:id'
  delete: '/apps/:id'
  duplicate: '/apps/:id/duplicate'
  publish: '/apps/:id/publish'
  unpublish: '/apps/:id/unpublish'
  screens: '/apps/:id/screens'
  components: '/apps/:id/components'
  database: '/apps/:id/database'
  workflows: '/apps/:id/workflows'
  settings: '/apps/:id/settings'
  collaborators: '/apps/:id/collaborators'
  preview: '/apps/:id/preview'
  export: '/apps/:id/export'
  import: '/apps/import'
}

export interface DeploymentApiEndpoints {
  list: '/deployments'
  create: '/deployments'
  get: '/deployments/:id'
  cancel: '/deployments/:id/cancel'
  retry: '/deployments/:id/retry'
  rollback: '/deployments/:id/rollback'
  logs: '/deployments/:id/logs'
  artifacts: '/deployments/:id/artifacts'
  download: '/deployments/:id/artifacts/:artifactId/download'
  status: '/deployments/:id/status'
}

export interface TemplateApiEndpoints {
  list: '/templates'
  get: '/templates/:id'
  categories: '/templates/categories'
  featured: '/templates/featured'
  popular: '/templates/popular'
  recent: '/templates/recent'
  search: '/templates/search'
}

export interface FileApiEndpoints {
  upload: '/files/upload'
  get: '/files/:id'
  delete: '/files/:id'
  list: '/files'
  download: '/files/:id/download'
  thumbnail: '/files/:id/thumbnail'
}

export interface WebSocketEvents {
  connect: 'connect'
  disconnect: 'disconnect'
  error: 'error'
  userJoined: 'user:joined'
  userLeft: 'user:left'
  cursorMove: 'cursor:move'
  componentUpdate: 'component:update'
  componentAdd: 'component:add'
  componentDelete: 'component:delete'
  screenUpdate: 'screen:update'
  appUpdate: 'app:update'
  buildUpdate: 'build:update'
  collaboratorUpdate: 'collaborator:update'
}

export interface WebSocketMessage<T = any> {
  event: string
  data: T
  userId?: string
  timestamp: string
  roomId?: string
}

export interface CollaborationEvent {
  type: 'cursor' | 'selection' | 'edit' | 'lock' | 'unlock'
  userId: string
  data: any
  timestamp: string
}

export interface RateLimitInfo {
  limit: number
  remaining: number
  reset: number
  retryAfter?: number
}

export interface ApiMetrics {
  requestCount: number
  errorCount: number
  averageResponseTime: number
  slowestEndpoint: string
  fastestEndpoint: string
  uptime: number
}
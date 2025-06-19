import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { ApiResponse, ApiRequestConfig, ApiClient, AuthTokens } from '@/types'
import { API_BASE_URL } from './constants'

class ApiClientImpl implements ApiClient {
  private instance: AxiosInstance
  private refreshTokenPromise: Promise<string> | null = null

  constructor() {
    this.instance = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    this.setupInterceptors()
  }

  private setupInterceptors() {
    this.instance.interceptors.request.use(
      (config) => {
        const token = this.getAccessToken()
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => Promise.reject(error)
    )

    this.instance.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true

          try {
            const newToken = await this.refreshAccessToken()
            originalRequest.headers.Authorization = `Bearer ${newToken}`
            return this.instance(originalRequest)
          } catch (refreshError) {
            this.handleAuthFailure()
            return Promise.reject(refreshError)
          }
        }

        return Promise.reject(error)
      }
    )
  }

  private getAccessToken(): string | null {
    return localStorage.getItem('accessToken')
  }

  private getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken')
  }

  private setTokens(tokens: AuthTokens) {
    localStorage.setItem('accessToken', tokens.accessToken)
    localStorage.setItem('refreshToken', tokens.refreshToken)
    localStorage.setItem('tokenExpiresAt', tokens.expiresAt)
  }

  private clearTokens() {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('tokenExpiresAt')
  }

  private async refreshAccessToken(): Promise<string> {
    if (this.refreshTokenPromise) {
      return this.refreshTokenPromise
    }

    const refreshToken = this.getRefreshToken()
    if (!refreshToken) {
      throw new Error('No refresh token available')
    }

    this.refreshTokenPromise = this.instance
      .post('/auth/refresh', { refreshToken })
      .then((response: AxiosResponse<ApiResponse<AuthTokens>>) => {
        const tokens = response.data.data
        if (tokens) {
          this.setTokens(tokens)
          return tokens.accessToken
        }
        throw new Error('Invalid token response')
      })
      .finally(() => {
        this.refreshTokenPromise = null
      })

    return this.refreshTokenPromise
  }

  private handleAuthFailure() {
    this.clearTokens()
    window.location.href = '/login'
  }

  private async makeRequest<T>(config: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<ApiResponse<T>> = await this.instance(config)
      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        throw error.response.data
      }
      throw {
        success: false,
        error: error.message || 'Network error',
        timestamp: new Date().toISOString(),
        requestId: Math.random().toString(36),
      }
    }
  }

  async get<T = any>(url: string, config?: Partial<ApiRequestConfig>): Promise<ApiResponse<T>> {
    return this.makeRequest<T>({
      method: 'GET',
      url,
      params: config?.params,
      headers: config?.headers,
      timeout: config?.timeout,
    })
  }

  async post<T = any>(url: string, data?: any, config?: Partial<ApiRequestConfig>): Promise<ApiResponse<T>> {
    return this.makeRequest<T>({
      method: 'POST',
      url,
      data,
      params: config?.params,
      headers: config?.headers,
      timeout: config?.timeout,
    })
  }

  async put<T = any>(url: string, data?: any, config?: Partial<ApiRequestConfig>): Promise<ApiResponse<T>> {
    return this.makeRequest<T>({
      method: 'PUT',
      url,
      data,
      params: config?.params,
      headers: config?.headers,
      timeout: config?.timeout,
    })
  }

  async patch<T = any>(url: string, data?: any, config?: Partial<ApiRequestConfig>): Promise<ApiResponse<T>> {
    return this.makeRequest<T>({
      method: 'PATCH',
      url,
      data,
      params: config?.params,
      headers: config?.headers,
      timeout: config?.timeout,
    })
  }

  async delete<T = any>(url: string, config?: Partial<ApiRequestConfig>): Promise<ApiResponse<T>> {
    return this.makeRequest<T>({
      method: 'DELETE',
      url,
      params: config?.params,
      headers: config?.headers,
      timeout: config?.timeout,
    })
  }

  async upload<T = any>(url: string, file: File, config?: Partial<ApiRequestConfig>): Promise<ApiResponse<T>> {
    const formData = new FormData()
    formData.append('file', file)

    return this.makeRequest<T>({
      method: 'POST',
      url,
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
        ...config?.headers,
      },
      timeout: config?.timeout || 60000,
      onUploadProgress: (progressEvent) => {
        const progress = progressEvent.total
          ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
          : 0
        console.log(`Upload Progress: ${progress}%`)
      },
    })
  }

  setAuthTokens(tokens: AuthTokens) {
    this.setTokens(tokens)
  }

  clearAuth() {
    this.clearTokens()
  }

  isAuthenticated(): boolean {
    const token = this.getAccessToken()
    const expiresAt = localStorage.getItem('tokenExpiresAt')
    
    if (!token || !expiresAt) {
      return false
    }

    return new Date(expiresAt) > new Date()
  }
}

export const apiClient = new ApiClientImpl()
export default apiClient
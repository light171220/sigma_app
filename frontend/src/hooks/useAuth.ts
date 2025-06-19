import { useState, useEffect, useCallback } from 'react'
import { User, AuthState, LoginCredentials, RegisterCredentials, ForgotPasswordRequest, ResetPasswordRequest, AuthTokens } from '@/types'
import { apiClient } from '@/utils/apiClient'

interface UseAuthReturn extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>
  register: (credentials: RegisterCredentials) => Promise<void>
  logout: () => Promise<void>
  forgotPassword: (request: ForgotPasswordRequest) => Promise<void>
  resetPassword: (request: ResetPasswordRequest) => Promise<void>
  updateProfile: (updates: Partial<User>) => Promise<void>
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>
  socialLogin: (provider: string, token: string) => Promise<void>
  refreshToken: () => Promise<void>
  checkAuth: () => Promise<void>
}

export const useAuth = (): UseAuthReturn => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  })

  const setUser = useCallback((user: User | null) => {
    setState(prev => ({
      ...prev,
      user,
      isAuthenticated: !!user,
      error: null,
    }))
  }, [])

  const setLoading = useCallback((isLoading: boolean) => {
    setState(prev => ({ ...prev, isLoading }))
  }, [])

  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, error, isLoading: false }))
  }, [])

  const login = useCallback(async (credentials: LoginCredentials) => {
    try {
      setLoading(true)
      setError(null)

      const response = await apiClient.post<{ user: User; tokens: AuthTokens }>('/auth/login', credentials)
      
      if (response.success && response.data) {
        const { user, tokens } = response.data
        apiClient.setAuthTokens(tokens)
        setUser(user)
      } else {
        throw new Error(response.error || 'Login failed')
      }
    } catch (error: any) {
      setError(error.message || 'Login failed')
      throw error
    } finally {
      setLoading(false)
    }
  }, [setUser, setLoading, setError])

  const register = useCallback(async (credentials: RegisterCredentials) => {
    try {
      setLoading(true)
      setError(null)

      const response = await apiClient.post<{ user: User; tokens: AuthTokens }>('/auth/register', credentials)
      
      if (response.success && response.data) {
        const { user, tokens } = response.data
        apiClient.setAuthTokens(tokens)
        setUser(user)
      } else {
        throw new Error(response.error || 'Registration failed')
      }
    } catch (error: any) {
      setError(error.message || 'Registration failed')
      throw error
    } finally {
      setLoading(false)
    }
  }, [setUser, setLoading, setError])

  const logout = useCallback(async () => {
    try {
      setLoading(true)
      await apiClient.post('/auth/logout')
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      apiClient.clearAuth()
      setUser(null)
      setLoading(false)
    }
  }, [setUser, setLoading])

  const forgotPassword = useCallback(async (request: ForgotPasswordRequest) => {
    try {
      setLoading(true)
      setError(null)

      const response = await apiClient.post('/auth/forgot-password', request)
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to send reset email')
      }
    } catch (error: any) {
      setError(error.message || 'Failed to send reset email')
      throw error
    } finally {
      setLoading(false)
    }
  }, [setLoading, setError])

  const resetPassword = useCallback(async (request: ResetPasswordRequest) => {
    try {
      setLoading(true)
      setError(null)

      const response = await apiClient.post('/auth/reset-password', request)
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to reset password')
      }
    } catch (error: any) {
      setError(error.message || 'Failed to reset password')
      throw error
    } finally {
      setLoading(false)
    }
  }, [setLoading, setError])

  const updateProfile = useCallback(async (updates: Partial<User>) => {
    try {
      setLoading(true)
      setError(null)

      const response = await apiClient.put<User>('/auth/profile', updates)
      
      if (response.success && response.data) {
        setUser(response.data)
      } else {
        throw new Error(response.error || 'Failed to update profile')
      }
    } catch (error: any) {
      setError(error.message || 'Failed to update profile')
      throw error
    } finally {
      setLoading(false)
    }
  }, [setUser, setLoading, setError])

  const changePassword = useCallback(async (currentPassword: string, newPassword: string) => {
    try {
      setLoading(true)
      setError(null)

      const response = await apiClient.post('/auth/change-password', {
        currentPassword,
        newPassword,
      })
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to change password')
      }
    } catch (error: any) {
      setError(error.message || 'Failed to change password')
      throw error
    } finally {
      setLoading(false)
    }
  }, [setLoading, setError])

  const socialLogin = useCallback(async (provider: string, token: string) => {
    try {
      setLoading(true)
      setError(null)

      const response = await apiClient.post<{ user: User; tokens: AuthTokens }>('/auth/social', {
        provider,
        token,
      })
      
      if (response.success && response.data) {
        const { user, tokens } = response.data
        apiClient.setAuthTokens(tokens)
        setUser(user)
      } else {
        throw new Error(response.error || 'Social login failed')
      }
    } catch (error: any) {
      setError(error.message || 'Social login failed')
      throw error
    } finally {
      setLoading(false)
    }
  }, [setUser, setLoading, setError])

  const refreshToken = useCallback(async () => {
    try {
      const response = await apiClient.post<AuthTokens>('/auth/refresh')
      
      if (response.success && response.data) {
        apiClient.setAuthTokens(response.data)
      } else {
        throw new Error('Token refresh failed')
      }
    } catch (error) {
      await logout()
      throw error
    }
  }, [logout])

  const checkAuth = useCallback(async () => {
    try {
      setLoading(true)
      
      if (!apiClient.isAuthenticated()) {
        setUser(null)
        return
      }

      const response = await apiClient.get<User>('/auth/profile')
      
      if (response.success && response.data) {
        setUser(response.data)
      } else {
        setUser(null)
      }
    } catch (error) {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [setUser, setLoading])

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'accessToken' && !e.newValue) {
        setUser(null)
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [setUser])

  return {
    ...state,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    updateProfile,
    changePassword,
    socialLogin,
    refreshToken,
    checkAuth,
  }
}
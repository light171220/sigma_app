export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  avatar?: string
  preferences: UserPreferences
  createdAt: string
  updatedAt: string
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto'
  language: string
  timezone: string
  notifications: NotificationSettings
  workspace: WorkspaceSettings
}

export interface NotificationSettings {
  email: boolean
  push: boolean
  buildComplete: boolean
  collaboratorInvite: boolean
  deploymentSuccess: boolean
  deploymentFailure: boolean
}

export interface WorkspaceSettings {
  autoSave: boolean
  autoSaveInterval: number
  gridSnapping: boolean
  showGrid: boolean
  defaultDevice: string
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

export interface LoginCredentials {
  email: string
  password: string
  rememberMe?: boolean
}

export interface RegisterCredentials {
  email: string
  password: string
  confirmPassword: string
  firstName: string
  lastName: string
  acceptTerms: boolean
}

export interface ForgotPasswordRequest {
  email: string
}

export interface ResetPasswordRequest {
  token: string
  password: string
  confirmPassword: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
  expiresAt: string
}

export interface SocialAuthProvider {
  id: string
  name: string
  icon: string
  color: string
}
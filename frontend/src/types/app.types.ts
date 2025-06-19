import { Component } from './component.types'
import { DatabaseSchema } from './database.types'
import { Workflow } from './workflow.types'
import { Color, Platform } from './common.types'

export interface App {
  id: string
  name: string
  description: string
  icon?: string
  category: AppCategory
  status: AppStatus
  screens: Screen[]
  database: DatabaseSchema
  workflows: Workflow[]
  settings: AppSettings
  collaborators: Collaborator[]
  createdAt: string
  updatedAt: string
  version: string
  publishedVersion?: string
}

export type AppStatus = 'draft' | 'building' | 'published' | 'error' | 'archived'

export type AppCategory = 
  | 'business'
  | 'productivity'
  | 'finance'
  | 'hr'
  | 'service'
  | 'education'
  | 'healthcare'
  | 'custom'

export interface Screen {
  id: string
  name: string
  title: string
  isHome: boolean
  components: Component[]
  navigation: ScreenNavigation
  settings: ScreenSettings
  createdAt: string
  updatedAt: string
}

export interface ScreenNavigation {
  type: 'stack' | 'tab' | 'drawer'
  showHeader: boolean
  headerTitle?: string
  headerBackTitle?: string
  headerColor?: Color
  headerTransparent: boolean
  tabBarIcon?: string
  tabBarLabel?: string
}

export interface ScreenSettings {
  backgroundColor: Color
  backgroundImage?: string
  safeAreaInsets: boolean
  statusBarStyle: 'light' | 'dark' | 'auto'
  orientation: 'portrait' | 'landscape' | 'both'
  scrollable: boolean
  refreshable: boolean
}

export interface AppSettings {
  general: GeneralSettings
  appearance: AppearanceSettings
  permissions: PermissionSettings
  integrations: IntegrationSettings
  build: BuildSettings
}

export interface GeneralSettings {
  bundleId: string
  version: string
  buildNumber: number
  supportEmail: string
  privacyPolicyUrl?: string
  termsOfServiceUrl?: string
  minimumOSVersion: string
}

export interface AppearanceSettings {
  theme: 'light' | 'dark' | 'auto'
  primaryColor: Color
  accentColor: Color
  fontFamily: string
  splashScreen: SplashScreenSettings
  appIcon: AppIconSettings
}

export interface SplashScreenSettings {
  backgroundColor: Color
  logo?: string
  showLoadingIndicator: boolean
  duration: number
}

export interface AppIconSettings {
  source?: string
  backgroundColor: Color
  cornerRadius: number
}

export interface PermissionSettings {
  camera: boolean
  microphone: boolean
  location: boolean
  contacts: boolean
  calendar: boolean
  photos: boolean
  notifications: boolean
  fileSystem: boolean
}

export interface IntegrationSettings {
  analytics: boolean
  crashReporting: boolean
  pushNotifications: boolean
  socialLogin: SocialLoginSettings
  apis: ApiIntegration[]
}

export interface SocialLoginSettings {
  google: boolean
  facebook: boolean
  twitter: boolean
  github: boolean
}

export interface ApiIntegration {
  id: string
  name: string
  baseUrl: string
  headers: Record<string, string>
  authentication: ApiAuthentication
}

export interface ApiAuthentication {
  type: 'none' | 'bearer' | 'api-key' | 'oauth2'
  token?: string
  apiKey?: string
  oauth2Config?: OAuth2Config
}

export interface OAuth2Config {
  clientId: string
  clientSecret: string
  authUrl: string
  tokenUrl: string
  scopes: string[]
}

export interface BuildSettings {
  platforms: Platform[]
  environment: 'development' | 'staging' | 'production'
  minifyCode: boolean
  optimizeImages: boolean
  generateSourceMaps: boolean
  enableDebugMode: boolean
}

export interface Collaborator {
  id: string
  userId: string
  email: string
  name: string
  avatar?: string
  role: CollaboratorRole
  permissions: CollaboratorPermissions
  invitedAt: string
  joinedAt?: string
  status: 'invited' | 'active' | 'inactive'
}

export type CollaboratorRole = 'owner' | 'admin' | 'editor' | 'viewer'

export interface CollaboratorPermissions {
  canEdit: boolean
  canDelete: boolean
  canDeploy: boolean
  canInvite: boolean
  canManageSettings: boolean
}

export interface AppTemplate {
  id: string
  name: string
  description: string
  category: AppCategory
  preview: string[]
  thumbnail: string
  screens: Screen[]
  database: DatabaseSchema
  workflows: Workflow[]
  settings: Partial<AppSettings>
  tags: string[]
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  estimatedTime: number
}
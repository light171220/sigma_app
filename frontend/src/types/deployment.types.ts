import { Platform } from './common.types'

export interface Deployment {
  id: string
  appId: string
  version: string
  buildNumber: number
  platform: Platform
  environment: DeploymentEnvironment
  status: DeploymentStatus
  configuration: DeploymentConfig
  artifacts: BuildArtifact[]
  logs: BuildLog[]
  startedAt: string
  completedAt?: string
  duration?: number
  deployedBy: string
  rollbackTo?: string
}

export type DeploymentEnvironment = 'development' | 'staging' | 'production'

export type DeploymentStatus = 
  | 'pending'
  | 'building'
  | 'testing'
  | 'signing'
  | 'uploading'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'rolled_back'

export interface DeploymentConfig {
  platforms: Platform[]
  buildType: 'debug' | 'release'
  optimization: OptimizationSettings
  signing: SigningConfig
  store: StoreConfig
  notification: NotificationConfig
}

export interface OptimizationSettings {
  minifyCode: boolean
  optimizeImages: boolean
  compressAssets: boolean
  generateSourceMaps: boolean
  treeshaking: boolean
  bundleSplitting: boolean
  caching: CacheSettings
}

export interface CacheSettings {
  enabled: boolean
  strategy: 'aggressive' | 'conservative' | 'custom'
  maxAge: number
  staticAssets: boolean
  apiResponses: boolean
}

export interface SigningConfig {
  ios: IOSSigningConfig
  android: AndroidSigningConfig
}

export interface IOSSigningConfig {
  teamId: string
  certificateId: string
  provisioningProfileId: string
  bundleId: string
  appStoreConnectApiKey?: string
  automaticSigning: boolean
}

export interface AndroidSigningConfig {
  keystorePath: string
  keystorePassword: string
  keyAlias: string
  keyPassword: string
  storeFile?: string
}

export interface StoreConfig {
  appStore: AppStoreConfig
  playStore: PlayStoreConfig
  testFlight: TestFlightConfig
  googlePlayConsole: GooglePlayConsoleConfig
}

export interface AppStoreConfig {
  enabled: boolean
  autoSubmit: boolean
  releaseType: 'manual' | 'automatic'
  skipWaitingForReview: boolean
  metadataPath?: string
  screenshotsPath?: string
}

export interface PlayStoreConfig {
  enabled: boolean
  track: 'internal' | 'alpha' | 'beta' | 'production'
  rolloutPercentage?: number
  autoPromote: boolean
  releaseNotes?: Record<string, string>
}

export interface TestFlightConfig {
  enabled: boolean
  groups: string[]
  betaReviewInfo?: BetaReviewInfo
  autoNotify: boolean
}

export interface GooglePlayConsoleConfig {
  enabled: boolean
  track: 'internal' | 'alpha' | 'beta' | 'production'
  packageName: string
  serviceAccountPath: string
}

export interface BetaReviewInfo {
  contact: ContactInfo
  demoAccountRequired: boolean
  demoAccountName?: string
  demoAccountPassword?: string
  notes?: string
}

export interface ContactInfo {
  firstName: string
  lastName: string
  phone: string
  email: string
}

export interface NotificationConfig {
  slack: SlackNotificationConfig
  email: EmailNotificationConfig
  webhook: WebhookNotificationConfig
}

export interface SlackNotificationConfig {
  enabled: boolean
  webhookUrl: string
  channel: string
  username: string
  onSuccess: boolean
  onFailure: boolean
}

export interface EmailNotificationConfig {
  enabled: boolean
  recipients: string[]
  onSuccess: boolean
  onFailure: boolean
  includeAttachments: boolean
}

export interface WebhookNotificationConfig {
  enabled: boolean
  url: string
  headers: Record<string, string>
  onSuccess: boolean
  onFailure: boolean
}

export interface BuildArtifact {
  id: string
  name: string
  type: ArtifactType
  platform: Platform
  size: number
  downloadUrl: string
  checksum: string
  createdAt: string
  expiresAt?: string
}

export type ArtifactType = 
  | 'ipa'
  | 'apk'
  | 'aab'
  | 'dsym'
  | 'mapping'
  | 'source_map'
  | 'metadata'

export interface BuildLog {
  id: string
  timestamp: string
  level: 'debug' | 'info' | 'warn' | 'error'
  stage: BuildStage
  message: string
  details?: string
  duration?: number
}

export type BuildStage = 
  | 'setup'
  | 'dependencies'
  | 'compilation'
  | 'bundling'
  | 'optimization'
  | 'signing'
  | 'packaging'
  | 'testing'
  | 'upload'
  | 'cleanup'

export interface DeploymentHistory {
  deployments: Deployment[]
  totalCount: number
  successRate: number
  averageDuration: number
  lastSuccessfulDeployment?: Deployment
  lastFailedDeployment?: Deployment
}

export interface DeploymentMetrics {
  totalDeployments: number
  successfulDeployments: number
  failedDeployments: number
  averageBuildTime: number
  deploymentFrequency: number
  rollbackRate: number
  uptimePercentage: number
}

export interface AppStoreMetadata {
  name: string
  subtitle?: string
  description: string
  keywords: string[]
  supportUrl: string
  marketingUrl?: string
  privacyPolicyUrl?: string
  category: AppCategory
  secondaryCategory?: AppCategory
  contentRating: ContentRating
  pricing: PricingInfo
  availability: AvailabilityInfo
  localizations: Localization[]
}

export interface AppCategory {
  primary: string
  secondary?: string
}

export interface ContentRating {
  rating: string
  descriptors: string[]
  advisories: string[]
}

export interface PricingInfo {
  type: 'free' | 'paid' | 'freemium'
  price?: number
  currency?: string
  inAppPurchases: boolean
  subscriptions: boolean
}

export interface AvailabilityInfo {
  territories: string[]
  releaseDate?: string
  preOrder?: boolean
  earliestReleaseDate?: string
}

export interface Localization {
  locale: string
  name: string
  subtitle?: string
  description: string
  keywords: string[]
  releaseNotes?: string
  screenshots: Screenshot[]
}

export interface Screenshot {
  url: string
  deviceType: string
  displayType: 'app_screenshot' | 'app_preview'
  order: number
}

export interface AppIcon {
  id: string
  name: string
  sizes: IconSize[]
  source: string
  backgroundColor?: string
  foregroundImage?: string
  generated: boolean
  createdAt: string
}

export interface IconSize {
  size: string
  scale: string
  idiom: string
  filename: string
  url: string
}

export interface SplashScreen {
  id: string
  name: string
  backgroundColor: string
  logoUrl?: string
  darkModeLogoUrl?: string
  showLoadingIndicator: boolean
  duration: number
  platforms: Platform[]
  orientations: Orientation[]
}

export type Orientation = 'portrait' | 'landscape' | 'portrait-upside-down' | 'landscape-left' | 'landscape-right'

export interface CodeSigning {
  ios: IOSCodeSigning
  android: AndroidCodeSigning
}

export interface IOSCodeSigning {
  certificates: Certificate[]
  provisioningProfiles: ProvisioningProfile[]
  automaticSigning: boolean
  teamId: string
}

export interface Certificate {
  id: string
  name: string
  type: 'development' | 'distribution'
  serialNumber: string
  expirationDate: string
  isValid: boolean
  teamId: string
}

export interface ProvisioningProfile {
  id: string
  name: string
  uuid: string
  type: 'development' | 'ad_hoc' | 'app_store' | 'enterprise'
  bundleId: string
  expirationDate: string
  isValid: boolean
  devices?: string[]
}

export interface AndroidCodeSigning {
  keystores: Keystore[]
  uploadKey?: UploadKey
}

export interface Keystore {
  id: string
  name: string
  alias: string
  validity: number
  algorithm: string
  keySize: number
  createdAt: string
  fingerprint: string
}

export interface UploadKey {
  keystore: string
  alias: string
  validity: number
  createdAt: string
}
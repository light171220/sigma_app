export interface DeploymentResult {
  githubRepo: string;
  amplifyApp: string;
  adminCredentials: AdminCredentials;
  deployment: DeploymentInfo;
  userEmail?: string;
  appName?: string;
}

export interface GitHubRepo {
  name: string;
  fullName: string;
  url: string;
  cloneUrl: string;
  sshUrl: string;
  branchName?: string;
  lastCommit?: string;
}

export interface AmplifyApp {
  appId: string;
  url: string;
  region?: string;
  domainName?: string;
  environment?: string;
}

export interface AdminCredentials {
  username: string;
  password: string;
  url: string;
  expiresAt?: Date;
  resetRequired?: boolean;
}

export interface DeploymentStatus {
  id: string;
  status: 'pending' | 'building' | 'success' | 'failed' | 'cancelled';
  platform: string;
  startedAt: Date;
  completedAt?: Date;
  errorMessage?: string;
  artifacts?: DeploymentArtifacts;
  progress?: number;
  logs?: string[];
}

export interface DeploymentArtifacts {
  githubRepo?: string;
  amplifyApp?: string;
  adminCredentials?: AdminCredentials;
  buildUrls?: {
    ios?: string;
    android?: string;
    web?: string;
  };
  downloadLinks?: {
    apk?: string;
    ipa?: string;
    sourceCode?: string;
  };
  certificates?: {
    ios?: string;
    android?: string;
  };
}

export interface StoreSubmissionResult {
  store: 'google-play' | 'app-store';
  status: 'submitted' | 'processing' | 'approved' | 'rejected' | 'in-review' | 'pending-release';
  trackingId: string;
  submittedAt: Date;
  reviewNotes?: string;
  estimatedReviewTime?: number;
  rejectionReason?: string;
  appVersion?: string;
  buildNumber?: string;
}

export interface BuildConfiguration {
  platform: 'ios' | 'android' | 'web' | 'all';
  buildMode: 'debug' | 'release' | 'profile';
  environment: 'staging' | 'production' | 'development';
  enableAnalytics: boolean;
  enableCrashReporting?: boolean;
  enablePushNotifications?: boolean;
  customConfig?: {
    [key: string]: any;
  };
  targetSdkVersion?: number;
  minSdkVersion?: number;
  permissions?: string[];
  features?: string[];
}

export interface DeploymentInfo {
  id: string;
  appId: string;
  userId: string;
  status: DeploymentStatus['status'];
  platform: string;
  configuration: BuildConfiguration;
  startedAt: Date;
  completedAt?: Date;
  duration?: number;
  size?: number;
  version?: string;
}

export interface AppStoreConfig {
  appName: string;
  bundleId: string;
  teamId: string;
  appStoreConnectKeyId: string;
  appStoreConnectIssuerId: string;
  appStoreConnectPrivateKey: string;
  certificateId?: string;
  provisioningProfileId?: string;
}

export interface GooglePlayConfig {
  applicationId: string;
  serviceAccountKeyFile: string;
  track: 'alpha' | 'beta' | 'production' | 'internal';
  releaseStatus: 'draft' | 'inProgress' | 'halted' | 'completed';
  userFraction?: number;
  keystoreFile?: string;
  keystorePassword?: string;
  keyAlias?: string;
  keyPassword?: string;
}

export interface DeploymentMetrics {
  totalDeployments: number;
  successfulDeployments: number;
  failedDeployments: number;
  averageBuildTime: number;
  averageFileSize: number;
  platformBreakdown: {
    ios: number;
    android: number;
    web: number;
  };
  environmentBreakdown: {
    staging: number;
    production: number;
  };
}

export interface DeploymentWebhook {
  url: string;
  events: DeploymentWebhookEvent[];
  secret?: string;
  enabled: boolean;
  retryCount?: number;
  timeout?: number;
}

export interface DeploymentWebhookEvent {
  event: 'deployment.started' | 'deployment.completed' | 'deployment.failed' | 'store.submitted' | 'store.approved';
  timestamp: Date;
  data: any;
}

export interface DeploymentLogs {
  id: string;
  deploymentId: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  timestamp: Date;
  source: 'github' | 'amplify' | 'store' | 'system';
  details?: any;
}

export interface DeploymentQuota {
  userId: string;
  plan: 'free' | 'pro' | 'enterprise';
  deploymentsUsed: number;
  deploymentsLimit: number;
  storageUsed: number;
  storageLimit: number;
  bandwidthUsed: number;
  bandwidthLimit: number;
  resetDate: Date;
}

export interface DeploymentNotification {
  type: 'email' | 'webhook' | 'push';
  recipient: string;
  event: DeploymentWebhookEvent['event'];
  enabled: boolean;
  template?: string;
}

export interface DeploymentEnvironment {
  name: string;
  variables: {
    [key: string]: string;
  };
  secrets: {
    [key: string]: string;
  };
  domain?: string;
  ssl?: boolean;
  basicAuth?: {
    username: string;
    password: string;
  };
}

export interface BuildOptimization {
  enableTreeShaking: boolean;
  enableMinification: boolean;
  enableObfuscation: boolean;
  splitChunks: boolean;
  compressionLevel: number;
  targetSize?: number;
  excludeDevDependencies: boolean;
}

export interface DeploymentRollback {
  id: string;
  deploymentId: string;
  previousDeploymentId: string;
  reason: string;
  performedBy: string;
  performedAt: Date;
  status: 'pending' | 'completed' | 'failed';
}

export interface StoreMetadata {
  appName: string;
  description: string;
  shortDescription?: string;
  keywords: string[];
  category: string;
  contentRating: string;
  privacyPolicyUrl?: string;
  supportUrl?: string;
  marketingUrl?: string;
  screenshots: {
    [key: string]: string[];
  };
  appIcon: string;
  featureGraphic?: string;
  promoGraphic?: string;
}

export interface DeploymentSchedule {
  id: string;
  appId: string;
  schedule: string;
  enabled: boolean;
  configuration: BuildConfiguration;
  lastRun?: Date;
  nextRun?: Date;
  timezone: string;
}

export interface DeploymentApproval {
  id: string;
  deploymentId: string;
  approvedBy: string;
  approvedAt: Date;
  comments?: string;
  required: boolean;
  status: 'pending' | 'approved' | 'rejected';
}
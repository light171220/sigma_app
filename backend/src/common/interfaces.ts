export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
  meta?: {
    pagination?: PaginationMeta;
    timestamp?: string;
    version?: string;
  };
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  search?: string;
  filters?: Record<string, any>;
}

export interface UserContext {
  id: string;
  email: string;
  role: string;
  subscriptionPlan: string;
  subscriptionStatus: string;
  permissions: string[];
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
}

export interface SubscriptionLimits {
  maxApps: number;
  maxDeployments: number;
  maxStorage: number;
  features: string[];
}

export interface SystemHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  services: ServiceHealth[];
  timestamp: Date;
  version: string;
}

export interface ServiceHealth {
  name: string;
  status: 'up' | 'down' | 'degraded';
  responseTime?: number;
  lastCheck: Date;
  error?: string;
}

export interface NotificationPayload {
  type: 'email' | 'push' | 'webhook';
  recipient: string;
  subject?: string;
  message: string;
  data?: Record<string, any>;
  priority: 'low' | 'medium' | 'high';
}

export interface AuditLogEntry {
  userId: string;
  action: string;
  resource: string;
  resourceId?: string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
}

export interface FileUpload {
  originalName: string;
  fileName: string;
  mimeType: string;
  size: number;
  url: string;
  uploadedAt: Date;
  uploadedBy: string;
}

export interface WebhookEvent {
  id: string;
  event: string;
  data: Record<string, any>;
  timestamp: Date;
  signature?: string;
}

export interface RateLimitConfig {
  windowMs: number;
  max: number;
  message?: string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

export interface FeatureFlag {
  name: string;
  enabled: boolean;
  description?: string;
  conditions?: Record<string, any>;
  rolloutPercentage?: number;
}

export interface MetricsData {
  name: string;
  value: number;
  unit?: string;
  timestamp: Date;
  tags?: Record<string, string>;
}

export interface BackupInfo {
  id: string;
  type: 'full' | 'incremental';
  size: number;
  createdAt: Date;
  status: 'completed' | 'failed' | 'in_progress';
  location: string;
}

export interface AppAnalytics {
  appId: string;
  totalUsers: number;
  activeUsers: number;
  sessions: number;
  crashCount: number;
  avgSessionDuration: number;
  topScreens: Array<{
    name: string;
    views: number;
  }>;
  deviceInfo: Array<{
    platform: string;
    version: string;
    count: number;
  }>;
  periodStart: Date;
  periodEnd: Date;
}
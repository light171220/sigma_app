export const APP_CONSTANTS = {
  JWT_SECRET: 'JWT_SECRET',
  JWT_REFRESH_SECRET: 'JWT_REFRESH_SECRET',
  JWT_EXPIRES_IN: '15m',
  JWT_REFRESH_EXPIRES_IN: '7d',
  
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_MAX_LENGTH: 50,
  
  APP_NAME_MAX_LENGTH: 100,
  APP_DESCRIPTION_MAX_LENGTH: 500,
  
  MAX_APPS_PER_USER: {
    free: 3,
    pro: 25,
    enterprise: 100,
  },
  
  MAX_SCREENS_PER_APP: 50,
  MAX_COMPONENTS_PER_SCREEN: 100,
  MAX_DATABASE_TABLES: 20,
  MAX_FIELDS_PER_TABLE: 50,
};

export const ERROR_CODES = {
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  APP_NOT_FOUND: 'APP_NOT_FOUND',
  SCREEN_NOT_FOUND: 'SCREEN_NOT_FOUND',
  COMPONENT_NOT_FOUND: 'COMPONENT_NOT_FOUND',
  DEPLOYMENT_NOT_FOUND: 'DEPLOYMENT_NOT_FOUND',
  
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  EMAIL_ALREADY_EXISTS: 'EMAIL_ALREADY_EXISTS',
  APP_NAME_ALREADY_EXISTS: 'APP_NAME_ALREADY_EXISTS',
  
  SUBSCRIPTION_REQUIRED: 'SUBSCRIPTION_REQUIRED',
  SUBSCRIPTION_LIMIT_EXCEEDED: 'SUBSCRIPTION_LIMIT_EXCEEDED',
  
  GENERATION_FAILED: 'GENERATION_FAILED',
  DEPLOYMENT_FAILED: 'DEPLOYMENT_FAILED',
  
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
};

export const SUBSCRIPTION_PLANS = {
  FREE: 'free',
  PRO: 'pro',
  ENTERPRISE: 'enterprise',
};

export const SUBSCRIPTION_FEATURES = {
  [SUBSCRIPTION_PLANS.FREE]: {
    maxApps: 3,
    maxDeployments: 10,
    customDomain: false,
    analytics: false,
    support: 'community',
    storage: '1GB',
  },
  [SUBSCRIPTION_PLANS.PRO]: {
    maxApps: 25,
    maxDeployments: 100,
    customDomain: true,
    analytics: true,
    support: 'email',
    storage: '10GB',
  },
  [SUBSCRIPTION_PLANS.ENTERPRISE]: {
    maxApps: 100,
    maxDeployments: 1000,
    customDomain: true,
    analytics: true,
    support: 'priority',
    storage: '100GB',
  },
};

export const COMPONENT_TYPES = {
  TEXT: 'text',
  BUTTON: 'button',
  INPUT: 'input',
  IMAGE: 'image',
  LIST: 'list',
  FORM: 'form',
  CONTAINER: 'container',
  NAVIGATION: 'navigation',
  CARD: 'card',
  CHART: 'chart',
};

export const DATABASE_FIELD_TYPES = {
  STRING: 'string',
  TEXT: 'text',
  INTEGER: 'integer',
  FLOAT: 'float',
  BOOLEAN: 'boolean',
  DATE: 'date',
  DATETIME: 'datetime',
  EMAIL: 'email',
  URL: 'url',
  JSON: 'json',
};

export const DEPLOYMENT_PLATFORMS = {
  ALL: 'all',
  IOS: 'ios',
  ANDROID: 'android',
  WEB: 'web',
};

export const DEPLOYMENT_STATUS = {
  PENDING: 'pending',
  BUILDING: 'building',
  SUCCESS: 'success',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
};

export const GENERATION_STATUS = {
  PENDING: 'pending',
  GENERATING: 'generating',
  COMPLETED: 'completed',
  FAILED: 'failed',
};

export const STORE_PLATFORMS = {
  GOOGLE_PLAY: 'google-play',
  APP_STORE: 'app-store',
};

export const FILE_UPLOAD_LIMITS = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'text/plain'],
};

export const CACHE_KEYS = {
  USER_PROFILE: 'user:profile:',
  APP_CONFIG: 'app:config:',
  GENERATION_STATUS: 'generation:status:',
  DEPLOYMENT_STATUS: 'deployment:status:',
  SUBSCRIPTION_FEATURES: 'subscription:features:',
};

export const CACHE_TTL = {
  SHORT: 300, // 5 minutes
  MEDIUM: 3600, // 1 hour
  LONG: 86400, // 24 hours
};

export const WEBHOOK_EVENTS = {
  APP_CREATED: 'app.created',
  APP_UPDATED: 'app.updated',
  APP_DELETED: 'app.deleted',
  DEPLOYMENT_STARTED: 'deployment.started',
  DEPLOYMENT_COMPLETED: 'deployment.completed',
  DEPLOYMENT_FAILED: 'deployment.failed',
  GENERATION_COMPLETED: 'generation.completed',
  USER_REGISTERED: 'user.registered',
  SUBSCRIPTION_CHANGED: 'subscription.changed',
};

export const EMAIL_TEMPLATES = {
  WELCOME: 'welcome',
  EMAIL_VERIFICATION: 'email-verification',
  PASSWORD_RESET: 'password-reset',
  DEPLOYMENT_SUCCESS: 'deployment-success',
  DEPLOYMENT_FAILED: 'deployment-failed',
  SUBSCRIPTION_EXPIRED: 'subscription-expired',
};
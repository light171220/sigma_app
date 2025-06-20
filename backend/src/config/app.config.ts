export default () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  appName: process.env.APP_NAME || 'Sigma Backend',
  appVersion: process.env.APP_VERSION || '1.0.0',
  
  database: {
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT, 10) || 5432,
    name: process.env.DATABASE_NAME || 'sigma_db',
    username: process.env.DATABASE_USERNAME || 'sigma_user',
    password: process.env.DATABASE_PASSWORD || 'sigma_password',
    ssl: process.env.DATABASE_SSL === 'true',
    synchronize: process.env.NODE_ENV === 'development',
    logging: process.env.NODE_ENV === 'development',
  },
  
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
    db: parseInt(process.env.REDIS_DB, 10) || 0,
  },
  
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
  
  aws: {
    region: process.env.AWS_REGION || 'us-east-1',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    s3Bucket: process.env.AWS_S3_BUCKET || 'sigma-generated-apps',
  },
  
  github: {
    token: process.env.GITHUB_TOKEN,
    org: process.env.GITHUB_ORG || 'sigma-apps',
    webhookSecret: process.env.GITHUB_WEBHOOK_SECRET,
  },
  
  googlePlay: {
    serviceAccount: process.env.GOOGLE_PLAY_SERVICE_ACCOUNT,
  },
  
  apple: {
    apiKeyId: process.env.APPLE_API_KEY_ID,
    issuerId: process.env.APPLE_ISSUER_ID,
    privateKey: process.env.APPLE_PRIVATE_KEY,
  },
  
  email: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT, 10) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: process.env.SMTP_FROM || 'noreply@sigma.com',
  },
  
  monitoring: {
    sentryDsn: process.env.SENTRY_DSN,
    logLevel: process.env.LOG_LEVEL || 'info',
  },
  
  queue: {
    redisUrl: process.env.BULL_REDIS_URL || 'redis://localhost:6379',
  },
  
  security: {
    corsOrigins: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'],
    rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 900000,
    rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100,
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS, 10) || 12,
  },
  
  features: {
    enableAnalytics: process.env.ENABLE_ANALYTICS === 'true',
    enableWebhooks: process.env.ENABLE_WEBHOOKS === 'true',
    enableBackups: process.env.ENABLE_BACKUPS === 'true',
    enableMetrics: process.env.ENABLE_METRICS === 'true',
  },
  
  limits: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE, 10) || 10485760, // 10MB
    maxAppsPerUser: {
      free: parseInt(process.env.MAX_APPS_FREE, 10) || 3,
      pro: parseInt(process.env.MAX_APPS_PRO, 10) || 25,
      enterprise: parseInt(process.env.MAX_APPS_ENTERPRISE, 10) || 100,
    },
  },
});
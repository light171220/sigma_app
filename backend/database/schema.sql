CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255),
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  avatar_url VARCHAR(500),
  subscription_plan VARCHAR(50) DEFAULT 'free',
  subscription_status VARCHAR(50) DEFAULT 'active',
  email_verified BOOLEAN DEFAULT false,
  oauth_provider VARCHAR(50),
  oauth_id VARCHAR(255),
  reset_token VARCHAR(255),
  reset_token_expiry TIMESTAMP,
  verification_token VARCHAR(255),
  last_login_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE apps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  package_name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  category VARCHAR(50),
  app_config JSONB NOT NULL DEFAULT '{}',
  screens JSONB NOT NULL DEFAULT '[]',
  database_schema JSONB NOT NULL DEFAULT '{"tables": []}',
  workflows JSONB NOT NULL DEFAULT '[]',
  theme JSONB NOT NULL DEFAULT '{}',
  amplify_app_id VARCHAR(100),
  github_repo_url VARCHAR(500),
  admin_credentials JSONB,
  status VARCHAR(50) DEFAULT 'draft',
  build_count INTEGER DEFAULT 0,
  last_deployed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE deployments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  app_id UUID REFERENCES apps(id) ON DELETE CASCADE,
  deployment_id VARCHAR(100),
  platform VARCHAR(20) DEFAULT 'all',
  status VARCHAR(50) DEFAULT 'pending',
  build_logs TEXT,
  artifacts JSONB,
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP,
  error_message TEXT
);

CREATE TABLE component_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(50) UNIQUE NOT NULL,
  category VARCHAR(50) NOT NULL,
  properties_schema JSONB NOT NULL,
  flutter_template TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE subscription_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(50) UNIQUE NOT NULL,
  price_monthly DECIMAL(10,2),
  price_yearly DECIMAL(10,2),
  features JSONB NOT NULL,
  limits JSONB NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_apps_user_id ON apps(user_id);
CREATE INDEX idx_apps_status ON apps(status);
CREATE INDEX idx_apps_package_name ON apps(package_name);
CREATE INDEX idx_deployments_app_id ON deployments(app_id);
CREATE INDEX idx_deployments_status ON deployments(status);
CREATE INDEX idx_component_types_name ON component_types(name);
CREATE INDEX idx_subscription_plans_name ON subscription_plans(name);
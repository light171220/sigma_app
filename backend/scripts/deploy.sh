#!/bin/bash

set -e

ENVIRONMENT=${1:-production}
VERSION=$(node -p "require('./package.json').version")
IMAGE_NAME="sigma-backend"
TAG="${VERSION}-${ENVIRONMENT}"

echo "🚀 Deploying Sigma Backend to ${ENVIRONMENT}..."
echo "📦 Version: ${VERSION}"

# Validate environment
if [[ ! "$ENVIRONMENT" =~ ^(staging|production)$ ]]; then
    echo "❌ Invalid environment. Use 'staging' or 'production'"
    exit 1
fi

# Check if required environment variables are set
required_vars=("AWS_ACCESS_KEY_ID" "AWS_SECRET_ACCESS_KEY" "DATABASE_URL")
for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        echo "❌ Environment variable $var is not set"
        exit 1
    fi
done

echo "✅ Environment variables validated"

# Build application
echo "🔨 Building application..."
npm run build

# Run tests
echo "🧪 Running tests..."
npm test

# Build Docker image
echo "🐳 Building Docker image..."
docker build -t "${IMAGE_NAME}:${TAG}" .
docker tag "${IMAGE_NAME}:${TAG}" "${IMAGE_NAME}:latest"

echo "✅ Docker image built: ${IMAGE_NAME}:${TAG}"

# Deploy based on environment
case $ENVIRONMENT in
    staging)
        echo "🚀 Deploying to staging..."
        deploy_staging
        ;;
    production)
        echo "🚀 Deploying to production..."
        deploy_production
        ;;
esac

echo "✅ Deployment completed successfully!"

function deploy_staging() {
    # Push to staging registry
    docker tag "${IMAGE_NAME}:${TAG}" "staging.registry.com/${IMAGE_NAME}:${TAG}"
    docker push "staging.registry.com/${IMAGE_NAME}:${TAG}"
    
    # Deploy to staging environment
    kubectl set image deployment/sigma-backend sigma-backend="staging.registry.com/${IMAGE_NAME}:${TAG}" -n staging
    kubectl rollout status deployment/sigma-backend -n staging
    
    echo "🌐 Staging URL: https://staging-api.sigma.com"
}

function deploy_production() {
    # Confirmation prompt for production
    read -p "⚠️  Are you sure you want to deploy to PRODUCTION? (yes/no): " confirm
    if [[ $confirm != "yes" ]]; then
        echo "❌ Deployment cancelled"
        exit 1
    fi
    
    # Push to production registry
    docker tag "${IMAGE_NAME}:${TAG}" "production.registry.com/${IMAGE_NAME}:${TAG}"
    docker push "production.registry.com/${IMAGE_NAME}:${TAG}"
    
    # Deploy to production environment
    kubectl set image deployment/sigma-backend sigma-backend="production.registry.com/${IMAGE_NAME}:${TAG}" -n production
    kubectl rollout status deployment/sigma-backend -n production
    
    # Run database migrations in production
    kubectl exec -it deployment/sigma-backend -n production -- npm run migrate
    
    echo "🌐 Production URL: https://api.sigma.com"
    echo "📊 Monitoring: https://monitoring.sigma.com"
}

# Health check
echo "🏥 Performing health check..."
sleep 30

case $ENVIRONMENT in
    staging)
        HEALTH_URL="https://staging-api.sigma.com/api/system/health"
        ;;
    production)
        HEALTH_URL="https://api.sigma.com/api/system/health"
        ;;
esac

if curl -f "$HEALTH_URL" > /dev/null 2>&1; then
    echo "✅ Health check passed"
else
    echo "❌ Health check failed"
    exit 1
fi

echo "🎉 Deployment successful!"
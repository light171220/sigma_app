#!/bin/bash

set -e

echo "🚀 Setting up Sigma Backend..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18 or higher."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18 or higher is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker."
    exit 1
fi

echo "✅ Docker is installed"

# Check if docker-compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ docker-compose is not installed. Please install docker-compose."
    exit 1
fi

echo "✅ docker-compose is installed"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Copy environment file
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cp .env.example .env
    echo "⚠️  Please edit .env file with your configuration before continuing."
else
    echo "✅ .env file already exists"
fi

# Create directories
echo "📁 Creating directories..."
mkdir -p uploads
mkdir -p temp
mkdir -p logs

# Set permissions
chmod +x scripts/*.sh

echo "🐳 Starting Docker services..."
docker-compose up -d postgres redis

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 10

# Run database migrations
echo "🗄️  Running database migrations..."
npm run migrate

# Seed database
echo "🌱 Seeding database..."
npm run seed

echo "✅ Setup completed successfully!"
echo ""
echo "🎉 Sigma Backend is ready!"
echo ""
echo "Next steps:"
echo "1. Edit .env file with your configuration"
echo "2. Run 'npm run start:dev' to start the development server"
echo "3. Visit http://localhost:3000/api for API documentation"
echo ""
echo "📖 Documentation: http://localhost:3000/api"
echo "🗄️  Database Admin: http://localhost:8080"
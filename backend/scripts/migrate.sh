#!/bin/bash

set -e

ENVIRONMENT=${NODE_ENV:-development}

echo "🗄️ Running database migrations for environment: $ENVIRONMENT"

# Check if PostgreSQL is accessible
echo "🔍 Checking database connection..."

if ! pg_isready -h ${DATABASE_HOST:-localhost} -p ${DATABASE_PORT:-5432} -U ${DATABASE_USERNAME:-sigma_user}; then
    echo "❌ Cannot connect to PostgreSQL database"
    echo "Please ensure PostgreSQL is running and accessible"
    exit 1
fi

echo "✅ Database connection successful"

# Run schema creation
echo "📋 Creating database schema..."
PGPASSWORD=${DATABASE_PASSWORD:-sigma_password} psql \
    -h ${DATABASE_HOST:-localhost} \
    -p ${DATABASE_PORT:-5432} \
    -U ${DATABASE_USERNAME:-sigma_user} \
    -d ${DATABASE_NAME:-sigma_db} \
    -f database/schema.sql

echo "✅ Schema created successfully"

# Run migrations
echo "🔄 Running migrations..."
PGPASSWORD=${DATABASE_PASSWORD:-sigma_password} psql \
    -h ${DATABASE_HOST:-localhost} \
    -p ${DATABASE_PORT:-5432} \
    -U ${DATABASE_USERNAME:-sigma_user} \
    -d ${DATABASE_NAME:-sigma_db} \
    -f database/migrations.sql

echo "✅ Migrations completed successfully"

# Verify tables
echo "🔍 Verifying tables..."
TABLES=$(PGPASSWORD=${DATABASE_PASSWORD:-sigma_password} psql \
    -h ${DATABASE_HOST:-localhost} \
    -p ${DATABASE_PORT:-5432} \
    -U ${DATABASE_USERNAME:-sigma_user} \
    -d ${DATABASE_NAME:-sigma_db} \
    -t -c "SELECT tablename FROM pg_tables WHERE schemaname='public';" | tr -d ' ')

echo "📋 Tables created:"
for table in $TABLES; do
    if [ ! -z "$table" ]; then
        echo "  ✅ $table"
    fi
done

# Check for any migration errors
if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 Database migrations completed successfully!"
    echo ""
    echo "📊 Database Info:"
    echo "  Host: ${DATABASE_HOST:-localhost}"
    echo "  Port: ${DATABASE_PORT:-5432}"
    echo "  Database: ${DATABASE_NAME:-sigma_db}"
    echo "  User: ${DATABASE_USERNAME:-sigma_user}"
else
    echo "❌ Migration failed"
    exit 1
fi

# Run TypeORM migrations if in development
if [ "$ENVIRONMENT" = "development" ]; then
    echo "🔄 Running TypeORM synchronization..."
    npm run build
    node -e "
        const { DataSource } = require('typeorm');
        const config = require('./dist/src/config/database.config').DatabaseConfig;
        const configInstance = new config();
        const dataSource = new DataSource(configInstance.createTypeOrmOptions());
        
        dataSource.initialize()
            .then(() => {
                console.log('✅ TypeORM connection established');
                return dataSource.synchronize();
            })
            .then(() => {
                console.log('✅ TypeORM synchronization completed');
                return dataSource.destroy();
            })
            .catch((error) => {
                console.error('❌ TypeORM error:', error);
                process.exit(1);
            });
    "
fi

echo "✅ All migrations completed!"
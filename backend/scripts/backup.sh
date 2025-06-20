#!/bin/bash

set -e

BACKUP_DIR=${BACKUP_DIR:-./backups}
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="sigma_backup_${TIMESTAMP}.sql"
ENVIRONMENT=${NODE_ENV:-development}

echo "💾 Starting database backup for environment: $ENVIRONMENT"
echo "📁 Backup directory: $BACKUP_DIR"
echo "📋 Backup file: $BACKUP_FILE"

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Check database connection
echo "🔍 Checking database connection..."
if ! pg_isready -h ${DATABASE_HOST:-localhost} -p ${DATABASE_PORT:-5432} -U ${DATABASE_USERNAME:-sigma_user}; then
    echo "❌ Cannot connect to PostgreSQL database"
    exit 1
fi

echo "✅ Database connection successful"

# Create full database backup
echo "📦 Creating database backup..."
PGPASSWORD=${DATABASE_PASSWORD:-sigma_password} pg_dump \
    -h ${DATABASE_HOST:-localhost} \
    -p ${DATABASE_PORT:-5432} \
    -U ${DATABASE_USERNAME:-sigma_user} \
    -d ${DATABASE_NAME:-sigma_db} \
    --verbose \
    --clean \
    --if-exists \
    --create \
    --format=custom \
    --file="$BACKUP_DIR/${BACKUP_FILE}.dump"

# Create SQL backup for readability
PGPASSWORD=${DATABASE_PASSWORD:-sigma_password} pg_dump \
    -h ${DATABASE_HOST:-localhost} \
    -p ${DATABASE_PORT:-5432} \
    -U ${DATABASE_USERNAME:-sigma_user} \
    -d ${DATABASE_NAME:-sigma_db} \
    --verbose \
    --clean \
    --if-exists \
    --create \
    --file="$BACKUP_DIR/${BACKUP_FILE}"

echo "✅ Database backup created"

# Get backup size
BACKUP_SIZE=$(du -h "$BACKUP_DIR/${BACKUP_FILE}" | cut -f1)
DUMP_SIZE=$(du -h "$BACKUP_DIR/${BACKUP_FILE}.dump" | cut -f1)

echo "📊 Backup info:"
echo "  SQL file: $BACKUP_SIZE"
echo "  Dump file: $DUMP_SIZE"

# Compress backups
echo "🗜️ Compressing backups..."
gzip "$BACKUP_DIR/${BACKUP_FILE}"
echo "✅ SQL backup compressed"

# Create metadata file
cat > "$BACKUP_DIR/${BACKUP_FILE%.sql}_metadata.json" << EOF
{
  "timestamp": "$TIMESTAMP",
  "environment": "$ENVIRONMENT",
  "database": {
    "host": "${DATABASE_HOST:-localhost}",
    "port": "${DATABASE_PORT:-5432}",
    "name": "${DATABASE_NAME:-sigma_db}",
    "user": "${DATABASE_USERNAME:-sigma_user}"
  },
  "files": {
    "sql": "${BACKUP_FILE}.gz",
    "dump": "${BACKUP_FILE}.dump"
  },
  "sizes": {
    "sql": "$BACKUP_SIZE",
    "dump": "$DUMP_SIZE"
  }
}
EOF

# Upload to S3 if configured
if [ ! -z "$AWS_S3_BACKUP_BUCKET" ]; then
    echo "☁️ Uploading backup to S3..."
    
    aws s3 cp "$BACKUP_DIR/${BACKUP_FILE}.gz" \
        "s3://$AWS_S3_BACKUP_BUCKET/database/${ENVIRONMENT}/${BACKUP_FILE}.gz"
    
    aws s3 cp "$BACKUP_DIR/${BACKUP_FILE}.dump" \
        "s3://$AWS_S3_BACKUP_BUCKET/database/${ENVIRONMENT}/${BACKUP_FILE}.dump"
    
    aws s3 cp "$BACKUP_DIR/${BACKUP_FILE%.sql}_metadata.json" \
        "s3://$AWS_S3_BACKUP_BUCKET/database/${ENVIRONMENT}/${BACKUP_FILE%.sql}_metadata.json"
    
    echo "✅ Backup uploaded to S3"
fi

# Clean old local backups (keep last 7 days)
echo "🧹 Cleaning old backups..."
find "$BACKUP_DIR" -name "sigma_backup_*.sql.gz" -mtime +7 -delete
find "$BACKUP_DIR" -name "sigma_backup_*.dump" -mtime +7 -delete
find "$BACKUP_DIR" -name "sigma_backup_*_metadata.json" -mtime +7 -delete

echo "✅ Old backups cleaned"

# Verify backup integrity
echo "🔍 Verifying backup integrity..."
if gzip -t "$BACKUP_DIR/${BACKUP_FILE}.gz"; then
    echo "✅ SQL backup integrity verified"
else
    echo "❌ SQL backup integrity check failed"
    exit 1
fi

# Send notification if configured
if [ ! -z "$SLACK_WEBHOOK_URL" ]; then
    curl -X POST -H 'Content-type: application/json' \
        --data "{\"text\":\"✅ Database backup completed successfully\n📁 File: ${BACKUP_FILE}\n📊 Size: ${BACKUP_SIZE}\n🕐 Time: $(date)\"}" \
        $SLACK_WEBHOOK_URL
fi

echo ""
echo "🎉 Backup completed successfully!"
echo ""
echo "📋 Backup Summary:"
echo "  Environment: $ENVIRONMENT"
echo "  Timestamp: $TIMESTAMP"
echo "  SQL file: $BACKUP_DIR/${BACKUP_FILE}.gz ($BACKUP_SIZE)"
echo "  Dump file: $BACKUP_DIR/${BACKUP_FILE}.dump ($DUMP_SIZE)"
echo "  Metadata: $BACKUP_DIR/${BACKUP_FILE%.sql}_metadata.json"
echo ""
echo "🔄 To restore from this backup:"
echo "  gunzip $BACKUP_DIR/${BACKUP_FILE}.gz"
echo "  psql -h host -U user -d database < $BACKUP_DIR/${BACKUP_FILE}"
echo "  # OR #"
echo "  pg_restore -h host -U user -d database $BACKUP_DIR/${BACKUP_FILE}.dump"
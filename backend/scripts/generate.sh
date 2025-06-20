#!/bin/bash

set -e

APP_ID=$1
OUTPUT_DIR=${2:-./generated}

if [ -z "$APP_ID" ]; then
    echo "❌ Usage: $0 <app-id> [output-directory]"
    echo "Example: $0 550e8400-e29b-41d4-a716-446655440000"
    exit 1
fi

echo "🔄 Generating code for app: $APP_ID"
echo "📁 Output directory: $OUTPUT_DIR"

# Create output directory
mkdir -p "$OUTPUT_DIR"

# Check if app exists
echo "🔍 Checking if app exists..."
RESPONSE=$(curl -s -X GET "http://localhost:3000/api/apps/$APP_ID" \
    -H "Authorization: Bearer $SIGMA_TOKEN" \
    -H "Content-Type: application/json")

if [[ $RESPONSE == *"not found"* ]]; then
    echo "❌ App not found with ID: $APP_ID"
    exit 1
fi

echo "✅ App found"

# Trigger code generation
echo "⚡ Starting code generation..."
GENERATION_RESPONSE=$(curl -s -X POST "http://localhost:3000/api/apps/$APP_ID/generate" \
    -H "Authorization: Bearer $SIGMA_TOKEN" \
    -H "Content-Type: application/json")

JOB_ID=$(echo $GENERATION_RESPONSE | jq -r '.jobId')
echo "📋 Generation job ID: $JOB_ID"

# Monitor generation progress
echo "⏳ Monitoring generation progress..."
while true; do
    STATUS_RESPONSE=$(curl -s -X GET "http://localhost:3000/api/apps/$APP_ID/generate/status" \
        -H "Authorization: Bearer $SIGMA_TOKEN")
    
    STATUS=$(echo $STATUS_RESPONSE | jq -r '.status')
    PROGRESS=$(echo $STATUS_RESPONSE | jq -r '.progress')
    
    echo "📊 Status: $STATUS, Progress: $PROGRESS%"
    
    if [ "$STATUS" = "completed" ]; then
        echo "✅ Code generation completed!"
        break
    elif [ "$STATUS" = "failed" ]; then
        echo "❌ Code generation failed!"
        LOGS_RESPONSE=$(curl -s -X GET "http://localhost:3000/api/apps/$APP_ID/generate/logs" \
            -H "Authorization: Bearer $SIGMA_TOKEN")
        echo "📋 Error logs:"
        echo $LOGS_RESPONSE | jq -r '.logs[]'
        exit 1
    fi
    
    sleep 5
done

# Download generated code
echo "⬇️ Downloading generated code..."
DOWNLOAD_RESPONSE=$(curl -s -X GET "http://localhost:3000/api/apps/$APP_ID/download" \
    -H "Authorization: Bearer $SIGMA_TOKEN")

DOWNLOAD_URL=$(echo $DOWNLOAD_RESPONSE | jq -r '.downloadUrl')

if [ "$DOWNLOAD_URL" != "null" ]; then
    echo "📦 Downloading from: $DOWNLOAD_URL"
    cd "$OUTPUT_DIR"
    curl -L "$DOWNLOAD_URL" -o "app-${APP_ID}.zip"
    unzip "app-${APP_ID}.zip"
    rm "app-${APP_ID}.zip"
    echo "📁 Code extracted to: $OUTPUT_DIR"
else
    echo "❌ Download URL not available"
    exit 1
fi

# Display summary
echo ""
echo "🎉 Code generation completed successfully!"
echo ""
echo "📁 Generated files:"
find "$OUTPUT_DIR" -type f -name "*.dart" -o -name "*.ts" -o -name "*.yaml" -o -name "*.json" | head -20

echo ""
echo "📖 Next steps:"
echo "1. Navigate to the generated Flutter app: cd $OUTPUT_DIR"
echo "2. Install dependencies: flutter pub get"
echo "3. Run the app: flutter run"
echo ""
echo "🔧 Backend files generated in: $OUTPUT_DIR/amplify/"
echo "🚀 Deploy with: amplify push"
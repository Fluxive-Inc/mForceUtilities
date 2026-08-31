#!/bin/bash

# Function to get current project ID
get_current_project() {
    gcloud config get-value project 2>/dev/null
}

# 1. Try to set the project to 'mforcemods' (lowercase correction)
TARGET_PROJECT_ID="mforcemods"
echo "Attempting to set project to '${TARGET_PROJECT_ID}'..."

if gcloud config set project $TARGET_PROJECT_ID 2>/dev/null; then
    echo "Successfully set project to '${TARGET_PROJECT_ID}'."
    PROJECT_ID=$TARGET_PROJECT_ID
else
    CURRENT=$(get_current_project)
    echo "Warning: Could not set project to 'mforcemods'. Keeping active project: '${CURRENT}'."
    PROJECT_ID=$CURRENT
fi

echo "Using Project ID: $PROJECT_ID"

# 2. Enable Text-to-Speech API
echo "Enabling Text-to-Speech API..."
gcloud services enable texttospeech.googleapis.com --project $PROJECT_ID

# 3. Create Service Account
SERVICE_ACCOUNT_NAME="audiobook-agent-sa"
# Construct email using the CONFIRMED Project ID
SERVICE_ACCOUNT_EMAIL="${SERVICE_ACCOUNT_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"

echo "Creating Service Account: ${SERVICE_ACCOUNT_NAME} in project ${PROJECT_ID}..."
gcloud iam service-accounts create $SERVICE_ACCOUNT_NAME \
    --display-name "Audiobook Agent Service Account" \
    --project $PROJECT_ID || echo "Service account likely already exists."

# 4. Generate Key
KEY_FILE="${PROJECT_ID}-key.json"
echo "Generating key file: ${KEY_FILE}..."

# Delete old key file if exists to avoid confusion
if [ -f "$KEY_FILE" ]; then
    rm "$KEY_FILE"
fi

gcloud iam service-accounts keys create $KEY_FILE \
    --iam-account=$SERVICE_ACCOUNT_EMAIL \
    --project $PROJECT_ID

echo "----------------------------------------"
echo "Setup Complete!"
echo "To use this key, run:"
echo "export GOOGLE_APPLICATION_CREDENTIALS=\"$(pwd)/${KEY_FILE}\""
echo "----------------------------------------"

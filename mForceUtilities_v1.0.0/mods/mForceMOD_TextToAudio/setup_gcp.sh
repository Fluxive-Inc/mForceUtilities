#!/bin/bash

# 1. Set the project
echo "Setting project to mForceMODs..."
gcloud config set project mForceMODs

# 2. Enable Text-to-Speech API
echo "Enabling Text-to-Speech API..."
gcloud services enable texttospeech.googleapis.com

# 3. Create Service Account (if it doesn't exist)
SERVICE_ACCOUNT_NAME="audiobook-agent-sa"
SERVICE_ACCOUNT_EMAIL="${SERVICE_ACCOUNT_NAME}@mForceMODs.iam.gserviceaccount.com"

echo "Creating Service Account: ${SERVICE_ACCOUNT_NAME}..."
gcloud iam service-accounts create $SERVICE_ACCOUNT_NAME \
    --display-name "Audiobook Agent Service Account" || echo "Service account likely already exists."

# 4. Generate Key
KEY_FILE="mForceMODs-key.json"
echo "Generating key file: ${KEY_FILE}..."
gcloud iam service-accounts keys create $KEY_FILE \
    --iam-account=$SERVICE_ACCOUNT_EMAIL

echo "----------------------------------------"
echo "Setup Complete!"
echo "To use this key, run:"
echo "export GOOGLE_APPLICATION_CREDENTIALS=\"$(pwd)/${KEY_FILE}\""
echo "----------------------------------------"

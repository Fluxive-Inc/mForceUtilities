#!/bin/bash

# Navigate to the directory where this script is located
cd "$(dirname "$0")"

echo "----------------------------------------"
echo "  fxSpy - Local System Transparency Agent"
echo "----------------------------------------"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed. Please install it to continue."
    exit 1
fi

# Install dependencies if they don't exist
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install --silent
fi

# Open the browser after a 2-second delay (runs in background)
(sleep 2 && open "http://localhost:3000") &

# Start the server
echo "Starting Server..."
npm start

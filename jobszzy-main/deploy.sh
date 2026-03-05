#!/bin/bash

# Configuration
VPS_IP="31.97.230.99"
APP_DIR="/var/www/jobszzy"
RESTART_CMD="pm2 restart jobszzy"

echo "--- 1. Pushing local changes to GitHub ---"
git add .
git commit -m "Automated update: $(date)"
git push origin main

echo "--- 2. Pulling and rebuilding on VPS ($VPS_IP) ---"
ssh root@$VPS_IP "cd $APP_DIR && \
    git pull origin main && \
    npm install && \
    npm run build && \
    cd server && \
    npm install && \
    $RESTART_CMD"

echo "--- Deployment Complete! ---"

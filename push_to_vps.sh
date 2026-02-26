#!/bin/bash

# Configuration
VPS_IP="31.97.230.99"
APP_DIR="/var/www/jobszzy"

echo "--- 1. Packaging local changes ---"
tar -czf project.tar.gz server public src index.html package.json package-lock.json vite.config.js .env.example

echo "--- 2. Uploading to VPS ---"
scp project.tar.gz root@$VPS_IP:$APP_DIR/

echo "--- 3. Extracting and Restarting on VPS ---"
ssh root@$VPS_IP "cd $APP_DIR && \
    tar -xzf project.tar.gz && \
    rm -f /etc/nginx/sites-enabled/default && \
    nginx -t && \
    systemctl restart nginx && \
    npm install && \
    npm run build && \
    cd server && \
    npm install && \
    pm2 restart jobszzy || pm2 start server.js --name jobszzy"

echo "--- Deployment Complete! ---"
rm project.tar.gz

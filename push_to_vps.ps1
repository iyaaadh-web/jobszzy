# Configuration
$VPS_IP = "31.97.230.99"
$APP_DIR = "/var/www/jobszzy"

Write-Host "--- 1. Packaging local changes ---" -ForegroundColor Cyan
# Using native Windows tar (standard in Win10/11)
tar -czf project.tar.gz server public src index.html package.json package-lock.json vite.config.js nginx.conf .env.example

Write-Host "--- 2. Uploading to VPS ---" -ForegroundColor Cyan
scp project.tar.gz root@$VPS_IP:$APP_DIR/

Write-Host "--- 3. Extracting and Restarting on VPS ---" -ForegroundColor Cyan
ssh root@$VPS_IP "cd $APP_DIR && `
    tar -xzf project.tar.gz && `
    cp nginx.conf /etc/nginx/sites-available/jobszzy && `
    ln -sf /etc/nginx/sites-available/jobszzy /etc/nginx/sites-enabled/jobszzy && `
    rm -f /etc/nginx/sites-enabled/default && `
    nginx -t && `
    systemctl reload nginx && `
    chown -R www-data:www-data /var/www/jobszzy && `
    chmod -R 755 /var/www/jobszzy && `
    npm install && `
    npm run build && `
    cd server && `
    npm install && `
    pm2 restart jobszzy || pm2 start server.js --name jobszzy"

Write-Host "--- Deployment Complete! ---" -ForegroundColor Green
Remove-Item project.tar.gz -ErrorAction SilentlyContinue

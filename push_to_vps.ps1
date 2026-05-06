# Configuration
$VPS_IP = "31.97.230.99"
$APP_DIR = "/var/www/jobszzy"

Write-Host "--- 1. Packaging local changes (EXCLUDING database) ---" -ForegroundColor Cyan
# IMPORTANT: We exclude all .sqlite files to NEVER overwrite live database
tar -czf project.tar.gz `
    --exclude='server/*.sqlite' `
    --exclude='server/*.sqlite-shm' `
    --exclude='server/*.sqlite-wal' `
    --exclude='server/*.db' `
    server public src index.html package.json package-lock.json vite.config.js nginx.conf .env .env.example

Write-Host "--- 2. Uploading to VPS ---" -ForegroundColor Cyan
scp -o ConnectTimeout=30 -o ServerAliveInterval=60 project.tar.gz "root@${VPS_IP}:${APP_DIR}/"

Write-Host "--- 3. Backing up live database, then extracting and restarting ---" -ForegroundColor Cyan
$commands = @(
    "cd $APP_DIR",
    "cp server/jobszzy.sqlite server/jobszzy.sqlite.bak-\$(date +%Y%m%d-%H%M%S) 2>/dev/null || true",
    "tar -xzf project.tar.gz",
    "cp nginx.conf /etc/nginx/sites-available/jobszzy",
    "ln -sf /etc/nginx/sites-available/jobszzy /etc/nginx/sites-enabled/jobszzy",
    "rm -f /etc/nginx/sites-enabled/default",
    "nginx -t",
    "systemctl reload nginx",
    "chown -R www-data:www-data /var/www/jobszzy",
    "chmod -R 755 /var/www/jobszzy",
    "npm install",
    "npm rebuild",
    "npm run build",
    "cd server",
    "npm install",
    "npm rebuild",
    "pm2 restart jobszzy || pm2 start server.js --name jobszzy",
    "sleep 2",
    "pm2 status jobszzy"
) -join " && "

ssh -o ConnectTimeout=30 -o ServerAliveInterval=60 root@$VPS_IP "$commands"

Write-Host "--- Deployment Complete! ---" -ForegroundColor Green
Remove-Item project.tar.gz -ErrorAction SilentlyContinue

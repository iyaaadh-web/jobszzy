# Jobszzy Unified Deployment Script
# Usage: .\deploy.ps1

$VPS_IP = "31.97.230.99"
$REMOTE_DIR = "/var/www/jobszzy"

Write-Host "`n--- 1. Packaging Project ---" -ForegroundColor Cyan
$files = "server", "public", "src", "index.html", "package.json", "package-lock.json", "vite.config.js", "nginx.conf", ".env", ".env.example"
tar -czf project.tar.gz $files

Write-Host "--- 2. Uploading to Hostinger ($VPS_IP) ---" -ForegroundColor Cyan
Write-Host "Please enter your VPS password when prompted." -ForegroundColor Yellow
scp project.tar.gz "root@$($VPS_IP):$REMOTE_DIR/"

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Upload failed. Please check your password or connection." -ForegroundColor Red
    Remove-Item project.tar.gz
    exit
}

Write-Host "--- 3. Remote Deployment (Install & Restart) ---" -ForegroundColor Cyan
$commands = @(
    "cd $REMOTE_DIR",
    "tar -xzf project.tar.gz",
    "npm install",
    "npm run build",
    "pm2 restart jobszzy || pm2 start server/server.js --name jobszzy",
    "pm2 save",
    "rm project.tar.gz",
    "echo 'Deployment Successful!'"
) -join " && "

ssh root@$VPS_IP "$commands"

Write-Host "`n--- All Done! ---" -ForegroundColor Green
Write-Host "Your site should be live at: https://jobszzy.com" -ForegroundColor Cyan
Remove-Item project.tar.gz -ErrorAction SilentlyContinue

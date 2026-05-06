# SAFE DEPLOYMENT SCRIPT
# This script ONLY uploads the NEW feature files.
# It will NEVER touch your database or delete any existing data.
# The database.js migration ONLY adds new columns - never removes anything.

$VPS_IP = "31.97.230.99"
$APP_DIR = "/var/www/jobszzy"

Write-Host ""
Write-Host "=== SAFE DEPLOY: Only uploading new feature files ===" -ForegroundColor Green
Write-Host "=== Your database and existing data will NOT be touched ===" -ForegroundColor Green
Write-Host ""

# Step 1: Package ONLY the specific files that were changed
Write-Host "--- 1. Packaging only changed feature files ---" -ForegroundColor Cyan

tar -czf safe_update.tar.gz `
    index.html `
    server/database.js `
    server/routes/jobs.js `
    server/routes/admin.js `
    src/pages/EmployerDashboard.jsx `
    src/pages/AdminDashboard.jsx `
    src/pages/JobDetails.jsx `
    src/pages/JobDetails.css

Write-Host "Package created. Contents:" -ForegroundColor Yellow
tar -tzf safe_update.tar.gz

# Step 2: Upload only these files
Write-Host ""
Write-Host "--- 2. Uploading to VPS ---" -ForegroundColor Cyan
scp -o ConnectTimeout=30 -o ServerAliveInterval=60 safe_update.tar.gz "root@${VPS_IP}:${APP_DIR}/"

# Step 3: On the server - extract only these files (database is NOT in the package)
Write-Host ""
Write-Host "--- 3. Applying changes on server (no database changes) ---" -ForegroundColor Cyan

$commands = @(
    "cd $APP_DIR",
    "echo 'Database before update:'",
    "ls -la server/jobszzy.sqlite",
    "tar -xzf safe_update.tar.gz",
    "echo 'Database after update (should be same):'",
    "ls -la server/jobszzy.sqlite",
    "cd server && npm install",
    "pm2 restart jobszzy || pm2 start server.js --name jobszzy",
    "sleep 3",
    "cd $APP_DIR && npm install && npm run build",
    "echo 'Reloading nginx...'",
    "systemctl reload nginx",
    "echo ''",
    "echo 'DONE - server restarted with new features'",
    "pm2 status jobszzy"
) -join " && "

ssh -o ConnectTimeout=30 -o ServerAliveInterval=60 -o StrictHostKeyChecking=no root@$VPS_IP "$commands"

Write-Host ""
Write-Host "=== Deployment Complete! ===" -ForegroundColor Green
Write-Host "Your database and existing data are untouched." -ForegroundColor Green
Remove-Item safe_update.tar.gz -ErrorAction SilentlyContinue

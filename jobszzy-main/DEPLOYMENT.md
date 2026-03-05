## 1. Create Target Directory on VPS

First, we need to create the folder where your website will live:

```bash
ssh root@31.97.230.99 "mkdir -p /var/www/jobszzy"
```

## 2. Upload Project Files

```bash
# From your local project folder:
scp -r server public src .env.example index.html package.json package-lock.json vite.config.js eslint.config.js vps_setup.sh root@31.97.230.99:/var/www/jobszzy/
```

## 3. Domain & SSL Setup

Before running the final setup, ensure your domain's DNS is pointed to the VPS IP (`31.97.230.99`):
- `jobszzy.com` -> `A Record` -> `31.97.230.99`
- `www.jobszzy.com` -> `CNAME` or `A Record`
- `admin.jobszzy.com` -> `A Record` -> `31.97.230.99`

### Configure the Setup Script
Open `vps_setup.sh` on your local computer and set your domains at the top:
```bash
DOMAIN="jobszzy.com"
ADMIN_DOMAIN="admin.jobszzy.com"
EMAIL="your-email@example.com"
```

## 4. Final Deploy & SSL
Re-upload and run the setup script:
```bash
scp vps_setup.sh root@31.97.230.99:/var/www/jobszzy/
ssh root@31.97.230.99 "chmod +x /var/www/jobszzy/vps_setup.sh && /var/www/jobszzy/vps_setup.sh"
```

To enable SSL (HTTPS), run this command on the server terminal after DNS has propagated:
```bash
certbot --nginx -d jobszzy.com -d www.jobszzy.com -d admin.jobszzy.com
```

## 5. Your Website is Live!
After SSL is set up, your website will be accessible at:
**https://jobszzy.com**

## 5. Maintenance

- **Restart app**: `pm2 restart jobszzy`
- **View logs**: `pm2 logs jobszzy`
- **Check status**: `pm2 list`

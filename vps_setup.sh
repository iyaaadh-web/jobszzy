# --- CONFIGURATION ---

DOMAIN="jobszzy.com"

ADMIN_DOMAIN="admin.jobszzy.com"

EMAIL="sales@fasmala.com" # Required for Let's Encrypt

# ---------------------



set -e



echo "--- Updating System ---"

apt-get update && apt-get upgrade -y



echo "--- Installing Node.js (v20) ---"

curl -fsSL https://deb.nodesource.com/setup_20.x | bash -

apt-get install -y nodejs



echo "--- Installing Nginx, Certbot, and PM2 ---"

apt-get install -y nginx certbot python3-certbot-nginx

npm install -g pm2



echo "--- Configuring Firewall ---"

ufw allow 'Nginx Full'

ufw allow OpenSSH

ufw --force enable



echo "--- Creating App Directory ---"

mkdir -p /var/www/jobszzy

chown -R root:root /var/www/jobszzy



echo "--- Configuring Nginx ---"

cat > /etc/nginx/sites-available/jobszzy <<EOF

server {

    listen 80;

    server_name $DOMAIN www.$DOMAIN $ADMIN_DOMAIN;



    location / {

        proxy_pass http://localhost:5000;

        proxy_http_version 1.1;

        proxy_set_header Upgrade \$http_upgrade;

        proxy_set_header Connection 'upgrade';

        proxy_set_header Host \$host;

        proxy_cache_bypass \$http_upgrade;

    }



    # Serve static uploads via Nginx

    location /uploads/ {

        alias /var/www/jobszzy/server/uploads/;

    }

}

EOF



ln -sf /etc/nginx/sites-available/jobszzy /etc/nginx/sites-enabled/

rm -f /etc/nginx/sites-enabled/default



echo "--- Restarting Nginx ---"

nginx -t

systemctl restart nginx



# Enable SSL (HTTPS) - Automatically

# This will only work if your DNS is already pointed to 31.97.230.99

echo "--- Setting up SSL (Let's Encrypt) ---"

certbot --nginx -d $DOMAIN -d www.$DOMAIN -d $ADMIN_DOMAIN --non-interactive --agree-tos -m $EMAIL || echo "SSL Setup failed. Please ensure DNS is pointed to $31.97.230.99 then run: certbot --nginx"



echo "--- Installing Project Dependencies & Building ---"

if [ -d "/var/www/jobszzy" ]; then

    cd /var/www/jobszzy

    if [ ! -f ".env" ] && [ -f ".env.example" ]; then

        cp .env.example .env

        sed -i "s|your_super_secret_jwt_key|$(openssl rand -base64 32)|" .env

        sed -i "s|development|production|" .env

        sed -i "s|http://localhost:5000|https://$DOMAIN|" .env

    fi

    if [ -f "package.json" ]; then

        npm install

        npm run build

    fi

    

    if [ -d "server" ]; then

        cd server

        npm install

    fi

fi



echo "--- Starting Application with PM2 ---"

cd /var/www/jobszzy

pm2 delete jobszzy || true

pm2 start server/server.js --name jobszzy

pm2 save

pm2 startup || true



echo "--- Setup Complete! ---"

echo "Your website should now be live at https://$DOMAIN"
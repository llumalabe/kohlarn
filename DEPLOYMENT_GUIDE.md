# 🚀 คู่มือการ Deploy ไปยัง Hostinger

## ข้อกำหนดเบื้องต้น
- Hostinger VPS หรือ Cloud Hosting
- Node.js 16+ 
- npm หรือ yarn
- Git (สำหรับ deploy)

---

## 📦 วิธีที่ 1: Deploy ผ่าน Git (แนะนำ)

### 1. สร้าง Git Repository
```bash
# บนเครื่อง Local
cd kohlarn
git init
git add .
git commit -m "Initial commit"
```

### 2. Push ไปยัง GitHub/GitLab
```bash
# สร้าง repo บน GitHub แล้ว push
git remote add origin https://github.com/your-username/kohlarn.git
git branch -M main
git push -u origin main
```

### 3. เข้า Hostinger VPS ผ่าน SSH
```bash
ssh root@your-server-ip
```

### 4. Clone โปรเจค
```bash
cd /var/www
git clone https://github.com/your-username/kohlarn.git
cd kohlarn
```

### 5. ติดตั้ง Dependencies
```bash
npm install --production
```

### 6. ตั้งค่า Environment Variables
```bash
nano .env
```

เพิ่มข้อมูล:
```env
PORT=3000
NODE_ENV=production
GOOGLE_SHEET_ID=your_sheet_id
GOOGLE_API_KEY=your_api_key
```

### 7. ตั้งค่า Service Account
```bash
nano service-account.json
```
วาง JSON credentials จาก Google Cloud

### 8. ติดตั้ง PM2
```bash
npm install -g pm2
```

### 9. รันด้วย PM2
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 10. ตั้งค่า Nginx (Reverse Proxy)
```bash
nano /etc/nginx/sites-available/kohlarn
```

เพิ่ม:
```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable site:
```bash
ln -s /etc/nginx/sites-available/kohlarn /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

### 11. ติดตั้ง SSL (Let's Encrypt)
```bash
apt install certbot python3-certbot-nginx
certbot --nginx -d your-domain.com -d www.your-domain.com
```

---

## 📦 วิธีที่ 2: Upload แบบ Manual (FTP)

### 1. Zip โปรเจค (ยกเว้นไฟล์ที่ไม่จำเป็น)
```bash
# ลบ node_modules ก่อน
rm -rf node_modules
```

### 2. Upload ผ่าน FTP/SFTP
- ใช้ FileZilla หรือ WinSCP
- เชื่อมต่อไปยัง Hostinger
- อัพโหลดไฟล์ทั้งหมดไปที่ `/var/www/kohlarn`

### 3. SSH เข้าเซิร์ฟเวอร์
```bash
ssh root@your-server-ip
cd /var/www/kohlarn
```

### 4. ติดตั้ง Dependencies
```bash
npm install --production
```

### 5. ทำตามขั้นตอนที่ 6-11 จากวิธีที่ 1

---

## 🔧 การตั้งค่าเพิ่มเติม

### สร้าง logs directory
```bash
mkdir logs
chmod 755 logs
```

### ตั้งค่า Firewall
```bash
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 22/tcp
ufw enable
```

### ตรวจสอบสถานะ
```bash
# PM2
pm2 status
pm2 logs

# Nginx
systemctl status nginx

# Node.js process
ps aux | grep node
```

---

## 🔄 การอัพเดทโปรเจค

### ผ่าน Git
```bash
cd /var/www/kohlarn
git pull origin main
npm install
pm2 restart kohlarn-hotel
```

### แบบ Manual
1. อัพโหลดไฟล์ใหม่
2. SSH เข้าเซิร์ฟเวอร์
```bash
cd /var/www/kohlarn
npm install
pm2 restart kohlarn-hotel
```

---

## 🛠️ Troubleshooting

### PM2 ไม่รัน
```bash
pm2 delete all
pm2 start ecosystem.config.js
pm2 save
```

### Port ถูกใช้งาน
```bash
lsof -i :3000
kill -9 <PID>
```

### Permission denied
```bash
chmod -R 755 /var/www/kohlarn
chown -R www-data:www-data /var/www/kohlarn
```

### Google Sheets API ไม่ทำงาน
- ตรวจสอบ service-account.json
- ตรวจสอบ GOOGLE_SHEET_ID ใน .env
- ตรวจสอบว่า Google Sheet ถูก share กับ service account email

---

## 📊 Monitoring

### ตรวจสอบ Logs
```bash
# PM2 logs
pm2 logs kohlarn-hotel

# Nginx logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log

# Application logs
tail -f logs/combined.log
```

### ตรวจสอบ Memory/CPU
```bash
pm2 monit
htop
```

---

## 🔒 Security Checklist

- ✅ เปลี่ยน root password
- ✅ สร้าง user ใหม่ (ไม่ใช้ root)
- ✅ ตั้งค่า SSH key authentication
- ✅ ปิด password authentication
- ✅ ติดตั้ง fail2ban
- ✅ เปิดใช้ UFW firewall
- ✅ ติดตั้ง SSL certificate
- ✅ ซ่อนไฟล์ .env และ service-account.json
- ✅ อัพเดท packages เป็นประจำ

---

## 📞 Support

หากมีปัญหา:
1. ตรวจสอบ logs ใน `logs/` directory
2. ตรวจสอบ PM2: `pm2 logs`
3. ตรวจสอบ Nginx: `nginx -t`
4. รีสตาร์ท services:
   ```bash
   pm2 restart all
   systemctl restart nginx
   ```

---

## 🎯 URL หลังจาก Deploy

- **หน้าแรก**: https://your-domain.com
- **Admin Panel**: https://your-domain.com/admin
- **Profile**: https://your-domain.com/profile

---

**หมายเหตุ**: แทนที่ `your-domain.com` ด้วยโดเมนจริงของคุณ

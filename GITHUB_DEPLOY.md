# 🚀 Deploy โปรเจคไปยัง GitHub + Platform อื่นๆ

## 📋 ตัวเลือกการ Deploy

เนื่องจากโปรเจคนี้มี **Backend (Node.js + Express)** จึงไม่สามารถใช้ GitHub Pages ได้โดยตรง  
แต่สามารถใช้ GitHub ร่วมกับ Platform เหล่านี้:

1. ✅ **Vercel** (ฟรี, แนะนำ)
2. ✅ **Railway** (ฟรี 500 ชม./เดือน)
3. ✅ **Render** (ฟรี)
4. ✅ **Heroku** (เสียเงิน)
5. ✅ **Netlify** (ฟรี, แต่ต้องปรับโค้ดเป็น Serverless Functions)

---

## 🎯 วิธีที่ 1: Deploy ด้วย Vercel (แนะนำ - ง่ายที่สุด)

### ข้อดี:
- ✅ ฟรี 100%
- ✅ Deploy อัตโนมัติจาก GitHub
- ✅ SSL ฟรี
- ✅ Custom Domain ได้
- ✅ Edge Network (เร็วมาก)

### ขั้นตอน:

#### 1. Push โปรเจคไปยัง GitHub

```powershell
# บนเครื่อง Windows
cd C:\Users\User\OneDrive\เดสก์ท็อป\kohlarn

# Initialize Git (ถ้ายังไม่ได้ทำ)
git init

# Add ไฟล์ทั้งหมด
git add .

# Commit
git commit -m "Initial commit for deployment"

# สร้าง repo บน GitHub แล้ว push
git remote add origin https://github.com/your-username/kohlarn.git
git branch -M main
git push -u origin main
```

#### 2. สร้าง `vercel.json`

```json
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    },
    {
      "src": "public/**",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/server.js"
    },
    {
      "src": "/(.*)",
      "dest": "/public/$1"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

#### 3. Deploy ไปยัง Vercel

**Option A: ผ่าน Vercel Dashboard (ง่ายสุด)**
1. ไปที่ https://vercel.com
2. Sign in ด้วย GitHub
3. คลิก **"New Project"**
4. เลือก repository `kohlarn`
5. คลิก **"Import"**
6. ตั้งค่า Environment Variables:
   - `GOOGLE_SHEET_ID`: your_sheet_id
   - `GOOGLE_API_KEY`: your_api_key
   - `SERVICE_ACCOUNT_JSON`: วาง JSON ทั้งหมด (แบบ one-line)
7. คลิก **"Deploy"**
8. รอ 1-2 นาที → เสร็จ! 🎉

**Option B: ผ่าน Vercel CLI**
```powershell
# ติดตั้ง Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel

# หรือ Deploy production
vercel --prod
```

#### 4. ตั้งค่า Environment Variables

ใน Vercel Dashboard:
- ไปที่ **Settings** → **Environment Variables**
- เพิ่ม:
  ```
  GOOGLE_SHEET_ID=1RjXXXXXXXXXXXXXXXX
  GOOGLE_API_KEY=AIzaXXXXXXXXXXXXXXXX
  ```
- สำหรับ Service Account: แปลง JSON เป็น base64 หรือใช้แบบ one-line string

#### 5. Redeploy

```powershell
git add .
git commit -m "Update code"
git push

# Vercel จะ auto-deploy ให้เอง!
```

---

## 🚂 วิธีที่ 2: Deploy ด้วย Railway

### ข้อดี:
- ✅ ฟรี 500 ชั่วโมง/เดือน
- ✅ รองรับ Database ได้
- ✅ Deploy ง่าย
- ✅ Custom Domain

### ขั้นตอน:

#### 1. Push โปรเจคไปยัง GitHub (ทำเหมือนวิธีที่ 1)

#### 2. Deploy บน Railway

1. ไปที่ https://railway.app
2. Sign in ด้วย GitHub
3. คลิก **"New Project"**
4. เลือก **"Deploy from GitHub repo"**
5. เลือก repository `kohlarn`
6. Railway จะ detect Node.js project อัตโนมัติ
7. คลิก **"Deploy Now"**

#### 3. ตั้งค่า Environment Variables

ใน Railway Dashboard:
- ไปที่ **Variables**
- เพิ่ม:
  ```
  PORT=3000
  NODE_ENV=production
  GOOGLE_SHEET_ID=your_sheet_id
  GOOGLE_API_KEY=your_api_key
  ```

#### 4. เพิ่ม Service Account

**Option A: ใช้ Environment Variable**
- แปลง `service-account.json` เป็น base64:
  ```powershell
  # Windows PowerShell
  $json = Get-Content service-account.json -Raw
  $bytes = [System.Text.Encoding]::UTF8.GetBytes($json)
  $base64 = [System.Convert]::ToBase64String($bytes)
  Write-Output $base64
  ```
- เพิ่ม ENV variable: `SERVICE_ACCOUNT_BASE64=<base64_string>`
- แก้ไข `server.js` ให้ decode base64

**Option B: ใช้ Railway Volume**
- ใน Railway Dashboard → **Volume**
- Upload `service-account.json`

#### 5. Generate Domain

- ใน Railway Dashboard → **Settings**
- คลิก **"Generate Domain"**
- ได้ URL: `https://kohlarn-production-xxxx.up.railway.app`

---

## 🎨 วิธีที่ 3: Deploy ด้วย Render

### ข้อดี:
- ✅ ฟรี (มี Auto-sleep หลัง 15 นาที)
- ✅ ใช้งานง่าย
- ✅ Custom Domain
- ✅ SSL ฟรี

### ขั้นตอน:

#### 1. Push โปรเจคไปยัง GitHub

#### 2. สร้าง `render.yaml`

```yaml
services:
  - type: web
    name: kohlarn-hotel
    env: node
    buildCommand: npm install
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 10000
      - key: GOOGLE_SHEET_ID
        sync: false
      - key: GOOGLE_API_KEY
        sync: false
```

#### 3. Deploy บน Render

1. ไปที่ https://render.com
2. Sign in ด้วย GitHub
3. คลิก **"New" → "Web Service"**
4. เลือก repository `kohlarn`
5. ตั้งค่า:
   - **Name**: kohlarn-hotel
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start` หรือ `node server.js`
6. เพิ่ม Environment Variables
7. คลิก **"Create Web Service"**

#### 4. URL ที่ได้

- https://kohlarn-hotel.onrender.com

---

## 📦 ไฟล์เสริมสำหรับ Deploy

### 1. แก้ไข `package.json`

เพิ่ม scripts:

```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "build": "echo 'No build step required'",
    "test": "echo 'No tests specified'"
  },
  "engines": {
    "node": ">=16.0.0",
    "npm": ">=8.0.0"
  }
}
```

### 2. สร้าง `.env.example`

```env
# Google Sheets Configuration
GOOGLE_SHEET_ID=your_google_sheet_id_here
GOOGLE_API_KEY=your_google_api_key_here

# Server Configuration
PORT=3000
NODE_ENV=production

# Note: service-account.json should be uploaded separately
```

### 3. อัพเดท `.gitignore`

```
# Dependencies
node_modules/

# Environment variables
.env
.env.local
.env.production

# Service Account
service-account.json

# Logs
logs/
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# OS
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/
*.sublime-*

# Vercel
.vercel

# Build
dist/
build/
```

---

## 🔧 จัดการ Service Account JSON

### วิธีที่ 1: ใช้ Environment Variable (แนะนำ)

**แปลง JSON เป็น base64:**

```powershell
# Windows PowerShell
$json = Get-Content service-account.json -Raw
$bytes = [System.Text.Encoding]::UTF8.GetBytes($json)
$base64 = [System.Convert]::ToBase64String($bytes)
Write-Output $base64 > service-account-base64.txt
```

**แก้ไขโค้ดใน `services/users.js`:**

```javascript
// Before
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

// After
let serviceAccount;
if (process.env.SERVICE_ACCOUNT_BASE64) {
  // Decode from base64 environment variable
  const base64 = process.env.SERVICE_ACCOUNT_BASE64;
  const json = Buffer.from(base64, 'base64').toString('utf8');
  serviceAccount = JSON.parse(json);
} else if (fs.existsSync(serviceAccountPath)) {
  // Read from file (local development)
  serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
}
```

### วิธีที่ 2: ใช้ Secret Management

**สำหรับ Vercel:**
- ใช้ Vercel Secrets
- `vercel secrets add service-account-json "$(cat service-account.json)"`

**สำหรับ Railway:**
- Upload ผ่าน Railway Volume

**สำหรับ Render:**
- ใช้ Secret Files feature

---

## 🔄 Auto Deploy

### GitHub Actions (CI/CD)

สร้าง `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '16'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run tests (if any)
      run: npm test --if-present
    
    - name: Deploy to Vercel
      uses: amondnet/vercel-action@v20
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
        vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

---

## 📊 เปรียบเทียบ Platforms

| Platform | ฟรี | Auto-deploy | Custom Domain | SSL | Database | ความเร็ว |
|----------|-----|-------------|---------------|-----|----------|----------|
| **Vercel** | ✅ | ✅ | ✅ | ✅ | ❌ | ⭐⭐⭐⭐⭐ |
| **Railway** | 500h/mo | ✅ | ✅ | ✅ | ✅ | ⭐⭐⭐⭐ |
| **Render** | ✅ (sleep) | ✅ | ✅ | ✅ | ✅ | ⭐⭐⭐ |
| **Netlify** | ✅ | ✅ | ✅ | ✅ | ❌ | ⭐⭐⭐⭐ |

---

## ✅ Checklist Deploy

- [ ] Push โค้ดไปยัง GitHub
- [ ] สร้างไฟล์ config (vercel.json, render.yaml, etc.)
- [ ] ตั้งค่า Environment Variables
- [ ] จัดการ Service Account JSON
- [ ] ทดสอบ API endpoints
- [ ] ตั้งค่า Custom Domain (ถ้ามี)
- [ ] ตรวจสอบ SSL certificate
- [ ] ทดสอบหน้าแรก
- [ ] ทดสอบ Admin Panel
- [ ] ทดสอบระบบ Login
- [ ] ตรวจสอบ Google Sheets connectivity

---

## 🆘 Troubleshooting

### Build Failed
```bash
# ตรวจสอบ logs
# ใน Vercel: Deployments → View Function Logs
# ใน Railway: Deployments → View Logs
```

### Environment Variables ไม่ทำงาน
- ตรวจสอบชื่อตัวแปรถูกต้อง
- Redeploy หลังเพิ่ม ENV variables
- ตรวจสอบไม่มีช่องว่างหน้า/หลังค่า

### Google Sheets API Error
- ตรวจสอบ Service Account JSON ถูกต้อง
- ตรวจสอบ Sheet ถูก share กับ service account email
- ตรวจสอบ GOOGLE_SHEET_ID

### Domain ไม่ work
- รอ DNS propagation (24-48 ชม.)
- ตรวจสอบ CNAME record ถูกต้อง

---

## 🎉 เสร็จแล้ว!

หลังจาก Deploy สำเร็จ คุณจะได้:
- ✅ URL สาธารณะที่ใช้งานได้ 24/7
- ✅ Auto-deploy เมื่อ push GitHub
- ✅ SSL certificate (HTTPS)
- ✅ ความเร็วสูง (Edge Network)
- ✅ ฟรี! 🎊

**URL ตัวอย่าง:**
- Vercel: `https://kohlarn.vercel.app`
- Railway: `https://kohlarn-production-xxxx.up.railway.app`
- Render: `https://kohlarn-hotel.onrender.com`

---

## 📞 Support

หากมีปัญหา:
1. ตรวจสอบ Deployment Logs
2. ตรวจสอบ Environment Variables
3. ทดสอบ API endpoints: `https://your-url.com/api/hotels`
4. ดู documentation ของแต่ละ platform

**Happy Deploying! 🚀**

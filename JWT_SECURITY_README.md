# 🔐 JWT Authentication System

## ภาพรวมระบบ

ระบบนี้ใช้ **JWT (JSON Web Token)** ร่วมกับ **Express Session** เพื่อความปลอดภัยสูงสุด

## 🎯 คุณสมบัติ

### 1. JWT Token
- **Token หมดอายุ**: 7 วัน
- **เก็บที่**: localStorage (Frontend) + Session (Backend)
- **ข้อมูลใน Token**: username, nickname, role

### 2. Session Management
- **httpOnly Cookie**: ป้องกัน XSS attacks
- **Secure Cookie**: ใช้ HTTPS ใน production
- **Session Timeout**: 7 วัน

### 3. Security Features
- ✅ Rate Limiting (50 login attempts ต่อ 15 นาที)
- ✅ JWT Verification ทุกครั้งที่โหลดหน้าเว็บ
- ✅ Token Expiration Check
- ✅ Automatic Logout เมื่อ token หมดอายุ

## 📡 API Endpoints

### Login
```
POST /api/auth/login
Body: { username, password }
Response: { success, token, user }
```

### Register
```
POST /api/auth/register
Body: { username, password, nickname }
Response: { success, token, user }
```

### Verify Token
```
POST /api/auth/verify
Headers: { Authorization: Bearer <token> }
Response: { success, user }
```

### Logout
```
POST /api/auth/logout
Headers: { Authorization: Bearer <token> }
Response: { success, message }
```

## 🔑 Environment Variables

ต้องตั้งค่าใน `.env`:

```env
JWT_SECRET=your-secret-key-minimum-32-characters
SESSION_SECRET=your-session-secret-minimum-32-characters
NODE_ENV=production
```

## 🚀 การใช้งาน

### Frontend (localStorage)
```javascript
// เก็บ token
localStorage.setItem('authToken', token);
localStorage.setItem('currentUser', JSON.stringify(user));

// ใช้ token
const token = localStorage.getItem('authToken');
fetch('/api/protected', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

### Backend (Middleware)
```javascript
// Protect routes
app.get('/api/protected', verifyToken, (req, res) => {
  res.json({ user: req.user });
});
```

## ⚠️ สำคัญสำหรับ Production

1. **เปลี่ยน Secret Keys**: ใช้ random string ยาวๆ อย่างน้อย 32 ตัวอักษร
2. **ใช้ HTTPS**: ตั้ง `NODE_ENV=production` เพื่อเปิด secure cookies
3. **อย่าเปิดเผย .env**: เพิ่ม `.env` ใน `.gitignore`

### สร้าง Secret Key แบบสุ่ม (Node.js):
```javascript
require('crypto').randomBytes(64).toString('hex')
```

## 🔄 Flow การทำงาน

1. **Login/Register** → Server สร้าง JWT Token
2. **Token ส่งกลับ** → Frontend เก็บใน localStorage
3. **ทุกครั้งโหลดหน้า** → ตรวจสอบ token กับ `/api/auth/verify`
4. **Token ถูกต้อง** → Login สำเร็จ
5. **Token หมดอายุ** → Auto logout + ให้ login ใหม่

## 📊 ความแตกต่างจากเดิม

| ฟีเจอร์ | เดิม (localStorage only) | ใหม่ (JWT + Session) |
|---------|-------------------------|---------------------|
| ความปลอดภัย | ⚠️ ต่ำ | ✅ สูง |
| Token Expiration | ❌ ไม่มี | ✅ 7 วัน |
| Session Validation | ❌ ไม่มี | ✅ ทุกครั้งที่โหลด |
| XSS Protection | ❌ ไม่มี | ✅ httpOnly cookies |
| HTTPS Support | ❌ ไม่จำเป็น | ✅ แนะนำใน production |
| Auto Logout | ❌ ไม่มี | ✅ เมื่อ token หมดอายุ |

## 🛡️ Security Best Practices

1. ✅ ใช้ HTTPS ใน production
2. ✅ ตั้ง SECRET keys ที่แข็งแรง
3. ✅ ตรวจสอบ token ทุกครั้ง
4. ✅ ใช้ Rate Limiting
5. ✅ Validate input ทุกครั้ง
6. ✅ ไม่เก็บข้อมูลสำคัญใน localStorage
7. ✅ Log ทุก login/logout events

## 📝 Logs

ระบบจะ log:
- 🔐 Login attempts
- 📝 Registration attempts
- ✅ Successful logins
- ❌ Failed logins
- 🚪 Logout events

## 🔧 Troubleshooting

### Token หมดอายุ
```
Error: Token หมดอายุ กรุณาเข้าสู่ระบบใหม่
Solution: ให้ผู้ใช้ login ใหม่
```

### Token ไม่ถูกต้อง
```
Error: Token ไม่ถูกต้อง
Solution: ลบ localStorage และ login ใหม่
```

### Session หมดอายุ
```
Solution: ระบบจะ auto logout และขอให้ login ใหม่
```

## 📚 เอกสารเพิ่มเติม

- [JWT.io](https://jwt.io/) - JWT Documentation
- [Express Session](https://github.com/expressjs/session) - Session Middleware
- [OWASP Security](https://owasp.org/) - Web Security Best Practices

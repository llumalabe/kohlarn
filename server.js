require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const rateLimit = require('express-rate-limit');
const multer = require('multer');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const session = require('express-session');

const googleSheetsService = require('./services/googleSheets');
const statsService = require('./services/stats');
const likesService = require('./services/likesSheet'); // Use Google Sheets for likes
const likesHistoryService = require('./services/likesHistorySheet'); // Track daily likes per IP
const usersService = require('./services/users');
const activityLogService = require('./services/activityLog');
const filtersService = require('./services/filters');
const roomTypesService = require('./services/roomTypes');
const accommodationTypesService = require('./services/accommodationTypes');
const hotelClicksService = require('./services/hotelClicksSheet'); // Use Google Sheets for clicks

const app = express();
const PORT = process.env.PORT || 3000;

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'hotel-' + uniqueSuffix + ext);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('รองรับเฉพาะไฟล์รูปภาพ (JPG, PNG, GIF, WebP)'));
    }
  }
});

// JWT Secret Key (ใน production ควรเก็บใน .env)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';
const JWT_EXPIRES_IN = '7d'; // Token หมดอายุใน 7 วัน

// Middleware
app.use(helmet({
  contentSecurityPolicy: false,
}));
app.use(cors({
  origin: true,
  credentials: true // อนุญาตให้ส่ง cookies
}));

// Session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-session-secret-change-this',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // true ใน production (HTTPS)
    httpOnly: true, // ป้องกัน XSS
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 วัน
  }
}));

app.use(express.json());
app.use(express.static('public'));

// Trust proxy - Required for Vercel and other reverse proxies
// This allows express-rate-limit to correctly identify users
app.set('trust proxy', 1);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500 // limit each IP to 500 requests per windowMs
});

// Separate rate limiter for login (more lenient)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // 50 login attempts per 15 minutes
  message: { success: false, error: 'คำขอเข้าสู่ระบบมากเกินไป กรุณารอสักครู่แล้วลองใหม่อีกครั้ง' }
});

// Middleware: Verify JWT Token
function verifyToken(req, res, next) {
  const token = req.headers['authorization']?.split(' ')[1] || req.session.token;
  
  if (!token) {
    return res.status(401).json({ success: false, message: 'ไม่พบ Token กรุณาเข้าสู่ระบบ' });
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token หมดอายุ กรุณาเข้าสู่ระบบใหม่' });
    }
    return res.status(403).json({ success: false, message: 'Token ไม่ถูกต้อง' });
  }
}

app.use('/api/', limiter);

// Track visits
app.use((req, res, next) => {
  if (req.path === '/' || req.path === '/index.html') {
    const ip = req.ip || req.connection.remoteAddress;
    statsService.recordVisit(ip);
  }
  next();
});

// API Routes

// Get all hotels
app.get('/api/hotels', async (req, res) => {
  try {
    // Prevent caching to always get fresh data
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    
    const hotels = await googleSheetsService.getHotels();
    res.json({ success: true, data: hotels });
  } catch (error) {
    console.error('Error fetching hotels:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch hotels' });
  }
});

// Get admin password from Google Sheets
app.post('/api/admin/login', loginLimiter, async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log('🔐 Admin login attempt:', { username, hasPassword: !!password });
    
    const validation = await usersService.validateUser(username, password);
    console.log('✅ Validation result:', { valid: validation.valid, isTemporary: validation.isTemporary });
    
    if (validation.valid) {
      // สร้าง JWT Token
      const token = jwt.sign(
        {
          username: req.user.username,
          nickname: req.user.nickname,
          role: validation.user.role || 'admin',
          hotelId: validation.user.hotelId || ''
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );
      
      // เก็บ token ใน session
      req.session.token = token;
      req.session.user = {
        username: req.user.username,
        nickname: req.user.nickname,
        role: validation.user.role || 'admin',
        hotelId: validation.user.hotelId || ''
      };
      
      // Log login activity with details
      const loginDetails = `เข้าสู่ระบบแอดมินจาก IP: ${req.ip || 'Unknown'}`;
      await activityLogService.logActivity(
        req.user.username,
        req.user.nickname,
        'เข้าสู่ระบบ',
        '',
        'login',
        loginDetails
      );
      
      console.log(`✅ Admin login successful: ${username}`);
      
      res.json({ 
        success: true, 
        message: validation.message,
        isTemporary: validation.isTemporary,
        token: token,
        user: validation.user
      });
    } else {
      console.log('❌ Login failed:', validation.message);
      res.status(401).json({ success: false, error: validation.message });
    }
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ success: false, error: 'Login failed' });
  }
});

// Add hotel
app.post('/api/admin/hotels', verifyToken, async (req, res) => {
  try {
    const { hotel } = req.body;
    
    await googleSheetsService.addHotel(hotel, req.user.nickname);
    
    // Log activity with details
    const addDetails = `เพิ่มโรงแรมใหม่: ${hotel.nameTh} (ID: ${hotel.id || 'Auto'})`;
    await activityLogService.logActivity(
      req.user.username,
      req.user.nickname,
      'เพิ่มโรงแรม',
      hotel.nameTh,
      'hotel',
      addDetails
    );
    
    res.json({ success: true, message: 'Hotel added successfully' });
  } catch (error) {
    console.error('Error adding hotel:', error);
    res.status(500).json({ success: false, error: 'Failed to add hotel' });
  }
});

// Update hotel
app.put('/api/admin/hotels/:id', verifyToken, async (req, res) => {
  try {
    const { hotel } = req.body;
    const { id } = req.params;
    
    // Get old hotel data before update
    const oldHotelData = await googleSheetsService.getHotelById(id);
    
    await googleSheetsService.updateHotel(id, hotel, req.user.nickname);
    
    // Generate detailed change log
    const changes = [];
    if (oldHotelData) {
      if (oldHotelData.nameTh !== hotel.nameTh) {
        changes.push(`ชื่อไทย: "${oldHotelData.nameTh}" → "${hotel.nameTh}"`);
      }
      if (oldHotelData.nameEn !== hotel.nameEn) {
        changes.push(`ชื่ออังกฤษ: "${oldHotelData.nameEn}" → "${hotel.nameEn}"`);
      }
      if (oldHotelData.priceStart !== hotel.priceStart) {
        changes.push(`ราคาต่ำสุด: ${oldHotelData.priceStart} → ${hotel.priceStart} บาท`);
      }
      if (oldHotelData.priceEnd !== hotel.priceEnd) {
        changes.push(`ราคาสูงสุด: ${oldHotelData.priceEnd} → ${hotel.priceEnd} บาท`);
      }
      if (oldHotelData.maxGuests !== hotel.maxGuests) {
        changes.push(`รองรับลูกค้า: ${oldHotelData.maxGuests} → ${hotel.maxGuests} คน`);
      }
      if (oldHotelData.phone !== hotel.phone) {
        changes.push(`เบอร์โทร: ${oldHotelData.phone || '-'} → ${hotel.phone || '-'}`);
      }
      if (oldHotelData.lineId !== hotel.lineId) {
        changes.push(`Line ID: ${oldHotelData.lineId || '-'} → ${hotel.lineId || '-'}`);
      }
      if (oldHotelData.facebookUrl !== hotel.facebookUrl) {
        changes.push(`Facebook: เปลี่ยนแปลง`);
      }
      if (oldHotelData.websiteUrl !== hotel.websiteUrl) {
        changes.push(`Website: เปลี่ยนแปลง`);
      }
      if (oldHotelData.ownerName !== hotel.ownerName) {
        changes.push(`ชื่อเจ้าของ: "${oldHotelData.ownerName}" → "${hotel.ownerName}"`);
      }
      if (oldHotelData.bankName !== hotel.bankName) {
        changes.push(`ธนาคาร: ${oldHotelData.bankName || '-'} → ${hotel.bankName || '-'}`);
      }
      if (oldHotelData.accountNumber !== hotel.accountNumber) {
        changes.push(`เลขบัญชี: ${oldHotelData.accountNumber || '-'} → ${hotel.accountNumber || '-'}`);
      }
      if (oldHotelData.accountName !== hotel.accountName) {
        changes.push(`ชื่อบัญชี: ${oldHotelData.accountName || '-'} → ${hotel.accountName || '-'}`);
      }
      // Check all image URLs
      if (oldHotelData.imageUrl !== hotel.imageUrl) {
        changes.push(`รูปภาพหลัก: เปลี่ยนแปลง`);
      }
      if (oldHotelData.imageUrl2 !== hotel.imageUrl2) {
        changes.push(`รูปภาพที่ 2: ${hotel.imageUrl2 ? 'เปลี่ยนแปลง' : 'ลบ'}`);
      }
      if (oldHotelData.imageUrl3 !== hotel.imageUrl3) {
        changes.push(`รูปภาพที่ 3: ${hotel.imageUrl3 ? 'เปลี่ยนแปลง' : 'ลบ'}`);
      }
      if (oldHotelData.imageUrl4 !== hotel.imageUrl4) {
        changes.push(`รูปภาพที่ 4: ${hotel.imageUrl4 ? 'เปลี่ยนแปลง' : 'ลบ'}`);
      }
      if (oldHotelData.imageUrl5 !== hotel.imageUrl5) {
        changes.push(`รูปภาพที่ 5: ${hotel.imageUrl5 ? 'เปลี่ยนแปลง' : 'ลบ'}`);
      }
      // Check filters (amenities)
      if (oldHotelData.filters !== hotel.filters) {
        const oldFilters = (oldHotelData.filters || '').split(',').map(f => f.trim()).filter(f => f);
        const newFilters = (hotel.filters || '').split(',').map(f => f.trim()).filter(f => f);
        const added = newFilters.filter(f => !oldFilters.includes(f));
        const removed = oldFilters.filter(f => !newFilters.includes(f));
        
        if (added.length > 0) {
          changes.push(`เพิ่มสิ่งอำนวยความสะดวก: ${added.join(', ')}`);
        }
        if (removed.length > 0) {
          changes.push(`ลบสิ่งอำนวยความสะดวก: ${removed.join(', ')}`);
        }
      }
      // Check room types
      if (oldHotelData.roomTypes !== hotel.roomTypes) {
        const oldRoomTypes = (oldHotelData.roomTypes || '').split(',').map(rt => rt.trim()).filter(rt => rt);
        const newRoomTypes = (hotel.roomTypes || '').split(',').map(rt => rt.trim()).filter(rt => rt);
        const added = newRoomTypes.filter(rt => !oldRoomTypes.includes(rt));
        const removed = oldRoomTypes.filter(rt => !newRoomTypes.includes(rt));
        
        if (added.length > 0) {
          changes.push(`เพิ่มประเภทห้องพัก: ${added.length} รายการ`);
        }
        if (removed.length > 0) {
          changes.push(`ลบประเภทห้องพัก: ${removed.length} รายการ`);
        }
      }
    }
    
    const updateDetails = changes.length > 0 
      ? `${changes.join(' • ')}`
      : `ตรวจสอบข้อมูล (ไม่พบการเปลี่ยนแปลง)`;
    
    await activityLogService.logActivity(
      req.user.username,
      req.user.nickname,
      'แก้ไขโรงแรม',
      hotel.nameTh,
      'hotel',
      updateDetails
    );
    
    res.json({ success: true, message: 'Hotel updated successfully' });
  } catch (error) {
    console.error('Error updating hotel:', error);
    res.status(500).json({ success: false, error: 'Failed to update hotel' });
  }
});

// Delete hotel
app.delete('/api/admin/hotels/:id', verifyToken, async (req, res) => {
  try {
    const { hotelName } = req.body;
    const { id } = req.params;
    
    await googleSheetsService.deleteHotel(id);
    
    // Log activity with details
    const deleteDetails = `ลบโรงแรม ID: ${id} (${hotelName || 'ไม่ระบุชื่อ'})`;
    await activityLogService.logActivity(
      req.user.username,
      req.user.nickname,
      'ลบโรงแรม',
      hotelName || id,
      'hotel',
      deleteDetails
    );
    
    res.json({ success: true, message: 'Hotel deleted successfully' });
  } catch (error) {
    console.error('Error deleting hotel:', error);
    res.status(500).json({ success: false, error: 'Failed to delete hotel' });
  }
});

// Record hotel card click
app.post('/api/hotels/:id/click', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await hotelClicksService.recordClick(id);
    if (result.success) {
      res.json({ success: true, clicks: result.clicks });
    } else {
      res.status(400).json({ success: false, error: result.error });
    }
  } catch (error) {
    console.error('Error recording click:', error);
    res.status(500).json({ success: false, error: 'Failed to record click' });
  }
});

// Get hotel clicks
app.get('/api/hotels/:id/clicks', async (req, res) => {
  try {
    const { id } = req.params;
    const clickData = await hotelClicksService.getHotelClicks(id);
    res.json({ success: true, clicks: clickData.count });
  } catch (error) {
    console.error('Error getting clicks:', error);
    res.status(500).json({ success: false, error: 'Failed to get clicks' });
  }
});

// Like hotel
app.post('/api/hotels/:id/like', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get IP address (handle proxy)
    const ipAddress = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for']?.split(',')[0];
    
    // Check if this IP has already liked this hotel today
    const hasLiked = await likesHistoryService.hasLikedToday(id, ipAddress);
    
    if (hasLiked) {
      return res.status(429).json({ 
        success: false, 
        error: 'คุณได้กดหัวใจโรงแรมนี้แล้ววันนี้ กรุณากลับมาใหม่พรุ่งนี้',
        message: 'Already liked today'
      });
    }
    
    // Record this like in history
    await likesHistoryService.recordLike(id, ipAddress);
    
    // Update total like count
    const result = await likesService.updateHotelLikes(id, true);
    if (result.success) {
      res.json({ success: true, likes: result.likes });
    } else {
      res.status(400).json({ success: false, error: result.error });
    }
  } catch (error) {
    console.error('Error liking hotel:', error);
    res.status(500).json({ success: false, error: 'Failed to like hotel' });
  }
});

// Get hotel likes
app.get('/api/hotels/:id/likes', async (req, res) => {
  try {
    const { id } = req.params;
    const likeData = await likesService.getHotelLikes(id);
    res.json({ success: true, likes: likeData.count });
  } catch (error) {
    console.error('Error getting likes:', error);
    res.status(500).json({ success: false, error: 'Failed to get likes' });
  }
});

// Get stats
app.get('/api/admin/stats', verifyToken, async (req, res) => {
  try {
    const { period } = req.query;
    
    // Get total hotels count
    const hotels = await googleSheetsService.getHotels();
    const totalHotels = hotels.length;
    
    // Get top liked hotels
    const topLikedHotels = await likesService.getTopLikedHotels(10);
    
    // Get click stats
    const clickStats = await hotelClicksService.getClickStats();
    const topClickedHotels = await hotelClicksService.getTopClickedHotels(10);
    
    const stats = {
      visits: statsService.getVisitStats(period),
      likes: { total: topLikedHotels.reduce((sum, h) => sum + h.likes, 0) },
      clicks: clickStats,
      totalHotels: totalHotels,
      topHotels: topLikedHotels,
      topClickedHotels: topClickedHotels,
      realtimeVisits: statsService.getRealtimeVisits()
    };
    
    res.json({ success: true, data: stats });
  } catch (error) {
    console.error('Error getting stats:', error);
    res.status(500).json({ success: false, error: 'Failed to get stats' });
  }
});

// Get activity logs
app.get('/api/admin/activity-logs', verifyToken, async (req, res) => {
  try {
    const { page = 1, perPage = 10 } = req.query;
    
    const logs = await activityLogService.getActivityLogsPaginated(
      parseInt(page), 
      parseInt(perPage)
    );
    
    res.json({ success: true, data: logs });
  } catch (error) {
    console.error('Error getting activity logs:', error);
    res.status(500).json({ success: false, error: 'Failed to get activity logs' });
  }
});

// Get filters
app.get('/api/filters', async (req, res) => {
  try {
    const filters = await filtersService.getFilters();
    res.json({ success: true, data: filters });
  } catch (error) {
    console.error('Error getting filters:', error);
    res.status(500).json({ success: false, error: 'Failed to get filters' });
  }
});

// Add filter
app.post('/api/admin/filters', verifyToken, async (req, res) => {
  try {
    const { filter } = req.body;
    
    await filtersService.addFilter(filter);
    
    // Log activity with details
    const filterDetails = `เพิ่มตัวกรอง: ${filter.nameTh} (${filter.nameEn}) - Icon: ${filter.icon}`;
    await activityLogService.logActivity(
      req.user.username,
      req.user.nickname,
      'เพิ่มตัวกรอง',
      filter.nameTh,
      'amenity',
      filterDetails
    );
    
    res.json({ success: true, message: 'Filter added successfully' });
  } catch (error) {
    console.error('Error adding filter:', error);
    res.status(500).json({ success: false, error: 'Failed to add filter' });
  }
});

// Update filter
app.put('/api/admin/filters/:id', verifyToken, async (req, res) => {
  try {
    const { filter } = req.body;
    const { id } = req.params;
    
    await filtersService.updateFilter(id, filter);
    
    // Log activity
    await activityLogService.logActivity(
      req.user.username,
      req.user.nickname,
      'แก้ไขตัวกรอง',
      filter.nameTh
    );
    
    res.json({ success: true, message: 'Filter updated successfully' });
  } catch (error) {
    console.error('Error updating filter:', error);
    res.status(500).json({ success: false, error: 'Failed to update filter' });
  }
});

// Delete filter
app.delete('/api/admin/filters/:id', verifyToken, async (req, res) => {
  try {
    const { filterName } = req.body;
    const { id } = req.params;
    
    await filtersService.deleteFilter(id);
    
    // Log activity
    await activityLogService.logActivity(
      req.user.username,
      req.user.nickname,
      'ลบตัวกรอง',
      filterName || id
    );
    
    res.json({ success: true, message: 'Filter deleted successfully' });
  } catch (error) {
    console.error('Error deleting filter:', error);
    res.status(500).json({ success: false, error: 'Failed to delete filter' });
  }
});

// ==================== Room Types API ====================

// Get room types
app.get('/api/room-types', async (req, res) => {
  try {
    const roomTypes = await roomTypesService.getRoomTypes();
    res.json({ success: true, data: roomTypes });
  } catch (error) {
    console.error('Error getting room types:', error);
    res.status(500).json({ success: false, error: 'Failed to get room types' });
  }
});

// Add room type
app.post('/api/admin/room-types', verifyToken, async (req, res) => {
  try {
    const { roomType } = req.body;
    
    await roomTypesService.addRoomType(roomType);
    
    // Log activity with details
    const roomTypeDetails = `เพิ่มประเภทห้องพัก: ${roomType.nameTh} (${roomType.nameEn}) - Icon: ${roomType.icon}`;
    await activityLogService.logActivity(
      req.user.username,
      req.user.nickname,
      'เพิ่มประเภทห้องพัก',
      roomType.nameTh,
      'roomtype',
      roomTypeDetails
    );
    
    res.json({ success: true, message: 'Room type added successfully' });
  } catch (error) {
    console.error('Error adding room type:', error);
    res.status(500).json({ success: false, error: 'Failed to add room type' });
  }
});

// Update room type
app.put('/api/admin/room-types/:id', verifyToken, async (req, res) => {
  try {
    const { roomType } = req.body;
    const { id } = req.params;
    
    await roomTypesService.updateRoomType(id, roomType);
    
    // Log activity
    await activityLogService.logActivity(
      req.user.username,
      req.user.nickname,
      'แก้ไขประเภทห้องพัก',
      roomType.nameTh
    );
    
    res.json({ success: true, message: 'Room type updated successfully' });
  } catch (error) {
    console.error('Error updating room type:', error);
    res.status(500).json({ success: false, error: 'Failed to update room type' });
  }
});

// Delete room type
app.delete('/api/admin/room-types/:id', verifyToken, async (req, res) => {
  try {
    const { roomTypeName } = req.body;
    const { id } = req.params;
    
    await roomTypesService.deleteRoomType(id);
    
    // Log activity
    await activityLogService.logActivity(
      req.user.username,
      req.user.nickname,
      'ลบประเภทห้องพัก',
      roomTypeName || id
    );
    
    res.json({ success: true, message: 'Room type deleted successfully' });
  } catch (error) {
    console.error('Error deleting room type:', error);
    res.status(500).json({ success: false, error: 'Failed to delete room type' });
  }
});

// ==================== ACCOMMODATION TYPES ENDPOINTS ====================

// Get all accommodation types (public)
app.get('/api/accommodation-types', async (req, res) => {
  try {
    const accommodationTypes = await accommodationTypesService.getAllAccommodationTypes();
    res.json({ success: true, data: accommodationTypes });
  } catch (error) {
    console.error('Error getting accommodation types:', error);
    res.status(500).json({ success: false, error: 'Failed to get accommodation types' });
  }
});

// Create accommodation type (admin only)
app.post('/api/admin/accommodation-types', verifyToken, async (req, res) => {
  try {
    const { accommodationType } = req.body;
    
    const newType = await accommodationTypesService.createAccommodationType(accommodationType);
    
    // Log activity with details
    const typeDetails = `เพิ่มประเภทที่พัก: ${accommodationType.nameTh} (${accommodationType.nameEn}) - Icon: ${accommodationType.icon}, Color: ${accommodationType.color}`;
    await activityLogService.logActivity(
      req.user.username,
      req.user.nickname,
      'เพิ่มประเภทที่พัก',
      accommodationType.nameTh,
      'accommodationType',
      typeDetails
    );
    
    res.json({ success: true, message: 'Accommodation type created successfully', data: newType });
  } catch (error) {
    console.error('Error creating accommodation type:', error);
    res.status(500).json({ success: false, error: 'Failed to create accommodation type' });
  }
});

// Update accommodation type (admin only)
app.put('/api/admin/accommodation-types/:id', verifyToken, async (req, res) => {
  try {
    const { accommodationType } = req.body;
    const { id } = req.params;
    
    const updatedType = await accommodationTypesService.updateAccommodationType(id, accommodationType);
    
    // Log activity with details
    const typeDetails = `แก้ไขประเภทที่พัก: ${accommodationType.nameTh} (${accommodationType.nameEn}) - Icon: ${accommodationType.icon}, Color: ${accommodationType.color}`;
    await activityLogService.logActivity(
      req.user.username,
      req.user.nickname,
      'แก้ไขประเภทที่พัก',
      accommodationType.nameTh,
      'accommodationType',
      typeDetails
    );
    
    res.json({ success: true, message: 'Accommodation type updated successfully', data: updatedType });
  } catch (error) {
    console.error('Error updating accommodation type:', error);
    res.status(500).json({ success: false, error: 'Failed to update accommodation type' });
  }
});

// Delete accommodation type (admin only)
app.delete('/api/admin/accommodation-types/:id', verifyToken, async (req, res) => {
  try {
    const { accommodationTypeName } = req.body;
    const { id } = req.params;
    
    const deletedType = await accommodationTypesService.deleteAccommodationType(id);
    
    // Log activity
    await activityLogService.logActivity(
      req.user.username,
      req.user.nickname,
      'ลบประเภทที่พัก',
      accommodationTypeName || deletedType.nameTh || id,
      'accommodationType'
    );
    
    res.json({ success: true, message: 'Accommodation type deleted successfully' });
  } catch (error) {
    console.error('Error deleting accommodation type:', error);
    res.status(500).json({ success: false, error: 'Failed to delete accommodation type' });
  }
});

// Upload image endpoint
app.post('/api/upload', (req, res) => {
  upload.single('image')(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      console.error('Multer error:', err);
      return res.status(400).json({ 
        success: false, 
        error: `ข้อผิดพลาดในการอัพโหลด: ${err.message}` 
      });
    } else if (err) {
      console.error('Upload error:', err);
      return res.status(400).json({ 
        success: false, 
        error: err.message || 'เกิดข้อผิดพลาดในการอัพโหลด' 
      });
    }
    
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, error: 'ไม่พบไฟล์รูปภาพ กรุณาเลือกไฟล์' });
      }
      
      // Return the URL of uploaded image
      const imageUrl = `/uploads/${req.file.filename}`;
      console.log('Upload successful:', imageUrl);
      res.json({ success: true, imageUrl: imageUrl });
    } catch (error) {
      console.error('Error processing upload:', error);
      res.status(500).json({ success: false, error: 'เกิดข้อผิดพลาดในการประมวลผลรูปภาพ' });
    }
  });
});

// Toggle hotel status endpoint
app.put('/api/admin/hotels/:id/status', verifyToken, async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;
    
    // Validate status value
    if (status !== 'active' && status !== 'inactive') {
      return res.status(400).json({ success: false, error: 'Invalid status value' });
    }
    
    // Get hotel data for logging
    const hotel = await googleSheetsService.getHotelById(id);
    if (!hotel) {
      return res.status(404).json({ success: false, error: 'Hotel not found' });
    }
    
    // Toggle status
    await googleSheetsService.toggleHotelStatus(id, status);
    
    // Log activity
    const statusText = status === 'active' ? 'เปิด' : 'ปิด';
    await activityLogService.logActivity(
      req.user.username,
      req.user.nickname,
      `${statusText}โรงแรม`,
      hotel.nameTh,
      'hotel',
      `เปลี่ยนสถานะเป็น "${statusText}" (${status})`
    );
    
    res.json({ success: true, message: 'Hotel status updated', status: status });
  } catch (error) {
    console.error('Error toggling hotel status:', error);
    res.status(500).json({ success: false, error: 'Failed to update hotel status' });
  }
});

// ==================== MEMBERS/USERS MANAGEMENT ====================

// Get all users (members)
app.get('/api/members', async (req, res) => {
  try {
    const users = await usersService.getUsers();
    res.json({ success: true, data: users });
  } catch (error) {
    console.error('Error getting users:', error);
    res.status(500).json({ success: false, error: 'Failed to get users' });
  }
});

// Add new user (admin only)
app.post('/api/admin/members', verifyToken, async (req, res) => {
  try {
    const memberData = req.body;
    
    console.log('📝 Adding new member');
    console.log('👤 Admin:', req.user.username);
    console.log('📋 New member:', { ...memberData, password: '***' });
    
    // ไม่ต้อง validate ซ้ำ - verifyToken ทำแล้ว
    
    // Add new user with member data
    const newUser = await usersService.addUser(memberData);
    
    // Log activity
    await activityLogService.logActivity(
      req.user.username,
      req.user.nickname,
      'เพิ่มสมาชิก',
      memberData.username || memberData.nickname,
      'user',
      `เพิ่มสมาชิก ${memberData.nickname || memberData.username} (${memberData.username})`
    );
    
    console.log('✅ Member added successfully:', memberData.username);
    res.json({ success: true, data: newUser });
  } catch (error) {
    console.error('❌ Error adding user:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to add user' });
  }
});

// Update user (admin only)
app.put('/api/admin/members/:id', verifyToken, async (req, res) => {
  try {
    const memberData = req.body;
    const userId = req.params.id;
    
    console.log('📝 Updating member:', userId);
    console.log('👤 Admin:', req.user.username);
    console.log('📦 Update data:', { ...memberData, password: memberData?.password ? '***' : 'not changed' });
    
    // Update user
    const updatedUser = await usersService.updateUser(userId, memberData);
    
    // Log activity
    await activityLogService.logActivity(
      req.user.username,
      req.user.nickname,
      'แก้ไขสมาชิก',
      memberData.nickname || userId,
      'user',
      `แก้ไขข้อมูลสมาชิก ${memberData.nickname || userId}`
    );
    
    console.log('✅ Member updated successfully:', userId);
    res.json({ success: true, data: updatedUser });
  } catch (error) {
    console.error('❌ Error updating user:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to update user' });
  }
});

// Delete user (admin only)
app.delete('/api/admin/members/:id', verifyToken, async (req, res) => {
  try {
    const userId = req.params.id;
    
    console.log('🗑️ Deleting member:', userId);
    console.log('👤 Admin:', req.user.username);
    
    // Delete user
    const deletedUser = await usersService.deleteUser(userId);
    
    // Log activity
    await activityLogService.logActivity(
      req.user.username,
      req.user.nickname,
      'ลบสมาชิก',
      deletedUser.username || userId,
      'user',
      `ลบสมาชิก ${deletedUser.username || userId}`
    );
    
    res.json({ success: true, data: deletedUser });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to delete user' });
  }
});

// Serve HTML pages
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Profile page (admin_v2.html without .html extension)
app.get('/profile', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin_v2.html'));
});

// ===== Auth API for Public Users =====

// Public login endpoint
app.post('/api/auth/login', loginLimiter, async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.json({ success: false, message: 'กรุณากรอกชื่อผู้ใช้และรหัสผ่าน' });
    }
    
    console.log(`🔐 Login attempt: ${username}`);
    
    // Validate user - returns object with valid, user, message
    const result = await usersService.validateUser(username, password);
    
    if (result.valid) {
      // สร้าง JWT Token
      const token = jwt.sign(
        {
          username: result.user.username,
          nickname: result.user.nickname,
          role: result.user.role || 'user',
          hotelId: result.user.hotelId || ''
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );
      
      // เก็บ token ใน session
      req.session.token = token;
      req.session.user = {
        username: result.user.username,
        nickname: result.user.nickname,
        role: result.user.role || 'user',
        hotelId: result.user.hotelId || ''
      };
      
      console.log(`✅ Login successful: ${username}`);
      
      // Return user data และ token
      res.json({
        success: true,
        token: token,
        user: {
          username: result.user.username,
          nickname: result.user.nickname,
          email: result.user.email || '',
          role: result.user.role || 'user',
          hotelId: result.user.hotelId || '',
          phone: result.user.phone || ''
        },
        message: result.message
      });
    } else {
      res.json({ success: false, message: result.message || 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ' });
  }
});

// Public registration endpoint
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, password, nickname } = req.body;
    
    // Validation
    if (!username || !password || !nickname) {
      return res.json({ success: false, message: 'กรุณากรอกข้อมูลให้ครบถ้วน' });
    }
    
    // Check username length
    if (username.length < 4) {
      return res.json({ success: false, message: 'ชื่อผู้ใช้ต้องมีอย่างน้อย 4 ตัวอักษร' });
    }
    
    // Check password length
    if (password.length < 6) {
      return res.json({ success: false, message: 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร' });
    }
    
    console.log(`📝 Registration attempt: ${username}`);
    
    // Check if username already exists
    const users = await usersService.getUsers();
    const existingUser = users.find(u => u.username === username);
    
    if (existingUser) {
      return res.json({ success: false, message: 'ชื่อผู้ใช้นี้ถูกใช้งานแล้ว' });
    }
    
    // Create new user
    const newUser = {
      username,
      password,
      nickname,
      role: 'user', // Default role for public registration
      hotelId: '' // Empty for public users
    };
    
    await usersService.addUser(newUser);
    
    console.log(`✅ User registered successfully: ${username}`);
    
    // สร้าง JWT Token สำหรับ auto-login
    const token = jwt.sign(
      {
        username,
        nickname,
        role: 'user',
        hotelId: ''
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
    
    // เก็บ token ใน session
    req.session.token = token;
    req.session.user = { username, nickname, role: 'user', hotelId: '' };
    
    res.json({
      success: true,
      message: 'สมัครสมาชิกสำเร็จ',
      token: token,
      user: {
        username,
        nickname,
        role: 'user',
        hotelId: ''
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการสมัครสมาชิก' });
  }
});

// Verify token endpoint
app.post('/api/auth/verify', verifyToken, (req, res) => {
  res.json({
    success: true,
    user: req.user
  });
});

// Logout endpoint
app.post('/api/auth/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการออกจากระบบ' });
    }
    res.json({ success: true, message: 'ออกจากระบบเรียบร้อย' });
  });
});

// ===== Web Settings API =====

// Get web settings
app.get('/api/websettings', async (req, res) => {
  try {
    const settings = await googleSheetsService.getWebSettings();
    res.json(settings);
  } catch (error) {
    console.error('Error fetching web settings:', error);
    res.status(500).json({ 
      error: 'Failed to fetch web settings',
      details: error.message 
    });
  }
});

// Update web settings
app.post('/api/websettings', verifyToken, async (req, res) => {
  try {
    const settings = req.body;

    if (!settings || Object.keys(settings).length === 0) {
      return res.status(400).json({ success: false, error: 'No settings provided' });
    }

    const result = await googleSheetsService.updateWebSettings(settings, req.user.nickname);
    
    res.json({ 
      success: true,
      message: 'Settings updated successfully',
      updated: result.updated
    });
  } catch (error) {
    console.error('Error updating web settings:', error);
    res.status(500).json({ 
      error: 'Failed to update web settings',
      details: error.message 
    });
  }
});

// Error handlers
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  const os = require('os');
  const networkInterfaces = os.networkInterfaces();
  let localIP = 'localhost';
  
  // Find local IP address
  Object.keys(networkInterfaces).forEach((interfaceName) => {
    networkInterfaces[interfaceName].forEach((interface) => {
      if (interface.family === 'IPv4' && !interface.internal) {
        localIP = interface.address;
      }
    });
  });
  
  console.log('\n🚀 Server is running!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📱 Local:   http://localhost:${PORT}`);
  console.log(`🌐 Network: http://${localIP}:${PORT}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
});

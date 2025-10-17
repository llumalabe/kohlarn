// Global variables
let currentUser = {
    username: '',
    password: '',
    nickname: '',
    role: 'user', // 'admin', 'hotel_owner', 'user'
    hotelId: '' // เฉพาะ hotel_owner - เลข ID โรงแรมที่ดูแล
};
let currentPeriod = 'day';
let currentSort = 'likes'; // 'likes' or 'clicks'
let currentOrder = 'most'; // 'most' or 'least'
let currentStatsPeriod = 'day'; // 'day', 'week', 'month', 'year', 'all' for stats page
let currentStatsSearch = ''; // Search term for filtering stats
let currentActivityType = 'all'; // 'all', 'hotel', 'amenity', 'roomtype'
let currentActivityAction = 'all'; // 'all', 'latest', 'add', 'edit', 'delete'
let currentActivitySearch = ''; // Search term for filtering activities
let currentActivityPage = 1; // Current page for activity log pagination
let currentStatusFilter = 'all'; // 'all', 'active', 'inactive'
let statsInterval;
let isTemporaryPassword = false;

// Helper function: Authenticated Fetch
// ส่ง JWT Token กับทุก request ที่ต้องการ authentication
function getAuthHeaders() {
    const token = localStorage.getItem('authToken');
    const headers = {
        'Content-Type': 'application/json'
    };
    
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
}

async function authenticatedFetch(url, options = {}) {
    // รวม headers เดิมกับ auth headers
    const headers = {
        ...getAuthHeaders(),
        ...(options.headers || {})
    };
    
    const response = await fetch(url, {
        ...options,
        headers
    });
    
    // ถ้า 401 Unauthorized = token หมดอายุหรือไม่ถูกต้อง
    if (response.status === 401) {
        console.warn('⚠️ 401 Unauthorized - Token may be expired');
        // อาจจะ redirect ไปหน้า login หรือแจ้งเตือน
    }
    
    return response;
}

// Session Management - ใช้ JWT Token แทน adminSession
function saveSession(username, password, nickname, isTemporary, token, role, hotelId) {
    // เก็บข้อมูลใน format เดียวกับหน้าหลัก
    const user = {
        username,
        nickname,
        role: role || (isTemporary ? 'temp' : 'admin'),
        hotelId: hotelId || '' // เฉพาะ hotel_owner
    };
    
    if (token) {
        localStorage.setItem('authToken', token);
    }
    localStorage.setItem('currentUser', JSON.stringify(user));
    
    // ลบ adminSession เก่าถ้ามี
    localStorage.removeItem('adminSession');
    
    console.log('💾 Session saved with JWT, role:', user.role, 'hotelId:', user.hotelId);
}

function loadSession() {
    // ตรวจสอบจาก JWT Token ก่อน
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('currentUser');
    
    if (token && userData) {
        try {
            const user = JSON.parse(userData);
            console.log('✅ JWT Session loaded:', user.username, 'role:', user.role, 'hotelId:', user.hotelId);
            return {
                username: user.username,
                nickname: user.nickname,
                role: user.role || 'user',
                hotelId: user.hotelId || '',
                isTemporary: user.role === 'temp',
                token: token
            };
        } catch (error) {
            console.error('Error loading JWT session:', error);
            clearSession();
            return null;
        }
    }
    
    // ถ้าไม่มี JWT, ลองโหลด adminSession เก่า (backward compatibility)
    const sessionData = localStorage.getItem('adminSession');
    if (sessionData) {
        try {
            const session = JSON.parse(sessionData);
            // Migrate to JWT format
            const user = {
                username: session.username,
                nickname: session.nickname,
                role: session.isTemporary ? 'temp' : 'admin',
                hotelId: ''
            };
            localStorage.setItem('currentUser', JSON.stringify(user));
            localStorage.removeItem('adminSession'); // ลบเก่า
            console.log('🔄 Migrated from adminSession to JWT format');
            return session;
        } catch (error) {
            console.error('Error loading session:', error);
            clearSession();
            return null;
        }
    }
    
    return null;
}

function clearSession() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('adminSession'); // ลบเก่าด้วย
    console.log('🗑️ Session cleared');
}

// Helper function: Fetch with JWT authentication
async function fetchWithAuth(url, options = {}) {
    const token = localStorage.getItem('authToken');
    
    if (!token) {
        console.error('❌ No auth token found');
        window.location.href = '/';
        throw new Error('No authentication token');
    }
    
    // Merge headers with Authorization
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers
    };
    
    const response = await fetch(url, {
        ...options,
        headers
    });
    
    // If unauthorized, redirect to home
    if (response.status === 401) {
        console.error('❌ Unauthorized - redirecting to home');
        clearSession();
        window.location.href = '/';
        throw new Error('Unauthorized');
    }
    
    return response;
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    setupLogin();
    
    // Try to auto-login from saved session
    const session = loadSession();
    if (session) {
        console.log('🔄 Auto-login from saved session');
        currentUser = {
            username: session.username,
            password: session.password,
            nickname: session.nickname,
            role: session.role || 'user',
            hotelId: session.hotelId || ''
        };
        isTemporaryPassword = session.isTemporary || false;
        
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('adminDashboard').style.display = 'flex';
        
        initDashboard();
    } else {
        // ไม่มี session → Redirect ไปหน้าหลัก
        console.log('⚠️ No session found, redirecting to home page');
        window.location.href = '/';
    }
});

// Toggle dropdown menu
function toggleDropdown(event) {
    event.preventDefault();
    const navDropdown = event.target.closest('.nav-dropdown');
    const isActive = navDropdown.classList.contains('active');
    
    // Close all dropdowns first
    document.querySelectorAll('.nav-dropdown').forEach(dropdown => {
        dropdown.classList.remove('active');
    });
    
    // Toggle current dropdown
    if (!isActive) {
        navDropdown.classList.add('active');
    }
}

// Setup login
function setupLogin() {
    const loginForm = document.getElementById('loginForm');
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        console.log('🔐 Attempting login:', { username, password: '***' });
        
        try {
            const response = await fetch('/api/admin/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });
            
            console.log('📡 Response status:', response.status);
            
            // Check if response is JSON
            const contentType = response.headers.get('content-type');
            let data;
            
            if (contentType && contentType.includes('application/json')) {
                data = await response.json();
            } else {
                // Handle non-JSON response (like rate limit HTML)
                const text = await response.text();
                console.error('Non-JSON response:', text);
                
                if (response.status === 429) {
                    showError('คำขอเข้าสู่ระบบมากเกินไป กรุณารอสักครู่แล้วลองใหม่อีกครั้ง');
                    return;
                } else {
                    showError('เกิดข้อผิดพลาดในการเข้าสู่ระบบ');
                    return;
                }
            }
            
            console.log('📦 Response data:', data);
            
            if (data.success) {
                currentUser = {
                    username: username,
                    password: password,
                    nickname: data.user.nickname,
                    role: data.user.role || 'user',
                    hotelId: data.user.hotelId || ''
                };
                isTemporaryPassword = data.isTemporary || false;
                
                // Save session to localStorage with JWT token
                const token = data.token || null; // รับ token จาก response ถ้ามี
                saveSession(username, password, data.user.nickname, isTemporaryPassword, token, data.user.role, data.user.hotelId);
                
                console.log('✅ Login successful - Role:', data.user.role, 'HotelId:', data.user.hotelId);
                
                document.getElementById('loginScreen').style.display = 'none';
                document.getElementById('adminDashboard').style.display = 'flex';
                
                // เรียก applyRolePermissions ก่อน initDashboard
                applyRolePermissions();
                
                initDashboard();
            } else {
                showError(data.error || 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
            }
        } catch (error) {
            console.error('Login error:', error);
            showError('เกิดข้อผิดพลาดในการเข้าสู่ระบบ');
        }
    });
}

// Initialize dashboard
function initDashboard() {
    // Update sidebar user info
    const sidebarNickname = document.getElementById('sidebarNickname');
    const sidebarUsername = document.getElementById('sidebarUsername');
    if (sidebarNickname) sidebarNickname.textContent = currentUser.nickname;
    if (sidebarUsername) sidebarUsername.textContent = '@' + currentUser.username;
    
    // จัดการสิทธิ์การเข้าถึงตาม role
    applyRolePermissions();
    
    // Show notification if using temporary account
    if (isTemporaryPassword) {
        setTimeout(() => showTempPasswordWarning(), 500);
    }
    
    loadStats();
    loadHotels();
    loadLikesStats();
    loadActivityLog();
    
    // Start auto-refresh for recent activities
    startAutoRefresh();
    
    // Auto-refresh stats every 30 seconds
    statsInterval = setInterval(() => {
        loadStats();
        loadLikesStats();
    }, 30000);
}

// Apply role-based permissions
function applyRolePermissions() {
    const userRole = currentUser.role || 'user';
    const userHotelId = currentUser.hotelId || '';
    console.log('🔒 Applying permissions for role:', userRole, 'hotelId:', userHotelId);
    
    // เพิ่ม class ให้ body เพื่อใช้กับ CSS
    document.body.className = ''; // Clear existing classes
    if (userRole === 'hotel_owner' || userRole === 'hotel-owner') {
        document.body.classList.add('role-hotel_owner');
        document.body.classList.add('role-hotel-owner');
        console.log('✅ Added hotel-owner role class to body:', document.body.className);
        console.log('✅ Body classes:', document.body.classList);
    } else if (userRole === 'admin') {
        document.body.classList.add('role-admin');
    } else if (userRole === 'user') {
        document.body.classList.add('role-user');
        console.log('✅ Added user role class to body:', document.body.className);
        console.log('✅ Body classes:', document.body.classList);
    }
    
    console.log('📋 Final body className:', document.body.className);
    
    // ซ่อนเมนูทั้งหมดก่อน
    const navDashboard = document.getElementById('navDashboard');
    const navHotels = document.getElementById('navHotels');
    const navManagement = document.getElementById('navManagement');
    const navActivity = document.getElementById('navActivity');
    const navLikes = document.getElementById('navLikes');
    const navMembers = document.getElementById('navMembers');
    
    // Debug: ตรวจสอบว่าเจอ element หรือไม่
    console.log('📋 Menu elements check:', {
        navDashboard: navDashboard ? 'found' : 'NOT FOUND',
        navHotels: navHotels ? 'found' : 'NOT FOUND',
        navManagement: navManagement ? 'found' : 'NOT FOUND',
        navActivity: navActivity ? 'found' : 'NOT FOUND',
        navLikes: navLikes ? 'found' : 'NOT FOUND',
        navMembers: navMembers ? 'found' : 'NOT FOUND'
    });
    
    if (userRole === 'user') {
        // =========== USER ROLE ===========
        // เห็นแค่เมนู "ระบบสมาชิก" เท่านั้น
        if (navDashboard) navDashboard.style.display = 'none';
        if (navHotels) navHotels.style.display = 'none';
        if (navManagement) navManagement.style.display = 'none';
        if (navActivity) navActivity.style.display = 'none';
        if (navLikes) navLikes.style.display = 'none';
        if (navMembers) navMembers.style.display = 'block';
        
        // ซ่อน section ทั้งหมดยกเว้น members
        const sections = document.querySelectorAll('.content-section');
        sections.forEach(section => {
            if (section.id !== 'membersSection') {
                section.style.display = 'none';
            }
        });
        
        // ซ่อนปุ่มเพิ่มสมาชิก
        const addMemberBtn = document.getElementById('addMemberBtn');
        if (addMemberBtn) addMemberBtn.style.display = 'none';
        
        // ซ่อนตัวกรองบทบาท
        const roleFilterGroup = document.getElementById('memberRoleFilterGroup');
        if (roleFilterGroup) roleFilterGroup.style.display = 'none';
        
        // ซ่อนช่องค้นหา
        const searchInput = document.querySelector('#membersSection input[type="search"]');
        if (searchInput && searchInput.parentElement) {
            searchInput.parentElement.style.display = 'none';
        }
        
        // บังคับให้แสดงหน้าระบบสมาชิก
        navigateTo('members');
        
        console.log('✅ User permissions applied - Members only, view own profile');
        
    } else if (userRole === 'hotel_owner' || userRole === 'hotel-owner') {
        // =========== HOTEL OWNER ROLE ===========
        // เห็นเมนู: Dashboard, โรงแรม, ประวัติการแก้ไข, สถิติทั้งหมด, ระบบสมาชิก
        // ❌ ซ่อนเมนู "การจัดการ" (สิ่งอำนวยความสะดวก, ประเภทที่พัก, ประเภทห้องพัก)
        if (navDashboard) navDashboard.style.display = 'block';
        if (navHotels) navHotels.style.display = 'block';
        if (navManagement) navManagement.style.display = 'none'; // ⛔ ซ่อนการจัดการ
        if (navActivity) navActivity.style.display = 'block';
        if (navLikes) navLikes.style.display = 'block';
        if (navMembers) navMembers.style.display = 'block';
        
        // ซ่อนช่องค้นหาและตัวกรองในหน้าประวัติการแก้ไข
        const activitySearch = document.querySelector('#activitySection input[type="search"]');
        if (activitySearch && activitySearch.parentElement) {
            activitySearch.parentElement.style.display = 'none';
        }
        
        // ซ่อนตัวกรองในหน้าประวัติการแก้ไข
        const activityFilters = document.querySelector('#activitySection .filters-container');
        if (activityFilters) {
            activityFilters.style.display = 'none';
        }
        
        // ซ่อนปุ่มเพิ่มสมาชิกในหน้า Members
        const addMemberBtn = document.getElementById('addMemberBtn');
        if (addMemberBtn) addMemberBtn.style.display = 'none';
        
        // ซ่อนตัวกรองบทบาทในหน้า Members
        const roleFilterGroup = document.getElementById('memberRoleFilterGroup');
        if (roleFilterGroup) roleFilterGroup.style.display = 'none';
        
        // ซ่อนช่องค้นหาในหน้า Members
        const memberSearchInput = document.querySelector('#membersSection input[type="search"]');
        if (memberSearchInput && memberSearchInput.parentElement) {
            memberSearchInput.parentElement.style.display = 'none';
        }
        
        // ซ่อนปุ่มเพิ่มโรงแรมในหน้า Hotels และที่ header (หลายชั้นเพื่อให้แน่ใจ)
        const hideAddHotelButton = () => {
            const btn = document.getElementById('addHotelBtn');
            const headerBtn = document.getElementById('addHotelBtnHeader');
            
            if (btn) {
                btn.style.display = 'none';
                btn.style.visibility = 'hidden';
                btn.disabled = true;
                console.log('🔒 Hidden add hotel button (hotels page)');
            }
            
            if (headerBtn) {
                headerBtn.style.display = 'none';
                headerBtn.style.visibility = 'hidden';
                headerBtn.disabled = true;
                console.log('🔒 Hidden add hotel button (header)');
            }
            
            return (btn || headerBtn) ? true : false;
        };
        
        // ซ่อนทันที
        hideAddHotelButton();
        
        // ซ่อนหลังจาก DOM โหลด
        setTimeout(hideAddHotelButton, 50);
        setTimeout(hideAddHotelButton, 100);
        setTimeout(hideAddHotelButton, 200);
        setTimeout(hideAddHotelButton, 500);
        
        console.log('✅ Hotel owner permissions applied - Limited to hotelId:', userHotelId);
        console.log('⛔ Management menu hidden for hotel_owner');
        console.log('🔒 Members section: view own profile only, no add/delete/search/filter');
        console.log('🔒 Hotels section: no add hotel button');
        
    } else if (userRole === 'admin') {
        // =========== ADMIN ROLE ===========
        // แสดงทุกเมนู
        console.log('🔓 Admin detected - Setting all menus to visible...');
        
        if (navDashboard) {
            navDashboard.style.display = 'block';
            console.log('  ✓ Dashboard shown');
        } else {
            console.log('  ✗ Dashboard element not found!');
        }
        
        if (navHotels) {
            navHotels.style.display = 'block';
            console.log('  ✓ Hotels shown');
        } else {
            console.log('  ✗ Hotels element not found!');
        }
        
        if (navManagement) {
            navManagement.style.display = 'block';
            console.log('  ✓ Management shown');
        } else {
            console.log('  ✗ Management element not found!');
        }
        
        if (navActivity) {
            navActivity.style.display = 'block';
            console.log('  ✓ Activity shown');
        } else {
            console.log('  ✗ Activity element not found!');
        }
        
        if (navLikes) {
            navLikes.style.display = 'block';
            console.log('  ✓ Likes shown');
        } else {
            console.log('  ✗ Likes element not found!');
        }
        
        if (navMembers) {
            navMembers.style.display = 'block';
            console.log('  ✓ Members shown');
        } else {
            console.log('  ✗ Members element not found!');
        }
        
        console.log('✅ Admin permissions - Full access granted');
    }
}

// Logout function
function logout() {
    clearInterval(statsInterval);
    
    // Clear session from localStorage
    clearSession();
    
    currentUser = { username: '', password: '', nickname: '' };
    isTemporaryPassword = false;
    
    console.log('👋 Logged out successfully');
    
    // Redirect ไปหน้าหลัก
    window.location.href = '/';
}

// Toggle sidebar for mobile
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('active');
}

// Navigate to different pages
function navigateTo(page, event) {
    if (event) event.preventDefault();
    
    // ตรวจสอบสิทธิ์การเข้าถึงหน้า Management สำหรับ hotel_owner
    const userRole = currentUser.role || 'user';
    const restrictedPages = ['filters', 'accommodation-types', 'roomtypes'];
    
    if ((userRole === 'hotel_owner' || userRole === 'hotel-owner') && restrictedPages.includes(page)) {
        console.warn('⛔ Access denied: hotel_owner cannot access Management pages');
        alert('คุณไม่มีสิทธิ์เข้าถึงหน้านี้');
        return; // ป้องกันไม่ให้เข้าถึง
    }
    
    // Update active nav item (for dropdown items)
    document.querySelectorAll('.nav-item, .dropdown-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Mark the clicked item as active
    if (event?.target.closest('.dropdown-item')) {
        event.target.closest('.dropdown-item').classList.add('active');
    } else if (event?.target.closest('.nav-item')) {
        event.target.closest('.nav-item').classList.add('active');
    }
    
    // Hide all pages
    document.querySelectorAll('.page-content').forEach(p => {
        p.classList.remove('active');
    });
    
    // Show selected page
    // Convert kebab-case to camelCase for ID (e.g., 'accommodation-types' -> 'accommodationTypes')
    const pageId = page.replace(/-([a-z])/g, (match, letter) => letter.toUpperCase());
    const pageElement = document.getElementById(pageId + 'Page');
    if (pageElement) {
        pageElement.classList.add('active');
    } else {
        console.warn('⚠️ Page element not found:', pageId + 'Page');
    }
    
    // Update page title
    const titles = {
        'stats': '<i class="fas fa-chart-line"></i> Dashboard',
        'hotels': '<i class="fas fa-hotel"></i> โรงแรม',
        'filters': '<i class="fas fa-filter"></i> ตัวกรอง',
        'accommodation-types': '<i class="fas fa-building"></i> ประเภทที่พัก',
        'roomtypes': '<i class="fas fa-door-open"></i> ประเภทห้องพัก',
        'websettings': '<i class="fas fa-palette"></i> แก้ไขหน้าเว็บไซต์',
        'activity': '<i class="fas fa-history"></i> ประวัติการแก้ไข',
        'likes': '<i class="fas fa-heart"></i> สถิติหัวใจ',
        'members': '<i class="fas fa-users"></i> ระบบสมาชิก'
    };
    const pageTitle = document.getElementById('pageTitle');
    if (pageTitle && titles[page]) {
        pageTitle.innerHTML = titles[page];
    }
    
    // Stop auto-refresh when leaving stats page
    stopAutoRefresh();
    
    // Load data for specific pages
    if (page === 'stats') {
        // Reset to day period for Dashboard
        currentPeriod = 'day';
        updatePeriodButtons('stats', 'day');
        loadStats();
        startAutoRefresh(); // Start auto-refresh for activities
    }
    if (page === 'filters') loadFilters();
    if (page === 'accommodation-types') loadAccommodationTypes();
    if (page === 'roomtypes') loadRoomTypes();
    if (page === 'websettings') loadWebSettings();
    if (page === 'activity') loadActivityLog();
    if (page === 'likes') {
        // Reset to day period for Stats page
        currentStatsPeriod = 'day';
        updatePeriodButtons('likes', 'day');
        loadLikesStats();
    }
    if (page === 'members') loadMembers();
    if (page === 'hotels') {
        loadHotels();
        // ซ่อนปุ่มเพิ่มโรงแรมสำหรับ hotel_owner
        const userRole = currentUser.role || 'user';
        if (userRole === 'hotel_owner' || userRole === 'hotel-owner') {
            setTimeout(() => {
                const addHotelBtn = document.getElementById('addHotelBtn');
                if (addHotelBtn) {
                    addHotelBtn.style.display = 'none';
                    console.log('🔒 Hidden add hotel button in navigateTo()');
                }
            }, 50);
        }
    }
    
    // Close sidebar on mobile
    if (window.innerWidth <= 768) {
        document.getElementById('sidebar')?.classList.remove('active');
    }
}

// Load statistics
async function loadStats() {
    try {
        const response = await fetchWithAuth(`/api/admin/stats?period=${currentPeriod}`);
        const data = await response.json();
        
        if (data.success) {
            displayStats(data.data);
        }
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

// Display statistics
function displayStats(stats) {
    // Update stat cards
    const totalVisits = document.getElementById('totalVisits');
    const hotelClicks = document.getElementById('hotelClicks');
    const totalHotels = document.getElementById('totalHotels');
    const totalLikes = document.getElementById('totalLikes');
    
    if (totalVisits) totalVisits.textContent = stats.visits.total.toLocaleString('th-TH');
    if (hotelClicks) hotelClicks.textContent = (stats.clicks?.total || 0).toLocaleString('th-TH');
    if (totalHotels) totalHotels.textContent = (stats.totalHotels || 0).toLocaleString('th-TH');
    if (totalLikes) totalLikes.textContent = stats.likes.total.toLocaleString('th-TH');
    
    // Update period labels
    const periodLabels = {
        'day': 'วันนี้',
        'week': 'สัปดาห์นี้',
        'month': 'เดือนนี้',
        'year': 'ปีนี้'
    };
    const periodText = periodLabels[currentPeriod] || 'วันนี้';
    
    const periodLabel = document.getElementById('periodLabel');
    if (periodLabel) periodLabel.textContent = periodText;
    
    const clicksPeriodLabel = document.getElementById('clicksPeriodLabel');
    if (clicksPeriodLabel) clicksPeriodLabel.textContent = periodText;
    
    const likesPeriodLabel = document.getElementById('likesPeriodLabel');
    if (likesPeriodLabel) likesPeriodLabel.textContent = periodText;
    
    // Load recent activities
    loadRecentActivities();
    
    // Period buttons (only add listeners once)
    const periodButtons = document.querySelectorAll('.period-btn');
    periodButtons.forEach(btn => {
        btn.removeEventListener('click', handlePeriodClick); // Remove old listeners
        btn.addEventListener('click', handlePeriodClick);
    });
}

// Handle period button click (for Dashboard)
function handlePeriodClick(e) {
    const btn = e.currentTarget;
    currentPeriod = btn.dataset.period;
    updatePeriodButtons('stats', currentPeriod);
    loadStats();
}

// Update period buttons active state
function updatePeriodButtons(page, period) {
    let selector = '';
    if (page === 'stats') {
        // Dashboard period buttons
        selector = '#statsPage .period-btn';
    } else if (page === 'likes') {
        // Stats page period buttons
        selector = '#likesPage .period-btn';
    }
    
    if (selector) {
        document.querySelectorAll(selector).forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.period === period) {
                btn.classList.add('active');
            }
        });
    }
}

// Load recent activities
async function loadRecentActivities() {
    try {
        const response = await fetchWithAuth(`/api/admin/activity-logs?page=1&perPage=100`);
        const data = await response.json();
        
        if (data.success) {
            // API returns { logs: [], currentPage, totalPages, ... }
            // So we need to use data.data.logs instead of data.data
            let activities = data.data.logs || [];
            
            // กรองข้อมูลตาม role
            const userRole = currentUser.role || 'user';
            const username = currentUser.username || '';
            
            if ((userRole === 'hotel_owner' || userRole === 'hotel-owner') && username) {
                // hotel_owner เห็นเฉพาะการแก้ไขของตัวเอง
                activities = activities.filter(activity => activity.username === username);
                console.log('📊 Dashboard filtered for hotel_owner:', username, 'count:', activities.length);
            }
            
            displayRecentActivities(activities);
        }
    } catch (error) {
        console.error('Error loading recent activities:', error);
        // Show error message in UI
        const feedContainer = document.getElementById('activityFeed');
        if (feedContainer) {
            feedContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>เกิดข้อผิดพลาดในการโหลดกิจกรรม</p>
                </div>
            `;
        }
    }
}

// Display recent activities - แสดง 10 รายการล่าสุดเท่านั้น
function displayRecentActivities(activities) {
    const feedContainer = document.getElementById('activityFeed');
    if (!feedContainer) return;
    
    // Check if activities is an array
    if (!Array.isArray(activities)) {
        console.error('Activities is not an array:', activities);
        feedContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-exclamation-triangle"></i>
                <p>เกิดข้อผิดพลาดในการโหลดกิจกรรม</p>
            </div>
        `;
        return;
    }
    
    if (activities.length === 0) {
        feedContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-inbox"></i>
                <p>ยังไม่มีกิจกรรม</p>
            </div>
        `;
        return;
    }
    
    // แสดงเฉพาะ 10 รายการล่าสุด
    const recentActivities = activities.slice(0, 10);
    
    feedContainer.innerHTML = recentActivities.map(activity => {
        const iconData = getActivityIconData(activity.action);
        const timeAgo = formatTimeAgo(activity.timestamp);
        
        return `
            <div class="activity-item ${iconData.class}">
                <div class="activity-icon">
                    <i class="fas ${iconData.icon}"></i>
                </div>
                <div class="activity-content">
                    <div class="activity-text">
                        <strong>${activity.nickname || activity.username}</strong> 
                        ${activity.action}
                        <span class="activity-target">"${activity.hotelName || activity.details || ''}"</span>
                    </div>
                    <div class="activity-time" data-timestamp="${activity.timestamp}">${timeAgo}</div>
                </div>
            </div>
        `;
    }).join('');
    
    // เริ่ม realtime time update หลังจากแสดงผล
    updateActivityTimestamps();
}

// Get icon data based on activity action
function getActivityIconData(action) {
    const mapping = {
        'เพิ่มโรงแรม': { icon: 'fa-plus-circle', class: 'add' },
        'แก้ไขโรงแรม': { icon: 'fa-edit', class: 'edit' },
        'ลบโรงแรม': { icon: 'fa-trash-alt', class: 'delete' },
        'เพิ่มตัวกรอง': { icon: 'fa-filter', class: 'add' },
        'แก้ไขตัวกรอง': { icon: 'fa-edit', class: 'edit' },
        'ลบตัวกรอง': { icon: 'fa-times-circle', class: 'delete' },
        'กดหัวใจ': { icon: 'fa-heart', class: 'like' }
    };
    
    return mapping[action] || { icon: 'fa-info-circle', class: '' };
}

// Format time ago - แสดงเวลาแบบ relative (Thailand Timezone GMT+7)
function formatTimeAgo(timestamp) {
    if (!timestamp) return 'ไม่ทราบเวลา';
    
    // Get current time in Thailand timezone
    const now = new Date();
    let past;
    
    // Try to parse different timestamp formats
    if (typeof timestamp === 'string') {
        // Thai date format: "5/10/2568 14:30:45" or "05/10/2568, 14:30:45"
        // Format is D/M/Y (day/month/year) in Thai format
        if (timestamp.includes('/') && timestamp.includes(',')) {
            // Remove comma and extra spaces
            timestamp = timestamp.replace(/,\s*/g, ' ').trim();
        }
        
        // Convert Thai year (พ.ศ.) to AD if needed
        const thaiYearMatch = timestamp.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
        if (thaiYearMatch) {
            const day = thaiYearMatch[1].padStart(2, '0');    // First number is day (D/M/Y format)
            const month = thaiYearMatch[2].padStart(2, '0');  // Second number is month
            let year = parseInt(thaiYearMatch[3]);
            
            // Convert Thai year to AD (subtract 543)
            if (year > 2500) {
                year = year - 543;
            }
            
            let timePart = timestamp.split(' ')[1] || '00:00:00';
            // Normalize time part to ensure HH:MM:SS format (add leading zeros)
            const timeComponents = timePart.split(':');
            if (timeComponents.length === 3) {
                timePart = timeComponents.map(t => t.padStart(2, '0')).join(':');
            } else if (timeComponents.length === 2) {
                // Add seconds if missing
                timePart = timeComponents.map(t => t.padStart(2, '0')).join(':') + ':00';
            }
            
            // สร้าง Date object โดยใช้ local timezone (จะเป็น GMT+7 อัตโนมัติ)
            const isoString = `${year}-${month}-${day}T${timePart}`;
            past = new Date(isoString);
        } else {
            // ISO 8601 format or other formats
            past = new Date(timestamp);
        }
    } else {
        past = new Date(timestamp);
    }
    
    // Check if date is valid
    if (isNaN(past.getTime())) {
        console.warn('Invalid timestamp:', timestamp);
        return 'เวลาไม่ถูกต้อง';
    }
    
    // คำนวณความแตกต่างเวลาจากปัจจุบัน
    const diffMs = now - past;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    const diffMonth = Math.floor(diffDay / 30);
    const diffYear = Math.floor(diffDay / 365);
    
    // น้อยกว่า 1 นาที
    if (diffSec < 60) return 'เมื่อสักครู่';
    
    // น้อยกว่า 1 ชั่วโมง
    if (diffMin < 60) return `${diffMin} นาทีที่แล้ว`;
    
    // น้อยกว่า 1 วัน
    if (diffHour < 24) return `${diffHour} ชั่วโมงที่แล้ว`;
    
    // น้อยกว่า 1 เดือน (30 วัน)
    if (diffDay < 30) return `${diffDay} วันที่แล้ว`;
    
    // น้อยกว่า 1 ปี (365 วัน)
    if (diffMonth < 12) return `${diffMonth} เดือนที่แล้ว`;
    
    // มากกว่า 1 ปี
    return `${diffYear} ปีที่แล้ว`;
}

// Format full datetime with Thailand timezone
function formatThaiDateTime(timestamp) {
    if (!timestamp) return '-';
    
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return '-';
    
    // Format with Thai locale and timezone
    const options = {
        timeZone: 'Asia/Bangkok',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    };
    
    return date.toLocaleString('th-TH', options) + ' (GMT+7)';
}

// Auto-refresh activities และ realtime time update
let refreshInterval;
let timeUpdateInterval;

function startAutoRefresh() {
    // Clear existing intervals
    if (refreshInterval) {
        clearInterval(refreshInterval);
    }
    if (timeUpdateInterval) {
        clearInterval(timeUpdateInterval);
    }
    
    // Refresh data every 10 seconds (โหลดข้อมูลใหม่จาก API)
    refreshInterval = setInterval(() => {
        if (document.querySelector('.page-content.active')?.id === 'statsPage') {
            loadRecentActivities();
        }
    }, 10000);
    
    // Update time display every 30 seconds (อัพเดทเวลาแบบ realtime โดยไม่โหลดข้อมูลใหม่)
    timeUpdateInterval = setInterval(() => {
        if (document.querySelector('.page-content.active')?.id === 'statsPage') {
            updateActivityTimestamps();
        }
    }, 30000); // ทุก 30 วินาที
}

function stopAutoRefresh() {
    if (refreshInterval) {
        clearInterval(refreshInterval);
        refreshInterval = null;
    }
    if (timeUpdateInterval) {
        clearInterval(timeUpdateInterval);
        timeUpdateInterval = null;
    }
}

// Update timestamps in real-time without reloading data
function updateActivityTimestamps() {
    const activityItems = document.querySelectorAll('.activity-item');
    
    if (activityItems.length === 0) {
        // ไม่แสดง log เพราะอาจยังไม่มีข้อมูล
        return;
    }
    
    let updatedCount = 0;
    
    activityItems.forEach((item, index) => {
        const timeElement = item.querySelector('.activity-time');
        if (!timeElement) {
            // ไม่แสดง warning เพราะเป็นเรื่องปกติ
            return;
        }
        
        // Get original timestamp from data attribute
        const originalTimestamp = timeElement.dataset.timestamp;
        if (!originalTimestamp) {
            // ไม่แสดง warning
            return;
        }
        
        // Update the time display
        const newTimeAgo = formatTimeAgo(originalTimestamp);
        timeElement.textContent = newTimeAgo;
        updatedCount++;
    });
    
    // แสดง log เฉพาะเมื่ออัพเดทสำเร็จ และมีการเปลี่ยนแปลง
    if (updatedCount > 0) {
        console.log(`✅ Updated ${updatedCount} timestamps`);
    }
}

// Load hotels
async function loadHotels() {
    try {
        const response = await fetch('/api/hotels');
        const data = await response.json();
        
        if (data.success) {
            let hotels = data.data;
            
            // กรองข้อมูลตาม role
            const userRole = currentUser.role || 'user';
            const userHotelId = currentUser.hotelId || '';
            
            if ((userRole === 'hotel_owner' || userRole === 'hotel-owner') && userHotelId) {
                // hotel_owner เห็นเฉพาะโรงแรมของตัวเอง (เปรียบเทียบแบบ string)
                hotels = hotels.filter(hotel => String(hotel.id) === String(userHotelId));
                console.log('🏨 Filtered hotels for hotel_owner:', userHotelId, 'count:', hotels.length);
                
                // ซ่อนปุ่มเพิ่มโรงแรม
                const addHotelBtn = document.getElementById('addHotelBtn');
                if (addHotelBtn) {
                    addHotelBtn.style.display = 'none';
                    console.log('🔒 Hidden add hotel button in loadHotels()');
                }
            }
            
            window.allHotels = hotels; // เก็บข้อมูลที่กรองแล้วไว้สำหรับค้นหา
            await displayHotelsTable(hotels);
        }
    } catch (error) {
        console.error('Error loading hotels:', error);
    }
}

// Display hotels table with click and like statistics
async function displayHotelsTable(hotels) {
    const container = document.getElementById('hotelsTable')?.querySelector('tbody');
    const hotelsCount = document.getElementById('hotelsCount');
    
    // Update hotels count badge
    if (hotelsCount) hotelsCount.textContent = hotels.length;
    
    if (!container) return;
    
    if (hotels.length === 0) {
        container.innerHTML = '<tr><td colspan="10" style="text-align: center; padding: 40px;">ยังไม่มีข้อมูลโรงแรม</td></tr>';
        return;
    }
    
    // Get click statistics and likes for all hotels
    const clickStats = {};
    const likeStats = {};
    
    try {
        // Get clicks
        for (const hotel of hotels) {
            const response = await fetch(`/api/hotels/${hotel.id}/clicks`);
            const data = await response.json();
            clickStats[hotel.id] = data.clicks || 0;
        }
        
        // Get likes
        const likesResponse = await fetchWithAuth(`/api/admin/stats?period=year`);
        const likesData = await likesResponse.json();
        if (likesData.success && likesData.data.likes) {
            const byHotel = likesData.data.likes.byHotel || {};
            Object.keys(byHotel).forEach(hotelId => {
                likeStats[hotelId] = byHotel[hotelId] || 0;
            });
        }
    } catch (error) {
        console.error('Error loading statistics:', error);
    }
    
    container.innerHTML = hotels.map(hotel => {
        const clicks = clickStats[hotel.id] || 0;
        const likes = likeStats[hotel.id] || 0;
        const lastModified = hotel.lastModified || '';
        const modifiedBy = hotel.modifiedBy || '-';
        const phone = hotel.phone || '-';
        const status = hotel.status || 'active';
        const isActive = status === 'active';
        
        return `
                    <tr class="hotel-row" data-hotel-id="${hotel.id}">
                        <td class="mobile-show"><span class="hotel-id">${hotel.id}</span></td>
                        <td class="mobile-show">
                            <img src="${hotel.imageUrl || 'data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2760%27 height=%2760%27%3E%3Crect fill=%27%23667eea%27 width=%2760%27 height=%2760%27/%3E%3Ctext fill=%27%23fff%27 x=%2750%25%27 y=%2750%25%27 dominant-baseline=%27middle%27 text-anchor=%27middle%27 font-family=%27Arial%27 font-size=%2712%27%3ENo Image%3C/text%3E%3C/svg%3E'}" 
                                 class="hotel-thumb" 
                                 onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2760%27 height=%2760%27%3E%3Crect fill=%27%23667eea%27 width=%2760%27 height=%2760%27/%3E%3Ctext fill=%27%23fff%27 x=%2750%25%27 y=%2750%25%27 dominant-baseline=%27middle%27 text-anchor=%27middle%27 font-family=%27Arial%27 font-size=%2712%27%3ENo Image%3C/text%3E%3C/svg%3E'">
                        </td>
                        <td class="mobile-show">
                            <div class="hotel-name" style="cursor: pointer;" onclick="toggleMobileDetails('${hotel.id}')" title="คลิกเพื่อดูรายละเอียด">
                                <span class="hotel-name-th">${hotel.nameTh || hotel.nameEn || 'ไม่มีชื่อ'}</span>
                                ${hotel.nameTh && hotel.nameEn ? `<span class="hotel-name-en">${hotel.nameEn}</span>` : ''}
                                <i class="fas fa-chevron-down mobile-chevron"></i>
                            </div>
                            <!-- Mobile Details (Hidden by default) -->
                            <div class="mobile-details" id="details-${hotel.id}" style="display: none;">
                                <div class="mobile-action-buttons">
                                    <!-- ปุ่มดูข้อมูล - เต็มความกว้าง -->
                                    <button class="mobile-btn mobile-btn-primary mobile-btn-full" 
                                            onclick="event.stopPropagation(); viewHotelDetails('${hotel.id}')" 
                                            title="ดูข้อมูลโรงแรม">
                                        <i class="fas fa-info-circle"></i>
                                        <span>ดูข้อมูลโรงแรม</span>
                                    </button>
                                    
                                    <!-- ปุ่มคู่ - ครึ่งความกว้าง -->
                                    <div class="mobile-btn-group">
                                        <button class="mobile-btn ${isActive ? 'mobile-btn-danger' : 'mobile-btn-success'}" 
                                                onclick="event.stopPropagation(); toggleHotelStatus('${hotel.id}', '${hotel.nameTh}', '${status}')" 
                                                title="${isActive ? 'ปิดโรงแรม' : 'เปิดโรงแรม'}">
                                            <i class="fas ${isActive ? 'fa-times-circle' : 'fa-check-circle'}"></i>
                                            <span>${isActive ? 'ปิด' : 'เปิด'}</span>
                                        </button>
                                        <button class="mobile-btn mobile-btn-warning" 
                                                onclick="event.stopPropagation(); editHotel('${hotel.id}')" 
                                                title="แก้ไขข้อมูล">
                                            <i class="fas fa-edit"></i>
                                            <span>แก้ไข</span>
                                        </button>
                                    </div>
                                    
                                    <!-- ปุ่มลบ - เต็มความกว้าง -->
                                    <button class="mobile-btn mobile-btn-danger-outline mobile-btn-full" 
                                            onclick="event.stopPropagation(); deleteHotel('${hotel.id}', '${hotel.nameTh}')" 
                                            title="ลบโรงแรม">
                                        <i class="fas fa-trash-alt"></i>
                                        <span>ลบโรงแรม</span>
                                    </button>
                                </div>
                            </div>
                        </td>
                        <td class="mobile-show">
                            <span class="status-badge status-${status}" style="display: inline-block; font-size: 0.85rem;">
                                <i class="fas fa-circle"></i>
                                ${isActive ? 'เปิด' : 'ปิด'}
                            </span>
                        </td>
                        <td class="desktop-show">
                            <span class="hotel-id">${hotel.id}</span>
                        </td>
                        <td class="desktop-show">
                            <img src="${hotel.imageUrl || 'data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2760%27 height=%2760%27%3E%3Crect fill=%27%23667eea%27 width=%2760%27 height=%2760%27/%3E%3Ctext fill=%27%23fff%27 x=%2750%25%27 y=%2750%25%27 dominant-baseline=%27middle%27 text-anchor=%27middle%27 font-family=%27Arial%27 font-size=%2712%27%3ENo Image%3C/text%3E%3C/svg%3E'}" 
                                 class="hotel-thumb" 
                                 onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2760%27 height=%2760%27%3E%3Crect fill=%27%23667eea%27 width=%2760%27 height=%2760%27/%3E%3Ctext fill=%27%23fff%27 x=%2750%25%27 y=%2750%25%27 dominant-baseline=%27middle%27 text-anchor=%27middle%27 font-family=%27Arial%27 font-size=%2712%27%3ENo Image%3C/text%3E%3C/svg%3E'">
                        </td>
                        <td class="desktop-show">
                            <div class="hotel-name" style="cursor: pointer;" onclick="viewHotelDetails('${hotel.id}')" title="คลิกเพื่อดูรายละเอียด">
                                <span class="hotel-name-th">${hotel.nameTh || hotel.nameEn || 'ไม่มีชื่อ'}</span>
                                ${hotel.nameTh && hotel.nameEn ? `<span class="hotel-name-en">${hotel.nameEn}</span>` : ''}
                            </div>
                        </td>
                        <td class="desktop-show"><span class="user-info">${hotel.ownerName || '-'}</span></td>
                        <td class="desktop-show">
                            <div class="status-toggle" style="display: flex; gap: 5px; align-items: center;">
                                <span class="status-badge status-${status}" title="${isActive ? 'โรงแรมเปิดแสดง' : 'โรงแรมปิดแสดง'}">
                                    <i class="fas fa-circle"></i>
                                    ${isActive ? 'เปิด' : 'ปิด'}
                                </span>
                                <button class="btn btn-sm ${isActive ? 'btn-danger' : 'btn-success'}" 
                                        onclick="toggleHotelStatus('${hotel.id}', '${hotel.nameTh}', '${status}')" 
                                        title="${isActive ? 'ปิดโรงแรม' : 'เปิดโรงแรม'}"
                                        style="min-width: 60px;">
                                    <i class="fas ${isActive ? 'fa-eye-slash' : 'fa-eye'}"></i>
                                    ${isActive ? 'ปิด' : 'เปิด'}
                                </button>
                                <button class="btn btn-sm btn-primary" onclick="editHotel('${hotel.id}')" title="แก้ไข">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="btn btn-sm btn-danger" onclick="deleteHotel('${hotel.id}', '${hotel.nameTh}')" title="ลบ">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </td>
                        <td class="desktop-show">
                            <div class="click-stats">
                                <i class="fas fa-mouse-pointer"></i>
                                <span>${clicks.toLocaleString('th-TH')}</span>
                            </div>
                        </td>
                        <td class="desktop-show">
                            <div class="click-stats">
                                <i class="fas fa-heart" style="color: #e74c3c;"></i>
                                <span>${likes.toLocaleString('th-TH')}</span>
                            </div>
                        </td>
                        <td class="desktop-show"><span class="user-info">${modifiedBy}</span></td>
                        <td class="desktop-show">
                            <div style="font-size: 0.9rem; color: var(--gray);">
                                <i class="fas fa-phone" style="font-size: 0.8rem; margin-right: 4px;"></i>${phone}
                            </div>
                        </td>
                        <td class="desktop-show">
                            <div class="timestamp-realtime" data-timestamp="${lastModified}" style="font-size: 0.85rem; color: var(--gray);">
                                <i class="fas fa-clock" style="font-size: 0.75rem; margin-right: 4px;"></i>${formatTimeAgo(lastModified)}
                            </div>
                        </td>
                    </tr>
                `;
    }).join('');
    
    // ซ่อนปุ่มลบและเปิด/ปิดสถานะสำหรับ hotel_owner
    const userRole = currentUser.role || 'user';
    if (userRole === 'hotel_owner' || userRole === 'hotel-owner') {
        // รอให้ DOM อัพเดทเสร็จก่อน
        setTimeout(() => {
            document.querySelectorAll('.hotel-row').forEach(row => {
                // Desktop buttons - ซ่อนปุ่มลบ
                const deleteBtn = row.querySelector('button[onclick*="deleteHotel"]');
                if (deleteBtn) deleteBtn.style.display = 'none';
                
                // Desktop buttons - ซ่อนปุ่มเปิด/ปิดสถานะ
                const toggleBtn = row.querySelector('button[onclick*="toggleHotelStatus"]');
                if (toggleBtn) toggleBtn.style.display = 'none';
                
                // Mobile buttons - ซ่อนปุ่มลบ
                const mobileDeleteBtn = row.querySelector('.mobile-btn-danger-outline');
                if (mobileDeleteBtn) mobileDeleteBtn.style.display = 'none';
                
                // Mobile buttons - ซ่อนปุ่มเปิด/ปิด (ในกลุ่มปุ่ม)
                const mobileToggleBtn = row.querySelector('.mobile-btn[onclick*="toggleHotelStatus"]');
                if (mobileToggleBtn) mobileToggleBtn.style.display = 'none';
            });
            console.log('✅ Hotel owner - Hidden delete and toggle status buttons');
        }, 100);
    }
    
    // Start realtime update for timestamps
    startHotelTimestampUpdates();
}

// Search hotels function
function searchHotels() {
    const searchInput = document.getElementById('hotelSearchInput');
    if (!searchInput || !window.allHotels) return;
    
    const searchTerm = searchInput.value.toLowerCase().trim();
    
    let filtered = window.allHotels;
    
    // Apply status filter
    if (currentStatusFilter !== 'all') {
        filtered = filtered.filter(hotel => {
            const status = hotel.status || 'active';
            return status === currentStatusFilter;
        });
    }
    
    // Apply search filter
    if (searchTerm) {
        filtered = filtered.filter(hotel => {
            return (
                hotel.id?.toLowerCase().includes(searchTerm) ||
                hotel.nameTh?.toLowerCase().includes(searchTerm) ||
                hotel.nameEn?.toLowerCase().includes(searchTerm) ||
                hotel.ownerName?.toLowerCase().includes(searchTerm) ||
                hotel.phone?.includes(searchTerm)
            );
        });
    }
    
    displayHotelsTable(filtered);
}

// Filter hotels by status
function filterHotelsByStatus(status) {
    currentStatusFilter = status;
    
    // Update button states
    document.querySelectorAll('.filter-section .btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    const activeButton = document.getElementById(`filter${status.charAt(0).toUpperCase() + status.slice(1)}`);
    if (activeButton) {
        activeButton.classList.add('active');
    }
    
    // Apply filter
    searchHotels();
}

// Update hotel timestamps in real-time
function startHotelTimestampUpdates() {
    // Clear any existing interval
    if (window.hotelTimestampInterval) {
        clearInterval(window.hotelTimestampInterval);
    }
    
    // Update every 30 seconds
    window.hotelTimestampInterval = setInterval(() => {
        const timestamps = document.querySelectorAll('#hotelsTable .timestamp-realtime');
        timestamps.forEach(elem => {
            const timestamp = elem.getAttribute('data-timestamp');
            if (timestamp) {
                elem.textContent = formatTimeAgo(timestamp);
            }
        });
    }, 30000);
}

// Load likes statistics
async function loadLikesStats() {
    try {
        const response = await fetchWithAuth(`/api/admin/stats?period=${currentStatsPeriod}`);
        const data = await response.json();
        
        if (data.success) {
            console.log('Stats Data:', data.data); // Debug log
            console.log('topHotels:', data.data.topHotels);
            console.log('topClickedHotels:', data.data.topClickedHotels);
            
            // กรองข้อมูลตาม role
            const userRole = currentUser.role || 'user';
            const userHotelId = currentUser.hotelId || '';
            
            let topHotels = data.data.topHotels;
            let topClickedHotels = data.data.topClickedHotels;
            
            if ((userRole === 'hotel_owner' || userRole === 'hotel-owner') && userHotelId) {
                // hotel_owner เห็นเฉพาะสถิติของโรงแรมตัวเอง (เปรียบเทียบแบบ string)
                if (Array.isArray(topHotels)) {
                    topHotels = topHotels.filter(h => String(h.hotelId) === String(userHotelId));
                } else if (typeof topHotels === 'object') {
                    const filtered = {};
                    if (topHotels[String(userHotelId)]) {
                        filtered[String(userHotelId)] = topHotels[String(userHotelId)];
                    }
                    topHotels = filtered;
                }
                
                if (Array.isArray(topClickedHotels)) {
                    topClickedHotels = topClickedHotels.filter(h => String(h.hotelId) === String(userHotelId));
                } else if (typeof topClickedHotels === 'object') {
                    const filtered = {};
                    if (topClickedHotels[String(userHotelId)]) {
                        filtered[String(userHotelId)] = topClickedHotels[String(userHotelId)];
                    }
                    topClickedHotels = filtered;
                }
                console.log('📊 Filtered stats for hotel_owner:', userHotelId);
            }
            
            displayLikesStats(topHotels, topClickedHotels);
        } else {
            console.error('Failed to load stats:', data.message);
        }
    } catch (error) {
        console.error('Error loading likes stats:', error);
    }
}

// Display likes statistics
async function displayLikesStats(topHotels, clicksData) {
    console.log('=== displayLikesStats Debug ===');
    console.log('topHotels type:', Array.isArray(topHotels) ? 'Array' : typeof topHotels);
    console.log('topHotels:', topHotels);
    console.log('clicksData type:', Array.isArray(clicksData) ? 'Array' : typeof clicksData);
    console.log('clicksData:', clicksData);
    
    // Load all hotels to get names
    const hotelsResponse = await fetch('/api/hotels');
    const hotelsData = await hotelsResponse.json();
    let hotels = hotelsData.data;
    
    // กรองข้อมูลโรงแรมตาม role
    const userRole = currentUser.role || 'user';
    const userHotelId = currentUser.hotelId || '';
    
    if ((userRole === 'hotel_owner' || userRole === 'hotel-owner') && userHotelId) {
        // hotel_owner เห็นเฉพาะโรงแรมตัวเอง (เปรียบเทียบแบบ string)
        hotels = hotels.filter(h => String(h.id) === String(userHotelId));
        console.log('🏨 Filtered hotels for stats display:', userHotelId, 'count:', hotels.length);
    }
    
    console.log('Total hotels:', hotels.length);
    
    const container = document.getElementById('likesList');
    
    // Check if container exists
    if (!container) {
        console.warn('likesList element not found');
        return;
    }
    
    // Ensure topHotels is an array
    let topHotelsArray = [];
    if (topHotels) {
        if (Array.isArray(topHotels)) {
            topHotelsArray = topHotels;
        } else if (typeof topHotels === 'object') {
            // Convert object to array if needed
            topHotelsArray = Object.entries(topHotels).map(([hotelId, likes]) => ({
                hotelId: hotelId,
                likes: typeof likes === 'object' ? likes.likes : likes
            }));
        }
    }
    
    console.log('topHotelsArray after conversion:', topHotelsArray);
    
    // Convert clicksData to Array if it's an Object
    let clicksArray = [];
    if (clicksData) {
        if (Array.isArray(clicksData)) {
            // Already an array (topClickedHotels format)
            clicksArray = clicksData.map(item => ({
                hotelId: item.hotelId,
                count: item.clicks || item.count || 0
            }));
        } else if (typeof clicksData === 'object') {
            // Convert object to array: { "hotel-1": 10, "hotel-2": 5 } → [{ hotelId: "hotel-1", count: 10 }, ...]
            clicksArray = Object.entries(clicksData).map(([hotelId, count]) => ({
                hotelId: hotelId,
                count: typeof count === 'number' ? count : (count.clicks || count.count || 0)
            }));
        }
    }
    
    console.log('clicksArray after conversion:', clicksArray);
    
    // Combine likes and clicks data
    const statsData = hotels.map(hotel => {
        const likesInfo = topHotelsArray.find(h => h.hotelId === hotel.id);
        const clicksInfo = clicksArray.find(c => c.hotelId === hotel.id);
        
        const item = {
            hotel: hotel,
            likes: likesInfo ? likesInfo.likes : 0,
            clicks: clicksInfo ? clicksInfo.count : 0
        };
        
        // Debug log for each hotel
        if (item.likes > 0 || item.clicks > 0) {
            console.log(`Hotel ${hotel.id}:`, {
                name: hotel.nameTh,
                likes: item.likes,
                clicks: item.clicks,
                likesInfo: likesInfo,
                clicksInfo: clicksInfo
            });
        }
        
        return item;
    });
    
    // Filter by search term
    let filteredStatsData = statsData;
    if (currentStatsSearch && currentStatsSearch.length > 0) {
        filteredStatsData = statsData.filter(item => {
            const nameTh = (item.hotel.nameTh || '').toLowerCase();
            const nameEn = (item.hotel.nameEn || '').toLowerCase();
            return nameTh.includes(currentStatsSearch) || nameEn.includes(currentStatsSearch);
        });
    }
    
    // Sort by current criteria
    filteredStatsData.sort((a, b) => {
        const valueA = currentSort === 'likes' ? a.likes : a.clicks;
        const valueB = currentSort === 'likes' ? b.likes : b.clicks;
        return currentOrder === 'most' ? valueB - valueA : valueA - valueB;
    });
    
    // Calculate totals (from filtered data)
    const totalLikes = filteredStatsData.reduce((sum, item) => sum + item.likes, 0);
    const totalClicks = filteredStatsData.reduce((sum, item) => sum + item.clicks, 0);
    
    console.log('=== Totals Calculation ===');
    console.log('Total Likes:', totalLikes, 'Total Clicks:', totalClicks);
    console.log('Filtered items:', filteredStatsData.length, '/ Total items:', statsData.length);
    console.log('===========================');
    
    // Update summary with safety checks
    const totalLikesElement = document.getElementById('totalLikesSum');
    const totalClicksElement = document.getElementById('totalClicksSum');
    
    if (totalLikesElement) {
        totalLikesElement.textContent = totalLikes.toLocaleString('th-TH');
        console.log('Updated totalLikesSum to:', totalLikes); // Debug log
    } else {
        console.error('totalLikesSum element not found');
    }
    if (totalClicksElement) {
        totalClicksElement.textContent = totalClicks.toLocaleString('th-TH');
        console.log('Updated totalClicksSum to:', totalClicks); // Debug log
    } else {
        console.error('totalClicksSum element not found');
    }
    
    if (filteredStatsData.length === 0) {
        container.innerHTML = '<p style="text-align: center; padding: 40px; color: #999;">ไม่พบข้อมูลตามเงื่อนไขที่เลือก</p>';
        return;
    }
    
    container.innerHTML = filteredStatsData.map((item, index) => {
        const displayValue = currentSort === 'likes' ? item.likes : item.clicks;
        const icon = currentSort === 'likes' ? 'fa-heart' : 'fa-mouse-pointer';
        const color = currentSort === 'likes' ? '#e91e63' : '#ff9800';
        
        return `
            <div class="like-item" style="border-left: 4px solid ${color};">
                <div class="like-info">
                    <h4 style="display: flex; align-items: center; gap: 10px;">
                        <span style="background: ${color}; color: white; padding: 4px 10px; border-radius: 20px; font-size: 0.8rem;">#${index + 1}</span>
                        ${item.hotel.nameTh || item.hotel.nameEn}
                    </h4>
                    <p style="margin: 5px 0 0 0; color: #666; font-size: 0.9rem;">
                        <i class="fas fa-heart" style="color: #e91e63;"></i> ${item.likes} หัวใจ
                        <span style="margin: 0 8px;">•</span>
                        <i class="fas fa-mouse-pointer" style="color: #ff9800;"></i> ${item.clicks} คลิก
                    </p>
                </div>
                <div class="like-count" style="color: ${color};">
                    <i class="fas ${icon}"></i>
                    ${displayValue}
                </div>
            </div>
        `;
    }).join('');
}

// Open add hotel modal (called from top bar)
function openAddHotelModal() {
    showHotelForm();
}

// Edit hotel (called from table)
function editHotel(hotelId) {
    showHotelForm(hotelId);
}

// Show hotel form
function showHotelForm(hotelId = null) {
    const modal = document.getElementById('hotelModal');
    const form = document.getElementById('hotelForm');
    const title = document.getElementById('modalTitle');
    
    if (!modal || !form) return;
    
    // Reset form
    form.reset();
    for (let i = 1; i <= 5; i++) {
        const preview = document.getElementById(`imagePreview${i}`);
        if (preview) preview.style.display = 'none';
    }
    
    // Store hotelId for later use
    window.editingHotelId = hotelId;
    
    if (hotelId) {
        title.innerHTML = '<i class="fas fa-edit"></i> แก้ไขโรงแรม';
        // Disable ID field when editing
        document.getElementById('hotelId').readOnly = true;
        document.getElementById('hotelId').style.background = '#f0f0f0';
        loadHotelData(hotelId);
    } else {
        title.innerHTML = '<i class="fas fa-plus"></i> เพิ่มโรงแรม';
        // Enable ID field when adding
        document.getElementById('hotelId').readOnly = false;
        document.getElementById('hotelId').style.background = '';
    }
    
    modal.style.display = 'block';
    
    // Load filters and room types for checkboxes
    loadFilterCheckboxes();
    loadRoomTypeCheckboxes();
    loadAccommodationTypeCheckboxes();
    
    // Form submit
    form.onsubmit = async (e) => {
        e.preventDefault();
        await saveHotel(hotelId);
    };
    
    // Image URL preview for all 5 images
    document.getElementById('imageUrl').addEventListener('input', function() {
        previewImageUrl(this.value, 1);
    });
    for (let i = 2; i <= 5; i++) {
        const urlInput = document.getElementById(`imageUrl${i}`);
        if (urlInput) {
            urlInput.addEventListener('input', function() {
                previewImageUrl(this.value, i);
            });
        }
    }
}

// Upload image function
async function uploadImage(imageNumber = 1) {
    console.log('🔍 uploadImage called with imageNumber:', imageNumber);
    
    const fileInput = document.getElementById(`imageFile${imageNumber}`);
    console.log('📁 fileInput:', fileInput);
    
    // Check if file input exists and has files
    if (!fileInput) {
        console.error('❌ ไม่พบช่องเลือกไฟล์');
        showError('ไม่พบช่องเลือกไฟล์');
        return;
    }
    
    console.log('📦 files:', fileInput.files);
    console.log('📊 files.length:', fileInput.files?.length);
    
    if (!fileInput.files || fileInput.files.length === 0) {
        console.error('❌ ไม่มีไฟล์');
        showError('กรุณาเลือกไฟล์รูปภาพก่อน');
        return;
    }
    
    const file = fileInput.files[0];
    console.log('📄 File:', file.name, 'Size:', (file.size / 1024 / 1024).toFixed(2), 'MB', 'Type:', file.type);
    
    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
        console.error('❌ ไฟล์ใหญ่เกิน 5MB');
        showError('ไฟล์รูปภาพมีขนาดใหญ่เกิน 5MB');
        return;
    }
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
        console.error('❌ ประเภทไฟล์ไม่รองรับ:', file.type);
        showError('รองรับเฉพาะไฟล์ JPG, PNG, GIF, WebP เท่านั้น');
        return;
    }
    
    console.log('✅ Validation passed, creating FormData...');
    const formData = new FormData();
    formData.append('image', file);
    console.log('✅ FormData created');
    
    try {
        // Show uploading message
        console.log('🚀 เริ่มอัพโหลด...');
        showSuccess(`กำลังอัพโหลดรูปที่ ${imageNumber}...`);
        
        const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData
            // ไม่ต้องใส่ Content-Type header เพราะ browser จะใส่ให้อัตโนมัติพร้อม boundary
        });
        
        console.log('📡 Response status:', response.status);
        const data = await response.json();
        console.log('📦 Response data:', data);
        
        if (data.success && data.imageUrl) {
            console.log('✅ อัพโหลดสำเร็จ:', data.imageUrl);
            // Set the URL in the appropriate input field
            const urlField = imageNumber === 1 ? 'imageUrl' : `imageUrl${imageNumber}`;
            const urlInput = document.getElementById(urlField);
            console.log('📝 Setting URL to field:', urlField, urlInput);
            
            if (urlInput) {
                urlInput.value = data.imageUrl;
                console.log('✅ URL set:', data.imageUrl);
                
                // Show preview
                previewImageUrl(data.imageUrl, imageNumber);
                
                showSuccess(`✓ อัพโหลดรูปที่ ${imageNumber} สำเร็จ!`);
            } else {
                console.error('❌ ไม่พบ URL input field:', urlField);
                showError(`ไม่พบช่อง URL สำหรับรูปที่ ${imageNumber}`);
            }
        } else {
            console.error('❌ Upload failed:', data.error);
            showError(data.error || 'เกิดข้อผิดพลาดในการอัพโหลด');
        }
    } catch (error) {
        console.error('❌ Exception:', error);
        showError('เกิดข้อผิดพลาดในการอัพโหลดรูปภาพ กรุณาลองใหม่');
    }
}

// Preview image URL
function previewImageUrl(url, imageNumber = 1) {
    const preview = document.getElementById(`imagePreview${imageNumber}`);
    const img = document.getElementById(`previewImg${imageNumber}`);
    
    if (!preview || !img) return;
    
    if (url && url.trim() !== '') {
        img.src = url;
        img.onerror = function() {
            preview.style.display = 'none';
            if (imageNumber === 1) {
                showError('URL รูปภาพไม่ถูกต้อง');
            }
        };
        img.onload = function() {
            preview.style.display = 'block';
        };
    } else {
        preview.style.display = 'none';
    }
}

// Close hotel modal
function closeHotelModal() {
    const modal = document.getElementById('hotelModal');
    if (modal) modal.style.display = 'none';
}

// Load hotel data for editing
async function loadHotelData(hotelId) {
    try {
        const response = await fetch('/api/hotels');
        const data = await response.json();
        
        if (data.success) {
            const hotel = data.data.find(h => h.id === hotelId);
            if (hotel) {
                document.getElementById('hotelId').value = hotel.id || '';
                document.getElementById('hotelNameTh').value = hotel.nameTh || '';
                document.getElementById('hotelNameEn').value = hotel.nameEn || '';
                document.getElementById('ownerName').value = hotel.ownerName || '';
                document.getElementById('minPrice').value = hotel.priceStart || '';
                document.getElementById('maxPrice').value = hotel.priceEnd || '';
                
                // Load all 5 image URLs
                document.getElementById('imageUrl').value = hotel.imageUrl || '';
                document.getElementById('imageUrl2').value = hotel.imageUrl2 || '';
                document.getElementById('imageUrl3').value = hotel.imageUrl3 || '';
                document.getElementById('imageUrl4').value = hotel.imageUrl4 || '';
                document.getElementById('imageUrl5').value = hotel.imageUrl5 || '';
                
                document.getElementById('facebookUrl').value = hotel.facebookUrl || '';
                document.getElementById('phoneNumber').value = hotel.phone || '';
                document.getElementById('lineId').value = hotel.lineId || '';
                document.getElementById('websiteUrl').value = hotel.websiteUrl || '';
                document.getElementById('maxGuests').value = hotel.maxGuests || 1;
                document.getElementById('bankName').value = hotel.bankName || '';
                document.getElementById('accountName').value = hotel.accountName || '';
                document.getElementById('accountNumber').value = hotel.accountNumber || '';
                
                // Load and check filters/amenities
                if (hotel.filters) {
                    const selectedFilters = hotel.filters.split(',').map(f => f.trim());
                    // Wait for checkboxes to load
                    await new Promise(resolve => setTimeout(resolve, 500));
                    selectedFilters.forEach(filterName => {
                        const checkbox = document.querySelector(`input[type="checkbox"][name*="filter_"]`);
                        if (checkbox) {
                            // Find checkbox by label text
                            const labels = document.querySelectorAll('#filtersCheckboxes label');
                            labels.forEach(label => {
                                const labelText = label.textContent.trim();
                                if (labelText === filterName) {
                                    const cb = label.querySelector('input[type="checkbox"]');
                                    if (cb) {
                                        cb.checked = true;
                                        // Trigger change event to update visual
                                        cb.dispatchEvent(new Event('change'));
                                    }
                                }
                            });
                        }
                    });
                }
                
                // Load and check room types
                if (hotel.roomTypes) {
                    const selectedRoomTypes = hotel.roomTypes.split(',').map(rt => rt.trim());
                    // Wait for room type checkboxes to load
                    await new Promise(resolve => setTimeout(resolve, 500));
                    selectedRoomTypes.forEach(roomTypeId => {
                        const checkbox = document.querySelector(`#roomTypesCheckboxes input[value="${roomTypeId}"]`);
                        if (checkbox) {
                            checkbox.checked = true;
                            // Trigger change event to update visual
                            checkbox.dispatchEvent(new Event('change'));
                        }
                    });
                }
                
                // Load and check accommodation types (Radio - เลือกได้แค่ 1)
                if (hotel.accommodationTypes) {
                    const selectedAccommodationTypes = hotel.accommodationTypes.split(',').map(at => at.trim());
                    // Wait for accommodation type radio buttons to load
                    await new Promise(resolve => setTimeout(resolve, 500));
                    // เลือกแค่รายการแรก (เพราะเป็น radio button)
                    if (selectedAccommodationTypes.length > 0) {
                        const radio = document.querySelector(`#accommodationTypesRadios input[value="${selectedAccommodationTypes[0]}"]`);
                        if (radio) {
                            radio.checked = true;
                            // Trigger change event to update visual
                            radio.dispatchEvent(new Event('change'));
                        }
                    }
                }
                
                // Preview all images
                previewImageUrl(hotel.imageUrl || '', 1);
                previewImageUrl(hotel.imageUrl2 || '', 2);
                previewImageUrl(hotel.imageUrl3 || '', 3);
                previewImageUrl(hotel.imageUrl4 || '', 4);
                previewImageUrl(hotel.imageUrl5 || '', 5);
            }
        }
    } catch (error) {
        console.error('Error loading hotel data:', error);
    }
}

// Save hotel
async function saveHotel(hotelId) {
    const nameTh = document.getElementById('hotelNameTh')?.value?.trim() || '';
    const nameEn = document.getElementById('hotelNameEn')?.value?.trim() || '';
    const minPrice = document.getElementById('minPrice')?.value;
    const maxPrice = document.getElementById('maxPrice')?.value;
    const imageUrl = document.getElementById('imageUrl')?.value;
    const imageUrl2 = document.getElementById('imageUrl2')?.value || '';
    const imageUrl3 = document.getElementById('imageUrl3')?.value || '';
    const imageUrl4 = document.getElementById('imageUrl4')?.value || '';
    const imageUrl5 = document.getElementById('imageUrl5')?.value || '';
    const phoneNumber = document.getElementById('phoneNumber')?.value;
    const ownerName = document.getElementById('ownerName')?.value;
    const facebookUrl = document.getElementById('facebookUrl')?.value;
    const lineId = document.getElementById('lineId')?.value;
    const websiteUrl = document.getElementById('websiteUrl')?.value;
    const maxGuests = document.getElementById('maxGuests')?.value;
    const bankName = document.getElementById('bankName')?.value;
    const accountName = document.getElementById('accountName')?.value;
    const accountNumber = document.getElementById('accountNumber')?.value;
    
    // Validation: ต้องมีชื่ออย่างน้อย 1 ภาษา
    if (!nameTh && !nameEn) {
        showError('กรุณาระบุชื่อโรงแรมอย่างน้อย 1 ภาษา (ไทยหรืออังกฤษ)');
        return;
    }
    
    if (!minPrice || !maxPrice || !imageUrl) {
        showError('กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน (ราคาและรูปภาพอย่างน้อย 1 รูป)');
        return;
    }
    
    // Get selected filters from checkboxes
    const selectedFilters = [];
    const checkboxes = document.querySelectorAll('#filtersCheckboxes input[type="checkbox"]:checked');
    checkboxes.forEach(cb => {
        const label = cb.closest('label');
        if (label) {
            // Extract filter name from label text
            const filterNameSpan = label.querySelector('span:last-child');
            if (filterNameSpan) {
                selectedFilters.push(filterNameSpan.textContent.trim());
            }
        }
    });
    
    // Get selected room types from checkboxes
    const selectedRoomTypes = [];
    const roomTypeCheckboxes = document.querySelectorAll('#roomTypesCheckboxes input[type="checkbox"]:checked');
    roomTypeCheckboxes.forEach(cb => {
        selectedRoomTypes.push(cb.value); // Use checkbox value (room type ID)
    });
    
    // Get selected accommodation type from radio button (เลือกได้แค่ 1)
    const selectedAccommodationTypes = [];
    const accommodationTypeRadio = document.querySelector('#accommodationTypesRadios input[type="radio"]:checked');
    if (accommodationTypeRadio) {
        selectedAccommodationTypes.push(accommodationTypeRadio.value); // ได้แค่ 1 ค่า
    }
    
    const hotel = {
        id: hotelId || document.getElementById('hotelId')?.value || `hotel-${Date.now()}`,
        nameTh: nameTh || nameEn, // ถ้าไม่มีภาษาไทย ใช้ภาษาอังกฤษ
        nameEn: nameEn || nameTh, // ถ้าไม่มีภาษาอังกฤษ ใช้ภาษาไทย
        priceStart: parseFloat(minPrice),
        priceEnd: parseFloat(maxPrice),
        imageUrl: imageUrl,
        imageUrl2: imageUrl2,
        imageUrl3: imageUrl3,
        imageUrl4: imageUrl4,
        imageUrl5: imageUrl5,
        phone: phoneNumber || '',
        ownerName: ownerName || '',
        facebookUrl: facebookUrl || '',
        lineId: lineId || '',
        websiteUrl: websiteUrl || '',
        maxGuests: parseInt(maxGuests) || 1,
        filters: selectedFilters.join(', '), // Join with comma and space
        roomTypes: selectedRoomTypes.join(','), // Join room type IDs with comma (no space)
        accommodationTypes: selectedAccommodationTypes.join(','), // Join accommodation type IDs with comma (no space)
        bankName: bankName || '',
        accountName: accountName || '',
        accountNumber: accountNumber || '',
        status: 'active' // New hotels are active by default
    };
    
    try {
        const url = hotelId ? `/api/admin/hotels/${hotelId}` : '/api/admin/hotels';
        const method = hotelId ? 'PUT' : 'POST';
        
        const response = await authenticatedFetch(url, {
            method,
            body: JSON.stringify({ hotel })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showSuccess(hotelId ? 'แก้ไขโรงแรมสำเร็จ' : 'เพิ่มโรงแรมสำเร็จ');
            closeHotelModal();
            loadHotels();
        } else {
            showError(data.error || 'เกิดข้อผิดพลาด');
        }
    } catch (error) {
        console.error('Error saving hotel:', error);
        showError('เกิดข้อผิดพลาดในการบันทึก');
    }
}

// Edit hotel
function editHotel(hotelId) {
    showHotelForm(hotelId);
}

// Delete hotel
async function deleteHotel(hotelId, hotelName) {
    if (!confirm(`ต้องการลบโรงแรม "${hotelName}" หรือไม่?`)) {
        return;
    }
    
    try {
        const response = await authenticatedFetch(`/api/admin/hotels/${hotelId}`, {
            method: 'DELETE',
            body: JSON.stringify({ hotelName })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showSuccess('ลบโรงแรมสำเร็จ');
            loadHotels();
        } else {
            showError(data.error || 'เกิดข้อผิดพลาด');
        }
    } catch (error) {
        console.error('Error deleting hotel:', error);
        showError('เกิดข้อผิดพลาดในการลบ');
    }
}

// Toggle hotel status (active/inactive)
async function toggleHotelStatus(hotelId, hotelName, currentStatus) {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    const actionText = newStatus === 'active' ? 'เปิด' : 'ปิด';
    
    if (!confirm(`ต้องการ${actionText}โรงแรม "${hotelName}" หรือไม่?`)) {
        return;
    }
    
    try {
        const response = await authenticatedFetch(`/api/admin/hotels/${hotelId}/status`, {
            method: 'PUT',
            body: JSON.stringify({
                status: newStatus
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showSuccess(`${actionText}โรงแรมสำเร็จ`);
            loadHotels(); // Reload to show updated status
        } else {
            showError(data.error || 'เกิดข้อผิดพลาด');
        }
    } catch (error) {
        console.error('Error toggling hotel status:', error);
        showError('เกิดข้อผิดพลาดในการเปลี่ยนสถานะ');
    }
}

// Close modal
function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Show success message
function showSuccess(message) {
    const alert = document.createElement('div');
    alert.className = 'alert alert-success';
    alert.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;
    alert.style.position = 'fixed';
    alert.style.top = '20px';
    alert.style.right = '20px';
    alert.style.zIndex = '10000';
    alert.style.animation = 'slideIn 0.3s';
    
    document.body.appendChild(alert);
    
    setTimeout(() => {
        alert.remove();
    }, 3000);
}

// Show error message
function showError(message) {
    const alert = document.createElement('div');
    alert.className = 'alert alert-error';
    alert.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
    alert.style.position = 'fixed';
    alert.style.top = '20px';
    alert.style.right = '20px';
    alert.style.zIndex = '10000';
    alert.style.animation = 'slideIn 0.3s';
    
    document.body.appendChild(alert);
    
    setTimeout(() => {
        alert.remove();
    }, 3000);
}

// Show temporary password warning (แบบ notification สวยงาม)
function showTempPasswordWarning() {
    // สร้าง notification แบบลอยขึ้นมาแทนจดหมาย
    const notification = document.createElement('div');
    notification.className = 'temp-notification';
    notification.innerHTML = `
        <div class="notification-content">
            <div class="notification-icon">
                <i class="fas fa-exclamation-triangle"></i>
            </div>
            <div class="notification-body">
                <h4>⚠️ กำลังใช้บัญชีชั่วคราว</h4>
                <p>คุณเข้าสู่ระบบด้วยบัญชีทดสอบ <strong>admin</strong></p>
                <small>• สามารถใช้งานฟีเจอร์ทั้งหมดได้<br>• ควรสร้างบัญชีใน Google Sheet เมื่อใช้งานจริง</small>
            </div>
            <button class="notification-close" onclick="this.closest('.temp-notification').remove()">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    // เพิ่ม styles inline
    const styles = `
        <style>
            .temp-notification {
                position: fixed;
                top: 80px;
                right: 20px;
                z-index: 9999;
                animation: slideInRight 0.5s ease-out;
            }
            
            .notification-content {
                background: linear-gradient(135deg, #fff3cd 0%, #ffe4a3 100%);
                border: 2px solid #ffc107;
                border-radius: 12px;
                padding: 20px;
                box-shadow: 0 8px 24px rgba(0,0,0,0.2);
                min-width: 350px;
                max-width: 400px;
                display: flex;
                gap: 15px;
                position: relative;
            }
            
            .notification-icon {
                flex-shrink: 0;
                width: 40px;
                height: 40px;
                background: #ffc107;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                color: #fff;
                font-size: 1.3rem;
            }
            
            .notification-body {
                flex: 1;
            }
            
            .notification-body h4 {
                margin: 0 0 8px 0;
                color: #856404;
                font-size: 1rem;
                font-weight: 600;
            }
            
            .notification-body p {
                margin: 0 0 8px 0;
                color: #856404;
                font-size: 0.9rem;
            }
            
            .notification-body small {
                color: #856404;
                font-size: 0.8rem;
                line-height: 1.5;
            }
            
            .notification-close {
                position: absolute;
                top: 10px;
                right: 10px;
                background: rgba(255,255,255,0.5);
                border: none;
                border-radius: 50%;
                width: 24px;
                height: 24px;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                color: #856404;
                transition: all 0.3s;
            }
            
            .notification-close:hover {
                background: rgba(255,255,255,0.9);
                transform: rotate(90deg);
            }
            
            @keyframes slideInRight {
                from {
                    transform: translateX(120%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            
            @media (max-width: 768px) {
                .temp-notification {
                    right: 10px;
                    left: 10px;
                    top: 70px;
                }
                
                .notification-content {
                    min-width: auto;
                    max-width: none;
                }
            }
        </style>
    `;
    
    // เพิ่ม styles ลง head
    if (!document.getElementById('notification-styles')) {
        const styleElement = document.createElement('div');
        styleElement.id = 'notification-styles';
        styleElement.innerHTML = styles;
        document.head.appendChild(styleElement);
    }
    
    // เพิ่ม notification เข้า body
    document.body.appendChild(notification);
    
    // ปิดอัตโนมัติหลัง 10 วินาที
    setTimeout(() => {
        if (notification.parentElement) {
            notification.style.animation = 'slideInRight 0.5s ease-out reverse';
            setTimeout(() => notification.remove(), 500);
        }
    }, 10000);
}

// Load activity log
async function loadActivityLog() {
    try {
        const response = await fetchWithAuth(`/api/admin/activity-logs?page=1&perPage=1000`);
        const data = await response.json();
        
        console.log('Activity Log Response:', data); // DEBUG
        
        if (data.success) {
            // API returns { success: true, data: { logs: [...], currentPage, totalPages } }
            let logs = data.data.logs || [];
            console.log('Activity Logs Count:', logs.length); // DEBUG
            
            // กรองข้อมูลตาม role
            const userRole = currentUser.role || 'user';
            const username = currentUser.username || '';
            
            if ((userRole === 'hotel_owner' || userRole === 'hotel-owner') && username) {
                // hotel_owner เห็นเฉพาะการแก้ไขของตัวเอง
                logs = logs.filter(log => log.username === username);
                console.log('📝 Filtered activity logs for hotel_owner:', username, 'count:', logs.length);
            }
            
            displayActivityLog(logs);
        } else {
            console.error('API returned error:', data.error);
            const container = document.getElementById('activityList');
            if (container) {
                container.innerHTML = '<div class="no-data">เกิดข้อผิดพลาด: ' + (data.error || 'ไม่สามารถโหลดข้อมูลได้') + '</div>';
            }
        }
    } catch (error) {
        console.error('Error loading activity log:', error);
        const container = document.getElementById('activityList');
        if (container) {
            container.innerHTML = '<div class="no-data">เกิดข้อผิดพลาดในการโหลดข้อมูล</div>';
        }
    }
}

// Display activity log with filters and pagination
function displayActivityLog(logs) {
    const container = document.getElementById('activityList');
    if (!container) return;
    
    if (!logs || logs.length === 0) {
        container.innerHTML = '<p style="text-align: center; padding: 40px; color: #999;">ยังไม่มีประวัติการใช้งาน</p>';
        return;
    }
    
    // Apply filters
    let filteredLogs = logs;
    
    // Filter by type
    if (currentActivityType !== 'all') {
        filteredLogs = filteredLogs.filter(log => {
            const action = log.action.toLowerCase();
            if (currentActivityType === 'hotel') {
                return action.includes('โรงแรม') || action.includes('hotel');
            } else if (currentActivityType === 'amenity') {
                return action.includes('ตัวกรอง') || action.includes('filter') || action.includes('สิ่งอำนวยความสะดวก') || action.includes('amenity');
            } else if (currentActivityType === 'roomtype') {
                return action.includes('ประเภทห้องพัก') || action.includes('room type') || action.includes('roomtype') || action.includes('ห้องพัก');
            }
            return true;
        });
    }
    
    // Filter by action
    if (currentActivityAction !== 'all' && currentActivityAction !== 'latest') {
        filteredLogs = filteredLogs.filter(log => {
            const action = log.action.toLowerCase();
            if (currentActivityAction === 'add') {
                return action.includes('เพิ่ม') || action.includes('add');
            } else if (currentActivityAction === 'edit') {
                return action.includes('แก้ไข') || action.includes('edit') || action.includes('อัพเดท') || action.includes('update');
            } else if (currentActivityAction === 'delete') {
                return action.includes('ลบ') || action.includes('delete');
            }
            return true;
        });
    }
    
    // Filter by search term (hotel name or details)
    if (currentActivitySearch && currentActivitySearch.length > 0) {
        filteredLogs = filteredLogs.filter(log => {
            const hotelName = (log.hotelName || '').toLowerCase();
            const details = (log.details || '').toLowerCase();
            const action = (log.action || '').toLowerCase();
            
            return hotelName.includes(currentActivitySearch) ||
                   details.includes(currentActivitySearch) ||
                   action.includes(currentActivitySearch);
        });
    }
    
    // Show only 10 items per page
    const itemsPerPage = 10;
    const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
    const startIndex = (currentActivityPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedLogs = filteredLogs.slice(startIndex, endIndex);
    
    if (paginatedLogs.length === 0) {
        container.innerHTML = '<p style="text-align: center; padding: 40px; color: #999;">ไม่พบข้อมูลตามเงื่อนไขที่เลือก</p>';
        return;
    }
    
    container.innerHTML = paginatedLogs.map(log => {
        // Determine icon and color based on type and action
        let actionIcon, actionColor, typeBadge, typeColor;
        
        // Type-based styling
        if (log.type) {
            switch(log.type.toLowerCase()) {
                case 'hotel':
                    typeBadge = 'โรงแรม';
                    typeColor = '#667eea';
                    break;
                case 'amenity':
                case 'filter':
                    typeBadge = 'สิ่งอำนวยความสะดวก';
                    typeColor = '#00d2a0';
                    break;
                case 'login':
                    typeBadge = 'การเข้าสู่ระบบ';
                    typeColor = '#3b82f6';
                    break;
                case 'logout':
                    typeBadge = 'ออกจากระบบ';
                    typeColor = '#64748b';
                    break;
                case 'system':
                    typeBadge = 'ระบบ';
                    typeColor = '#8b5cf6';
                    break;
                default:
                    typeBadge = log.type;
                    typeColor = '#667eea';
            }
        }
        
        // Action-based icon and color
        if (log.action.includes('เพิ่ม') || log.action.includes('add')) {
            actionIcon = 'fa-plus-circle';
            actionColor = '#00d2a0';
        } else if (log.action.includes('แก้ไข') || log.action.includes('อัพเดท') || log.action.includes('edit') || log.action.includes('update')) {
            actionIcon = 'fa-edit';
            actionColor = '#f39c12';
        } else if (log.action.includes('ลบ') || log.action.includes('delete')) {
            actionIcon = 'fa-trash-alt';
            actionColor = '#e74c3c';
        } else if (log.action.includes('เข้าสู่ระบบ') || log.action.includes('login')) {
            actionIcon = 'fa-sign-in-alt';
            actionColor = '#3b82f6';
        } else if (log.action.includes('ออกจากระบบ') || log.action.includes('logout')) {
            actionIcon = 'fa-sign-out-alt';
            actionColor = '#64748b';
        } else {
            actionIcon = 'fa-info-circle';
            actionColor = '#667eea';
        }
        
        // Build detailed description
        let detailsHtml = '';
        
        // Primary details from details field
        if (log.details && log.details.trim()) {
            detailsHtml += `<div class="activity-details">${log.details}</div>`;
        }
        
        // Hotel name as additional info
        if (log.hotelName && log.hotelName.trim()) {
            detailsHtml += `<div class="activity-hotel"><i class="fas fa-hotel"></i> <strong>${log.hotelName}</strong></div>`;
        }
        
        // If no details, show a default message
        if (!detailsHtml) {
            detailsHtml = '<div class="activity-details" style="color: #999; font-style: italic;">ไม่มีรายละเอียดเพิ่มเติม</div>';
        }
        
        // Type badge HTML
        const typeBadgeHtml = typeBadge ? 
            `<span class="activity-type-badge" style="background: ${typeColor}20; color: ${typeColor}; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; margin-left: 8px;">
                ${typeBadge}
            </span>` : '';
        
        return `
            <div class="activity-item" style="border-left: 4px solid ${actionColor};">
                <div class="activity-icon" style="background: ${actionColor};">
                    <i class="fas ${actionIcon}"></i>
                </div>
                <div class="activity-info">
                    <h4>
                        ${log.action}
                        ${typeBadgeHtml}
                    </h4>
                    ${detailsHtml}
                    <small style="display: block; margin-top: 8px; color: #999;">
                        <i class="fas fa-user"></i> ${log.nickname} (@${log.username})
                        <span style="margin: 0 8px;">•</span>
                        <i class="fas fa-clock"></i> ${formatThaiDateTime(log.timestamp)}
                    </small>
                </div>
            </div>
        `;
    }).join('');
    
    // Update page info
    const pageInfo = document.getElementById('pageInfo');
    if (pageInfo) {
        pageInfo.textContent = `หน้า ${currentActivityPage} จาก ${totalPages} (${filteredLogs.length} รายการ)`;
    }
    
    // Update button states (hide if at first/last page)
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    
    if (prevBtn) {
        if (currentActivityPage <= 1) {
            prevBtn.style.display = 'none';
        } else {
            prevBtn.style.display = '';
        }
    }
    
    if (nextBtn) {
        if (currentActivityPage >= totalPages) {
            nextBtn.style.display = 'none';
        } else {
            nextBtn.style.display = '';
        }
    }
}

// Load filters
async function loadFilters() {
    try {
        const response = await fetch('/api/filters');
        const data = await response.json();
        
        if (data.success) {
            displayFilters(data.data);
        }
    } catch (error) {
        console.error('Error loading filters:', error);
    }
}

// Display filters with color badges and action buttons
function displayFilters(filters) {
    const container = document.getElementById('filtersList');
    if (!container) return;
    
    if (!filters || filters.length === 0) {
        container.innerHTML = '<p style="text-align: center; padding: 40px; color: #999;">ยังไม่มีสิ่งอำนวยความสะดวก</p>';
        return;
    }
    
    container.innerHTML = filters.map(filter => `
        <div class="filter-card" style="background: white; border-radius: 12px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); display: flex; flex-direction: column; gap: 15px;">
            <div style="display: flex; align-items: center; gap: 12px;">
                <div style="width: 50px; height: 50px; border-radius: 50%; background: ${filter.color || '#667eea'}; display: flex; align-items: center; justify-content: center; color: white; font-size: 1.3rem;">
                    <i class="fas ${filter.icon}"></i>
                </div>
                <div style="flex: 1;">
                    <h3 style="margin: 0; font-size: 1.1rem; color: #2c3e50;">${filter.nameTh}</h3>
                    <p style="margin: 5px 0 0 0; color: #95a5a6; font-size: 0.8rem; font-style: italic;">${filter.nameEn}</p>
                </div>
            </div>
            
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 10px;">
                <span style="padding: 6px 14px; border-radius: 20px; background: ${filter.color || '#667eea'}; color: white; font-size: 0.85rem; white-space: nowrap;">
                    <i class="fas ${filter.icon}"></i> ${filter.nameTh}
                </span>
                <div style="display: flex; gap: 8px;">
                    <button onclick="editFilter('${filter.id}')" class="btn-action" style="padding: 8px 12px; background: #3498db; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 0.85rem;" title="แก้ไข">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="deleteFilterConfirm('${filter.id}', '${filter.nameTh}')" class="btn-action" style="padding: 8px 12px; background: #e74c3c; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 0.85rem;" title="ลบ">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Load filter checkboxes for hotel form with colors
async function loadFilterCheckboxes() {
    try {
        const response = await fetch('/api/filters');
        const data = await response.json();
        
        if (data.success && data.data) {
            const container = document.getElementById('filtersCheckboxes');
            if (!container) return;
            
            if (data.data.length === 0) {
                container.innerHTML = `
                    <div style="grid-column: 1 / -1; text-align: center; padding: 30px; color: #999;">
                        <i class="fas fa-inbox" style="font-size: 3rem; margin-bottom: 10px; opacity: 0.5;"></i>
                        <p style="margin: 0;">ยังไม่มีสิ่งอำนวยความสะดวก</p>
                        <p style="margin: 5px 0 0 0; font-size: 0.9rem;">กรุณาเพิ่มใน "สิ่งอำนวยความสะดวก" ก่อน</p>
                    </div>
                `;
                return;
            }
            
            container.innerHTML = data.data.map(filter => `
                <label style="display: flex; align-items: center; gap: 10px; padding: 12px 15px; border: 2px solid #e0e0e0; border-radius: 10px; cursor: pointer; transition: all 0.3s; background: white; position: relative;" 
                       data-color="${filter.color || '#667eea'}">
                    <input type="checkbox" name="filter_${filter.id}" value="true" 
                           style="display: none;">
                    <span class="custom-checkbox" style="width: 24px; height: 24px; border: 2px solid #ddd; border-radius: 6px; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; background: white; transition: all 0.3s;">
                        <i class="fas fa-check" style="color: white; font-size: 0.85rem; opacity: 0; transition: opacity 0.2s;"></i>
                    </span>
                    <span style="width: 36px; height: 36px; border-radius: 50%; background: ${filter.color || '#667eea'}; display: inline-flex; align-items: center; justify-content: center; color: white; font-size: 1rem; flex-shrink: 0; box-shadow: 0 2px 8px rgba(0,0,0,0.15);">
                        <i class="fas ${filter.icon}"></i>
                    </span>
                    <span style="flex: 1; font-weight: 500; color: #2c3e50; font-size: 0.95rem;">${filter.nameTh}</span>
                </label>
            `).join('');
            
            // Add selected style and hover effects for checkboxes
            container.querySelectorAll('label').forEach(label => {
                const checkbox = label.querySelector('input[type="checkbox"]');
                const customCheckbox = label.querySelector('.custom-checkbox');
                const checkIcon = customCheckbox?.querySelector('.fa-check');
                const color = label.dataset.color || '#667eea';
                
                // Click on label to toggle checkbox
                label.addEventListener('click', function(e) {
                    checkbox.checked = !checkbox.checked;
                    checkbox.dispatchEvent(new Event('change'));
                });
                
                // Hover effects
                label.addEventListener('mouseenter', function() {
                    if (!checkbox.checked) {
                        this.style.borderColor = color;
                        this.style.background = '#f8f9fa';
                    }
                });
                
                label.addEventListener('mouseleave', function() {
                    if (!checkbox.checked) {
                        this.style.borderColor = '#e0e0e0';
                        this.style.background = 'white';
                    }
                });
                
                // Change effect
                checkbox.addEventListener('change', function() {
                    if (this.checked) {
                        label.style.borderColor = color;
                        label.style.background = '#f0f7ff';
                        label.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.2)';
                        if (customCheckbox) {
                            customCheckbox.style.background = color;
                            customCheckbox.style.borderColor = color;
                        }
                        if (checkIcon) checkIcon.style.opacity = '1';
                    } else {
                        label.style.borderColor = '#e0e0e0';
                        label.style.background = 'white';
                        label.style.boxShadow = 'none';
                        if (customCheckbox) {
                            customCheckbox.style.background = 'white';
                            customCheckbox.style.borderColor = '#ddd';
                        }
                        if (checkIcon) checkIcon.style.opacity = '0';
                    }
                });
                
                // Set initial state if already checked
                if (checkbox.checked) {
                    if (customCheckbox) {
                        customCheckbox.style.background = color;
                        customCheckbox.style.borderColor = color;
                    }
                    if (checkIcon) checkIcon.style.opacity = '1';
                }
            });
        }
    } catch (error) {
        console.error('Error loading filter checkboxes:', error);
        const container = document.getElementById('filtersCheckboxes');
        if (container) {
            container.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 20px; color: #e74c3c;">
                    <i class="fas fa-exclamation-triangle"></i> เกิดข้อผิดพลาดในการโหลด
                </div>
            `;
        }
    }
}

// Sort stats by type (likes or clicks)
function sortStats(type) {
    currentSort = type;
    loadLikesStats();
    
    // Update button states for sort type
    document.querySelectorAll('.sort-btn[data-sort]').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.sort === type) {
            btn.classList.add('active');
        }
    });
}

// Sort order (most or least)
function sortOrder(order) {
    currentOrder = order;
    loadLikesStats();
    
    // Update button states for order
    document.querySelectorAll('.sort-btn[data-order]').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.order === order) {
            btn.classList.add('active');
        }
    });
}

// Change stats period (day, week, month, year, all)
function changeStatsPeriod(period) {
    currentStatsPeriod = period;
    updatePeriodButtons('likes', period);
    loadLikesStats();
}

// Filter stats by search term
function filterStatsSearch() {
    currentStatsSearch = document.getElementById('statsSearchInput')?.value.toLowerCase().trim() || '';
    loadLikesStats();
}

// Filter activity by type, action, and search term
function filterActivity() {
    currentActivityType = document.getElementById('activityTypeFilter').value;
    currentActivityAction = document.getElementById('activityActionFilter').value;
    currentActivitySearch = document.getElementById('activitySearchInput')?.value.toLowerCase().trim() || '';
    currentActivityPage = 1; // Reset to page 1 when filter changes
    loadActivityLog();
}

// Activity log pagination
function nextPage() {
    currentActivityPage++;
    loadActivityLog();
}

function prevPage() {
    if (currentActivityPage > 1) {
        currentActivityPage--;
        loadActivityLog();
    }
}

// Open add filter modal
function openAddFilterModal() {
    document.getElementById('filterModalTitle').innerHTML = '<i class="fas fa-plus"></i> เพิ่มสิ่งอำนวยความสะดวก';
    document.getElementById('filterId').value = '';
    document.getElementById('filterEditMode').value = 'false';
    document.getElementById('filterNameTh').value = '';
    document.getElementById('filterNameEn').value = '';
    document.getElementById('filterIcon').value = '';
    document.getElementById('filterColor').value = '#667eea';
    document.getElementById('filterColorText').value = '#667eea';
    updateColorPreview('#667eea', 'fa-tag');
    document.getElementById('filterModal').style.display = 'flex';
}

// Close filter modal
function closeFilterModal() {
    document.getElementById('filterModal').style.display = 'none';
}

// Edit filter
async function editFilter(filterId) {
    try {
        const response = await fetch('/api/filters');
        const data = await response.json();
        
        if (data.success) {
            const filter = data.data.find(f => f.id === filterId);
            if (!filter) {
                showError('ไม่พบข้อมูล');
                return;
            }
            
            document.getElementById('filterModalTitle').innerHTML = '<i class="fas fa-edit"></i> แก้ไขสิ่งอำนวยความสะดวก';
            document.getElementById('filterId').value = filter.id;
            document.getElementById('filterEditMode').value = 'true';
            document.getElementById('filterNameTh').value = filter.nameTh;
            document.getElementById('filterNameEn').value = filter.nameEn;
            document.getElementById('filterIcon').value = filter.icon;
            document.getElementById('filterColor').value = filter.color || '#667eea';
            document.getElementById('filterColorText').value = filter.color || '#667eea';
            updateColorPreview(filter.color || '#667eea', filter.icon);
            document.getElementById('filterModal').style.display = 'flex';
        }
    } catch (error) {
        console.error('Error loading filter:', error);
        showError('เกิดข้อผิดพลาดในการโหลดข้อมูล');
    }
}

// Save filter (Add or Edit)
async function saveFilter(event) {
    event.preventDefault();
    
    const editMode = document.getElementById('filterEditMode').value === 'true';
    const filterId = document.getElementById('filterId').value;
    const nameTh = document.getElementById('filterNameTh').value;
    const nameEn = document.getElementById('filterNameEn').value;
    const icon = document.getElementById('filterIcon').value;
    const color = document.getElementById('filterColorText').value;
    
    // Validate color format
    if (!/^#[0-9A-Fa-f]{6}$/.test(color)) {
        showError('รูปแบบสีไม่ถูกต้อง กรุณาใช้รูปแบบ #RRGGBB');
        return;
    }
    
    const filterData = {
        id: editMode ? filterId : `amenity-${Date.now()}`,
        nameTh,
        nameEn,
        icon,
        color,
        enabled: true
    };
    
    try {
        const url = editMode 
            ? `/api/admin/filters/${filterId}`
            : '/api/admin/filters';
        
        const method = editMode ? 'PUT' : 'POST';
        
        const response = await authenticatedFetch(url, {
            method,
            body: JSON.stringify({ filter: filterData })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showSuccess(editMode ? 'บันทึกการแก้ไขเรียบร้อย' : 'เพิ่มสิ่งอำนวยความสะดวกเรียบร้อย');
            closeFilterModal();
            loadFilters();
        } else {
            showError(data.error || 'เกิดข้อผิดพลาด');
        }
    } catch (error) {
        console.error('Error saving filter:', error);
        showError('เกิดข้อผิดพลาดในการบันทึก');
    }
}

// Delete filter with confirmation
function deleteFilterConfirm(filterId, filterName) {
    if (confirm(`ต้องการลบ "${filterName}" ใช่หรือไม่?`)) {
        deleteFilter(filterId, filterName);
    }
}

// Delete filter
async function deleteFilter(filterId, filterName) {
    try {
        const response = await authenticatedFetch(`/api/admin/filters/${filterId}`, {
            method: 'DELETE',
            body: JSON.stringify({ filterName })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showSuccess('ลบสิ่งอำนวยความสะดวกเรียบร้อย');
            loadFilters();
        } else {
            showError(data.error || 'เกิดข้อผิดพลาด');
        }
    } catch (error) {
        console.error('Error deleting filter:', error);
        showError('เกิดข้อผิดพลาดในการลบ');
    }
}

// Update color preview in modal
function updateColorPreview(color, icon) {
    const preview = document.getElementById('filterColorPreview');
    if (preview) {
        preview.style.background = color;
        preview.innerHTML = `<i class="fas ${icon}"></i> ตัวอย่าง`;
    }
}

// Add event listeners for color inputs (add after DOM loaded)
document.addEventListener('DOMContentLoaded', function() {
    const colorInput = document.getElementById('filterColor');
    const colorTextInput = document.getElementById('filterColorText');
    const iconInput = document.getElementById('filterIcon');
    
    if (colorInput && colorTextInput) {
        colorInput.addEventListener('input', function() {
            colorTextInput.value = this.value;
            const icon = iconInput ? iconInput.value : 'fa-tag';
            updateColorPreview(this.value, icon);
        });
        
        colorTextInput.addEventListener('input', function() {
            if (/^#[0-9A-Fa-f]{6}$/.test(this.value)) {
                colorInput.value = this.value;
                const icon = iconInput ? iconInput.value : 'fa-tag';
                updateColorPreview(this.value, icon);
            }
        });
    }
    
    if (iconInput) {
        iconInput.addEventListener('input', function() {
            const color = colorTextInput ? colorTextInput.value : '#667eea';
            updateColorPreview(color, this.value);
        });
    }
});

// View hotel details (read-only)
async function viewHotelDetails(hotelId) {
    try {
        const response = await fetch('/api/hotels');
        const data = await response.json();
        
        if (data.success && data.data) {
            const hotel = data.data.find(h => h.id === hotelId);
            
            if (!hotel) {
                showError('ไม่พบข้อมูลโรงแรม');
                return;
            }
            
            // Get statistics
            let clicks = 0;
            let likes = 0;
            
            try {
                const clicksRes = await fetch(`/api/hotels/${hotel.id}/clicks`);
                const clicksData = await clicksRes.json();
                clicks = clicksData.clicks || 0;
                
                const likesRes = await fetchWithAuth(`/api/admin/stats?period=year`);
                const likesData = await likesRes.json();
                if (likesData.success && likesData.data.likes && likesData.data.likes.byHotel) {
                    likes = likesData.data.likes.byHotel[hotel.id] || 0;
                }
            } catch (error) {
                console.error('Error loading statistics:', error);
            }
            
            // Format filters
            const filters = hotel.filters ? hotel.filters.split(',').map(f => f.trim()).filter(f => f) : [];
            
            // Format room types - Fetch room type details
            const roomTypeIds = hotel.roomTypes ? hotel.roomTypes.split(',').map(rt => rt.trim()).filter(rt => rt) : [];
            let roomTypesData = [];
            
            if (roomTypeIds.length > 0) {
                try {
                    const rtResponse = await fetch('/api/room-types');
                    const rtResult = await rtResponse.json();
                    if (rtResult.success) {
                        // Map IDs to actual room type objects
                        roomTypesData = roomTypeIds.map(id => {
                            return rtResult.data.find(rt => rt.id === id) || { id, nameTh: id, nameEn: id };
                        });
                    }
                } catch (error) {
                    console.error('Error fetching room types:', error);
                }
            }
            
            // Build compact responsive HTML
            const content = `
                <div style="display: flex; flex-direction: column; gap: 16px;">
                    <!-- Hotel Header -->
                    <div style="text-align: center; padding-bottom: 12px; border-bottom: 2px solid #e9ecef;">
                        <h2 style="margin: 0 0 5px 0; color: var(--primary-color); font-size: 1.5rem;">
                            ${hotel.nameTh || hotel.nameEn || 'ไม่มีชื่อ'}
                        </h2>
                        ${hotel.nameTh && hotel.nameEn ? `<p style="color: var(--gray); margin: 0; font-size: 0.95rem;">${hotel.nameEn}</p>` : ''}
                        <div style="color: var(--gray); font-size: 0.85rem; margin-top: 5px; font-family: monospace;">
                            ID: ${hotel.id}
                        </div>
                    </div>
                    
                    <!-- Image -->
                    <div style="text-align: center;">
                        <img src="${hotel.imageUrl || 'data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%27400%27 height=%27250%27%3E%3Crect fill=%27%23667eea%27 width=%27400%27 height=%27250%27/%3E%3Ctext fill=%27%23fff%27 x=%2750%25%27 y=%2750%25%27 dominant-baseline=%27middle%27 text-anchor=%27middle%27 font-family=%27Arial%27 font-size=%2718%27%3EHotel Preview%3C/text%3E%3C/svg%3E'}" 
                             style="max-width: 100%; height: auto; max-height: 250px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);"
                             onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%27400%27 height=%27250%27%3E%3Crect fill=%27%23667eea%27 width=%27400%27 height=%27250%27/%3E%3Ctext fill=%27%23fff%27 x=%2750%25%27 y=%2750%25%27 dominant-baseline=%27middle%27 text-anchor=%27middle%27 font-family=%27Arial%27 font-size=%2718%27%3EHotel Preview%3C/text%3E%3C/svg%3E'">
                    </div>
                    
                    <!-- Stats -->
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 10px;">
                        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px; border-radius: 8px; text-align: center;">
                            <div style="font-size: 0.8rem; opacity: 0.9;">คลิก</div>
                            <div style="font-size: 1.3rem; font-weight: bold;">${clicks.toLocaleString('th-TH')}</div>
                        </div>
                        <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 12px; border-radius: 8px; text-align: center;">
                            <div style="font-size: 0.8rem; opacity: 0.9;">หัวใจ</div>
                            <div style="font-size: 1.3rem; font-weight: bold;">${likes.toLocaleString('th-TH')}</div>
                        </div>
                    </div>
                    
                    <!-- Info Grid -->
                    <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; display: grid; gap: 10px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; padding-bottom: 8px; border-bottom: 1px solid #dee2e6;">
                            <span style="color: var(--gray); font-size: 0.9rem;"><i class="fas fa-tag"></i> ราคา</span>
                            <strong style="color: var(--primary-color);">${hotel.priceStart ? hotel.priceStart.toLocaleString('th-TH') : '0'} - ${hotel.priceEnd ? hotel.priceEnd.toLocaleString('th-TH') : '0'} ฿</strong>
                        </div>
                        
                        <div style="display: flex; justify-content: space-between; align-items: center; padding-bottom: 8px; border-bottom: 1px solid #dee2e6;">
                            <span style="color: var(--gray); font-size: 0.9rem;"><i class="fas fa-user-tie"></i> เจ้าของ</span>
                            <strong>${hotel.ownerName || '-'}</strong>
                        </div>
                        
                        <div style="display: flex; justify-content: space-between; align-items: center; padding-bottom: 8px; border-bottom: 1px solid #dee2e6;">
                            <span style="color: var(--gray); font-size: 0.9rem;"><i class="fas fa-phone"></i> เบอร์</span>
                            <strong>${hotel.phone || '-'}</strong>
                        </div>
                        
                        ${hotel.maxGuests ? `
                        <div style="display: flex; justify-content: space-between; align-items: center; padding-bottom: 8px; border-bottom: 1px solid #dee2e6;">
                            <span style="color: var(--gray); font-size: 0.9rem;"><i class="fas fa-users"></i> รองรับ</span>
                            <strong>${hotel.maxGuests} คน</strong>
                        </div>
                        ` : ''}
                        
                        ${hotel.lineId ? `
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <span style="color: var(--gray); font-size: 0.9rem;"><i class="fab fa-line"></i> Line</span>
                            <strong>${hotel.lineId}</strong>
                        </div>
                        ` : ''}
                    </div>
                    
                    <!-- Links -->
                    ${hotel.facebookUrl || hotel.websiteUrl ? `
                    <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                        ${hotel.facebookUrl ? `
                        <a href="${hotel.facebookUrl}" target="_blank" style="flex: 1; min-width: 140px; background: #1877f2; color: white; padding: 10px; border-radius: 6px; text-decoration: none; text-align: center; font-size: 0.9rem;">
                            <i class="fab fa-facebook"></i> Facebook
                        </a>
                        ` : ''}
                        ${hotel.websiteUrl ? `
                        <a href="${hotel.websiteUrl}" target="_blank" style="flex: 1; min-width: 140px; background: #28a745; color: white; padding: 10px; border-radius: 6px; text-decoration: none; text-align: center; font-size: 0.9rem;">
                            <i class="fas fa-globe"></i> เว็บไซต์
                        </a>
                        ` : ''}
                    </div>
                    ` : ''}
                    
                    <!-- Filters -->
                    ${filters.length > 0 ? `
                    <div style="background: #fff; padding: 12px; border-radius: 8px; border: 1px solid #e9ecef;">
                        <div style="font-size: 0.9rem; color: var(--gray); margin-bottom: 8px;">
                            <i class="fas fa-check-circle"></i> สิ่งอำนวยความสะดวก
                        </div>
                        <div style="display: flex; flex-wrap: wrap; gap: 6px;">
                            ${filters.map(filter => `
                                <span style="background: var(--primary-color); color: white; padding: 4px 10px; border-radius: 12px; font-size: 0.8rem;">
                                    ${filter}
                                </span>
                            `).join('')}
                        </div>
                    </div>
                    ` : ''}
                    
                    <!-- Room Types -->
                    ${roomTypesData.length > 0 ? `
                    <div style="background: #fff; padding: 12px; border-radius: 8px; border: 1px solid #e9ecef;">
                        <div style="font-size: 0.9rem; color: var(--gray); margin-bottom: 8px;">
                            <i class="fas fa-bed"></i> ประเภทห้องพัก
                        </div>
                        <div style="display: flex; flex-wrap: wrap; gap: 6px;">
                            ${roomTypesData.map(rt => {
                                const bgColor = rt.color || '#667eea';
                                const icon = rt.icon || 'fas fa-bed';
                                return `<span style="background: ${bgColor}; color: white; padding: 4px 10px; border-radius: 12px; font-size: 0.8rem; display: inline-flex; align-items: center; gap: 4px;">
                                    <i class="${icon}"></i> ${rt.nameTh || rt.id}
                                </span>`;
                            }).join('')}
                        </div>
                    </div>
                    ` : ''}
                    
                    <!-- Bank -->
                    ${hotel.bankName || hotel.accountName || hotel.accountNumber ? `
                    <div style="background: #fff3cd; padding: 12px; border-radius: 8px; border-left: 3px solid #ffc107;">
                        <div style="font-size: 0.9rem; color: #856404; margin-bottom: 8px; font-weight: 600;">
                            <i class="fas fa-university"></i> บัญชีธนาคาร
                        </div>
                        <div style="font-size: 0.85rem; color: #333; display: grid; gap: 4px;">
                            ${hotel.bankName ? `<div><strong>ธนาคาร:</strong> ${hotel.bankName}</div>` : ''}
                            ${hotel.accountName ? `<div><strong>ชื่อบัญชี:</strong> ${hotel.accountName}</div>` : ''}
                            ${hotel.accountNumber ? `<div><strong>เลขที่:</strong> <span style="font-family: monospace;">${hotel.accountNumber}</span></div>` : ''}
                        </div>
                    </div>
                    ` : ''}
                    
                    <!-- Footer -->
                    <div style="background: #f8f9fa; padding: 10px; border-radius: 6px; font-size: 0.8rem; color: var(--gray); text-align: center;">
                        ${hotel.modifiedBy ? `แก้ไขล่าสุดโดย <strong>${hotel.modifiedBy}</strong>` : ''}
                        ${hotel.lastModified ? ` • ${hotel.lastModified}` : ''}
                    </div>
                </div>
            `;
            
            document.getElementById('hotelDetailsContent').innerHTML = content;
            document.getElementById('hotelDetailsModal').style.display = 'flex';
        }
    } catch (error) {
        console.error('Error loading hotel details:', error);
        showError('เกิดข้อผิดพลาดในการโหลดข้อมูล');
    }
}

// Close hotel details modal
function closeHotelDetailsModal() {
    document.getElementById('hotelDetailsModal').style.display = 'none';
}

// ==================== Room Types Management ====================

// Load room types
async function loadRoomTypes() {
    try {
        const response = await fetch('/api/room-types');
        const data = await response.json();
        
        if (data.success) {
            displayRoomTypes(data.data);
        }
    } catch (error) {
        console.error('Error loading room types:', error);
    }
}

// Display room types with color badges and action buttons
function displayRoomTypes(roomTypes) {
    const container = document.getElementById('roomTypesList');
    if (!container) return;
    
    if (!roomTypes || roomTypes.length === 0) {
        container.innerHTML = '<p style="text-align: center; padding: 40px; color: #999;">ยังไม่มีประเภทห้องพัก</p>';
        return;
    }
    
    container.innerHTML = roomTypes.map(roomType => `
        <div class="filter-card" style="background: white; border-radius: 12px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); display: flex; flex-direction: column; gap: 15px;">
            <div style="display: flex; align-items: center; gap: 12px;">
                <div style="width: 50px; height: 50px; border-radius: 50%; background: ${roomType.color || '#667eea'}; display: flex; align-items: center; justify-content: center; color: white; font-size: 1.3rem;">
                    <i class="fas ${roomType.icon}"></i>
                </div>
                <div style="flex: 1;">
                    <h3 style="margin: 0; font-size: 1.1rem; color: #2c3e50;">${roomType.nameTh}</h3>
                    <p style="margin: 5px 0 0 0; color: #95a5a6; font-size: 0.8rem; font-style: italic;">${roomType.nameEn}</p>
                </div>
            </div>
            
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 10px;">
                <span style="padding: 6px 14px; border-radius: 20px; background: ${roomType.color || '#667eea'}; color: white; font-size: 0.85rem; white-space: nowrap;">
                    <i class="fas ${roomType.icon}"></i> ${roomType.nameTh}
                </span>
                <div style="display: flex; gap: 8px;">
                    <button onclick="editRoomType('${roomType.id}')" class="btn-action" style="padding: 8px 12px; background: #3498db; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 0.85rem;" title="แก้ไข">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="deleteRoomTypeConfirm('${roomType.id}', '${roomType.nameTh}')" class="btn-action" style="padding: 8px 12px; background: #e74c3c; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 0.85rem;" title="ลบ">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Load room type checkboxes for hotel form with colors
async function loadRoomTypeCheckboxes() {
    try {
        const response = await fetch('/api/room-types');
        const data = await response.json();
        
        if (data.success && data.data) {
            const container = document.getElementById('roomTypesCheckboxes');
            if (!container) return;
            
            if (data.data.length === 0) {
                container.innerHTML = `
                    <div style="grid-column: 1 / -1; text-align: center; padding: 30px; color: #999;">
                        <i class="fas fa-inbox" style="font-size: 3rem; margin-bottom: 10px; opacity: 0.5;"></i>
                        <p style="margin: 0;">ยังไม่มีประเภทห้องพัก</p>
                        <p style="margin: 5px 0 0 0; font-size: 0.9rem;">กรุณาเพิ่มใน "ประเภทห้องพัก" ก่อน</p>
                    </div>
                `;
                return;
            }
            
            container.innerHTML = data.data.map(roomType => `
                <label style="display: flex; align-items: center; gap: 10px; padding: 12px 15px; border: 2px solid #e0e0e0; border-radius: 10px; cursor: pointer; transition: all 0.3s; background: white; position: relative;" 
                       data-color="${roomType.color || '#667eea'}">
                    <input type="checkbox" name="roomtype_${roomType.id}" value="${roomType.id}" 
                           style="display: none;">
                    <span class="custom-checkbox" style="width: 24px; height: 24px; border: 2px solid #ddd; border-radius: 6px; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; background: white; transition: all 0.3s;">
                        <i class="fas fa-check" style="color: white; font-size: 0.85rem; opacity: 0; transition: opacity 0.2s;"></i>
                    </span>
                    <span style="width: 36px; height: 36px; border-radius: 50%; background: ${roomType.color || '#667eea'}; display: inline-flex; align-items: center; justify-content: center; color: white; font-size: 1rem; flex-shrink: 0; box-shadow: 0 2px 8px rgba(0,0,0,0.15);">
                        <i class="fas ${roomType.icon}"></i>
                    </span>
                    <span style="flex: 1; font-weight: 500; color: #2c3e50; font-size: 0.95rem;">${roomType.nameTh}</span>
                </label>
            `).join('');
            
            // Add selected style and hover effects for checkboxes
            container.querySelectorAll('label').forEach(label => {
                const checkbox = label.querySelector('input[type="checkbox"]');
                const customCheckbox = label.querySelector('.custom-checkbox');
                const checkIcon = customCheckbox?.querySelector('.fa-check');
                const color = label.dataset.color || '#667eea';
                
                // Click on label to toggle checkbox
                label.addEventListener('click', function(e) {
                    checkbox.checked = !checkbox.checked;
                    checkbox.dispatchEvent(new Event('change'));
                });
                
                // Hover effects
                label.addEventListener('mouseenter', function() {
                    if (!checkbox.checked) {
                        this.style.borderColor = color;
                        this.style.background = '#f8f9fa';
                    }
                });
                
                label.addEventListener('mouseleave', function() {
                    if (!checkbox.checked) {
                        this.style.borderColor = '#e0e0e0';
                        this.style.background = 'white';
                    }
                });
                
                // Change effect
                checkbox.addEventListener('change', function() {
                    if (this.checked) {
                        label.style.borderColor = color;
                        label.style.background = '#f0f7ff';
                        label.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.2)';
                        if (customCheckbox) {
                            customCheckbox.style.background = color;
                            customCheckbox.style.borderColor = color;
                        }
                        if (checkIcon) checkIcon.style.opacity = '1';
                    } else {
                        label.style.borderColor = '#e0e0e0';
                        label.style.background = 'white';
                        label.style.boxShadow = 'none';
                        if (customCheckbox) {
                            customCheckbox.style.background = 'white';
                            customCheckbox.style.borderColor = '#ddd';
                        }
                        if (checkIcon) checkIcon.style.opacity = '0';
                    }
                });
                
                // Set initial state if already checked
                if (checkbox.checked) {
                    if (customCheckbox) {
                        customCheckbox.style.background = color;
                        customCheckbox.style.borderColor = color;
                    }
                    if (checkIcon) checkIcon.style.opacity = '1';
                }
            });
        }
    } catch (error) {
        console.error('Error loading room type checkboxes:', error);
        const container = document.getElementById('roomTypesCheckboxes');
        if (container) {
            container.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 20px; color: #e74c3c;">
                    <i class="fas fa-exclamation-triangle"></i> เกิดข้อผิดพลาดในการโหลด
                </div>
            `;
        }
    }
}

// Open add room type modal
function openAddRoomTypeModal() {
    document.getElementById('roomTypeModalTitle').innerHTML = '<i class="fas fa-plus"></i> เพิ่มประเภทห้องพัก';
    document.getElementById('roomTypeId').value = '';
    document.getElementById('roomTypeEditMode').value = 'false';
    document.getElementById('roomTypeNameTh').value = '';
    document.getElementById('roomTypeNameEn').value = '';
    document.getElementById('roomTypeIcon').value = '';
    document.getElementById('roomTypeColor').value = '#667eea';
    document.getElementById('roomTypeColorText').value = '#667eea';
    updateRoomTypeColorPreview('#667eea', 'fa-bed');
    document.getElementById('roomTypeModal').style.display = 'flex';
}

// Close room type modal
function closeRoomTypeModal() {
    document.getElementById('roomTypeModal').style.display = 'none';
}

// Edit room type
async function editRoomType(roomTypeId) {
    try {
        const response = await fetch('/api/room-types');
        const data = await response.json();
        
        if (data.success) {
            const roomType = data.data.find(rt => rt.id === roomTypeId);
            if (!roomType) {
                showError('ไม่พบข้อมูล');
                return;
            }
            
            document.getElementById('roomTypeModalTitle').innerHTML = '<i class="fas fa-edit"></i> แก้ไขประเภทห้องพัก';
            document.getElementById('roomTypeId').value = roomType.id;
            document.getElementById('roomTypeEditMode').value = 'true';
            document.getElementById('roomTypeNameTh').value = roomType.nameTh;
            document.getElementById('roomTypeNameEn').value = roomType.nameEn;
            document.getElementById('roomTypeIcon').value = roomType.icon;
            document.getElementById('roomTypeColor').value = roomType.color || '#667eea';
            document.getElementById('roomTypeColorText').value = roomType.color || '#667eea';
            updateRoomTypeColorPreview(roomType.color || '#667eea', roomType.icon);
            document.getElementById('roomTypeModal').style.display = 'flex';
        }
    } catch (error) {
        console.error('Error loading room type:', error);
        showError('เกิดข้อผิดพลาดในการโหลดข้อมูล');
    }
}

// Save room type (Add or Edit)
async function saveRoomType(event) {
    event.preventDefault();
    
    const editMode = document.getElementById('roomTypeEditMode').value === 'true';
    const roomTypeId = document.getElementById('roomTypeId').value;
    const nameTh = document.getElementById('roomTypeNameTh').value;
    const nameEn = document.getElementById('roomTypeNameEn').value;
    const icon = document.getElementById('roomTypeIcon').value;
    const color = document.getElementById('roomTypeColorText').value;
    
    const roomType = {
        nameTh,
        nameEn,
        icon,
        color
    };
    
    try {
        let response;
        if (editMode) {
            // Update existing
            response = await authenticatedFetch(`/api/admin/room-types/${roomTypeId}`, {
                method: 'PUT',
                body: JSON.stringify({ roomType })
            });
        } else {
            // Add new
            response = await authenticatedFetch('/api/admin/room-types', {
                method: 'POST',
                body: JSON.stringify({ roomType })
            });
        }
        
        const data = await response.json();
        
        if (data.success) {
            showSuccess(editMode ? 'แก้ไขประเภทห้องพักเรียบร้อย' : 'เพิ่มประเภทห้องพักเรียบร้อย');
            closeRoomTypeModal();
            loadRoomTypes();
        } else {
            showError(data.error || 'เกิดข้อผิดพลาด');
        }
    } catch (error) {
        console.error('Error saving room type:', error);
        showError('เกิดข้อผิดพลาดในการบันทึก');
    }
}

// Delete room type with confirmation
function deleteRoomTypeConfirm(roomTypeId, roomTypeName) {
    if (confirm(`ต้องการลบ "${roomTypeName}" ใช่หรือไม่?`)) {
        deleteRoomType(roomTypeId, roomTypeName);
    }
}

// Delete room type
async function deleteRoomType(roomTypeId, roomTypeName) {
    try {
        const response = await authenticatedFetch(`/api/admin/room-types/${roomTypeId}`, {
            method: 'DELETE',
            body: JSON.stringify({ roomTypeName })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showSuccess('ลบประเภทห้องพักเรียบร้อย');
            loadRoomTypes();
        } else {
            showError(data.error || 'เกิดข้อผิดพลาดในการลบ');
        }
    } catch (error) {
        console.error('Error deleting room type:', error);
        showError('เกิดข้อผิดพลาดในการลบ');
    }
}

// Toggle mobile details for hotel row
function toggleMobileDetails(hotelId) {
    const detailsDiv = document.getElementById(`details-${hotelId}`);
    const chevron = document.querySelector(`[onclick*="toggleMobileDetails('${hotelId}')"] .mobile-chevron`);
    
    if (detailsDiv) {
        // Toggle the 'show' class instead of inline style
        const isCurrentlyVisible = detailsDiv.classList.contains('show');
        
        if (isCurrentlyVisible) {
            detailsDiv.classList.remove('show');
        } else {
            detailsDiv.classList.add('show');
        }
        
        // Rotate chevron
        if (chevron) {
            chevron.style.transform = isCurrentlyVisible ? 'rotate(0deg)' : 'rotate(180deg)';
        }
    }
}

// Update room type color preview in modal
function updateRoomTypeColorPreview(color, icon) {
    const preview = document.getElementById('roomTypeColorPreview');
    if (preview) {
        preview.style.background = color;
        preview.innerHTML = `<i class="fas ${icon}"></i> ตัวอย่าง`;
    }
}

// Add event listeners for room type color inputs (add after DOM loaded)
document.addEventListener('DOMContentLoaded', function() {
    const roomTypeColorInput = document.getElementById('roomTypeColor');
    const roomTypeColorTextInput = document.getElementById('roomTypeColorText');
    const roomTypeIconInput = document.getElementById('roomTypeIcon');
    
    if (roomTypeColorInput && roomTypeColorTextInput) {
        roomTypeColorInput.addEventListener('input', function() {
            roomTypeColorTextInput.value = this.value;
            const icon = roomTypeIconInput ? roomTypeIconInput.value : 'fa-bed';
            updateRoomTypeColorPreview(this.value, icon);
        });
        
        roomTypeColorTextInput.addEventListener('input', function() {
            if (/^#[0-9A-Fa-f]{6}$/.test(this.value)) {
                roomTypeColorInput.value = this.value;
                const icon = roomTypeIconInput ? roomTypeIconInput.value : 'fa-bed';
                updateRoomTypeColorPreview(this.value, icon);
            }
        });
    }
    
    if (roomTypeIconInput) {
        roomTypeIconInput.addEventListener('input', function() {
            const color = roomTypeColorTextInput ? roomTypeColorTextInput.value : '#667eea';
            updateRoomTypeColorPreview(color, this.value);
        });
    }
    
    // Add event listeners for image URL inputs (for preview)
    for (let i = 1; i <= 5; i++) {
        const urlInput = document.getElementById(i === 1 ? 'imageUrl' : `imageUrl${i}`);
        if (urlInput) {
            urlInput.addEventListener('blur', function() {
                const url = this.value.trim();
                if (url) {
                    previewImageUrl(url, i);
                }
            });
        }
    }
});

// ==================== ACCOMMODATION TYPES MANAGEMENT ====================

// Load accommodation types
async function loadAccommodationTypes() {
    console.log('🏢 Loading accommodation types...');
    try {
        const response = await fetch('/api/accommodation-types');
        const data = await response.json();
        
        console.log('📦 Accommodation types data:', data);
        
        if (data.success) {
            displayAccommodationTypes(data.data || []);
        } else {
            console.log('⚠️ No success in response, showing empty');
            displayAccommodationTypes([]);
        }
    } catch (error) {
        console.error('❌ Error loading accommodation types:', error);
        displayAccommodationTypes([]);
    }
}

// Display accommodation types
function displayAccommodationTypes(accommodationTypes) {
    console.log('🎨 Displaying accommodation types:', accommodationTypes);
    const container = document.getElementById('accommodationTypesList');
    if (!container) return;
    
    if (!accommodationTypes || accommodationTypes.length === 0) {
        container.innerHTML = '<p style="text-align: center; padding: 40px; color: #999;">ยังไม่มีประเภทที่พัก</p>';
        return;
    }
    
    container.innerHTML = accommodationTypes.map(type => `
        <div class="filter-card" style="background: white; border-radius: 12px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); display: flex; flex-direction: column; gap: 15px;">
            <div style="display: flex; align-items: center; gap: 12px;">
                <div style="width: 50px; height: 50px; border-radius: 50%; background: ${type.color || '#667eea'}; display: flex; align-items: center; justify-content: center; color: white; font-size: 1.3rem;">
                    <i class="fas ${type.icon}"></i>
                </div>
                <div style="flex: 1;">
                    <h3 style="margin: 0; font-size: 1.1rem; color: #2c3e50;">${type.nameTh}</h3>
                    <p style="margin: 5px 0 0 0; color: #95a5a6; font-size: 0.8rem; font-style: italic;">${type.nameEn}</p>
                </div>
            </div>
            
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 10px;">
                <span style="padding: 6px 14px; border-radius: 20px; background: ${type.color || '#667eea'}; color: white; font-size: 0.85rem; white-space: nowrap;">
                    <i class="fas ${type.icon}"></i> ${type.nameTh}
                </span>
                <div style="display: flex; gap: 8px;">
                    <button onclick="editAccommodationType('${type.id}')" class="btn-action" style="padding: 8px 12px; background: #3498db; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 0.85rem;" title="แก้ไข">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="deleteAccommodationType('${type.id}', '${type.nameTh}')" class="btn-action" style="padding: 8px 12px; background: #e74c3c; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 0.85rem;" title="ลบ">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Open add accommodation type modal
function openAddAccommodationTypeModal() {
    document.getElementById('accommodationTypeModalTitle').innerHTML = '<i class="fas fa-building"></i> เพิ่มประเภทที่พัก';
    document.getElementById('accommodationTypeId').value = '';
    document.getElementById('accommodationTypeEditMode').value = 'false';
    document.getElementById('accommodationTypeNameTh').value = '';
    document.getElementById('accommodationTypeNameEn').value = '';
    document.getElementById('accommodationTypeIcon').value = '';
    document.getElementById('accommodationTypeColor').value = '#667eea';
    document.getElementById('accommodationTypeColorText').value = '#667eea';
    updateAccommodationTypeColorPreview('#667eea', 'fa-hotel');
    document.getElementById('accommodationTypeModal').style.display = 'flex';
}

// Close accommodation type modal
function closeAccommodationTypeModal() {
    document.getElementById('accommodationTypeModal').style.display = 'none';
}

// Edit accommodation type
async function editAccommodationType(typeId) {
    try {
        const response = await fetch('/api/accommodation-types');
        const data = await response.json();
        
        if (data.success) {
            const type = data.data.find(t => t.id === typeId);
            if (!type) {
                showError('ไม่พบข้อมูล');
                return;
            }
            
            document.getElementById('accommodationTypeModalTitle').innerHTML = '<i class="fas fa-edit"></i> แก้ไขประเภทที่พัก';
            document.getElementById('accommodationTypeId').value = type.id;
            document.getElementById('accommodationTypeEditMode').value = 'true';
            document.getElementById('accommodationTypeNameTh').value = type.nameTh;
            document.getElementById('accommodationTypeNameEn').value = type.nameEn;
            document.getElementById('accommodationTypeIcon').value = type.icon;
            document.getElementById('accommodationTypeColor').value = type.color || '#667eea';
            document.getElementById('accommodationTypeColorText').value = type.color || '#667eea';
            updateAccommodationTypeColorPreview(type.color || '#667eea', type.icon);
            document.getElementById('accommodationTypeModal').style.display = 'flex';
        }
    } catch (error) {
        console.error('Error loading accommodation type:', error);
        showError('เกิดข้อผิดพลาดในการโหลดข้อมูล');
    }
}

// Save accommodation type
async function saveAccommodationType(event) {
    event.preventDefault();
    
    const editMode = document.getElementById('accommodationTypeEditMode').value === 'true';
    const typeId = document.getElementById('accommodationTypeId').value;
    const nameTh = document.getElementById('accommodationTypeNameTh').value.trim();
    const nameEn = document.getElementById('accommodationTypeNameEn').value.trim();
    const icon = document.getElementById('accommodationTypeIcon').value.trim();
    const color = document.getElementById('accommodationTypeColor').value;
    
    if (!nameTh || !nameEn || !icon) {
        showError('กรุณากรอกข้อมูลให้ครบถ้วน');
        return;
    }
    
    const accommodationType = {
        id: editMode ? typeId : `type-${Date.now()}`,
        nameTh,
        nameEn,
        icon,
        color
    };
    
    try {
        const url = editMode 
            ? `/api/admin/accommodation-types/${typeId}`
            : '/api/admin/accommodation-types';
        
        const method = editMode ? 'PUT' : 'POST';
        
        const response = await authenticatedFetch(url, {
            method,
            body: JSON.stringify({ accommodationType })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showSuccess(editMode ? 'แก้ไขประเภทที่พักเรียบร้อย' : 'เพิ่มประเภทที่พักเรียบร้อย');
            closeAccommodationTypeModal();
            loadAccommodationTypes();
        } else {
            showError(data.error || 'เกิดข้อผิดพลาด');
        }
    } catch (error) {
        console.error('Error saving accommodation type:', error);
        showError('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    }
}

// Delete accommodation type
async function deleteAccommodationType(typeId, typeName) {
    if (!confirm(`คุณแน่ใจหรือไม่ที่จะลบประเภทที่พัก "${typeName}"?`)) {
        return;
    }
    
    try {
        const response = await authenticatedFetch(`/api/admin/accommodation-types/${typeId}`, {
            method: 'DELETE',
            body: JSON.stringify({ accommodationTypeName: typeName })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showSuccess('ลบประเภทที่พักเรียบร้อย');
            loadAccommodationTypes();
        } else {
            showError(data.error || 'เกิดข้อผิดพลาดในการลบ');
        }
    } catch (error) {
        console.error('Error deleting accommodation type:', error);
        showError('เกิดข้อผิดพลาดในการลบประเภทที่พัก');
    }
}

// Update accommodation type color preview
function updateAccommodationTypeColorPreview(color, icon) {
    const preview = document.getElementById('accommodationTypeColorPreview');
    if (preview) {
        preview.style.background = color;
        const iconElement = preview.querySelector('i');
        if (iconElement && icon) {
            iconElement.className = `fas ${icon}`;
        }
    }
}

// Load accommodation type radio buttons for hotel form (เลือกได้แค่ 1 รายการ)
async function loadAccommodationTypeCheckboxes() {
    try {
        const response = await fetch('/api/accommodation-types');
        const data = await response.json();
        
        if (data.success && data.data) {
            const container = document.getElementById('accommodationTypesRadios');
            if (!container) return;
            
            if (data.data.length === 0) {
                container.innerHTML = `
                    <div style="grid-column: 1 / -1; text-align: center; padding: 30px; color: #999;">
                        <i class="fas fa-inbox" style="font-size: 3rem; margin-bottom: 10px; opacity: 0.5;"></i>
                        <p style="margin: 0;">ยังไม่มีประเภทที่พัก</p>
                        <p style="margin: 5px 0 0 0; font-size: 0.9rem;">กรุณาเพิ่มใน "ประเภทที่พัก" ก่อน</p>
                    </div>
                `;
                return;
            }
            
            container.innerHTML = data.data.map(type => `
                <label style="display: flex; align-items: center; gap: 10px; padding: 12px 15px; border: 2px solid #e0e0e0; border-radius: 10px; cursor: pointer; transition: all 0.3s; background: white; position: relative;" 
                       data-color="${type.color || '#667eea'}">
                    <input type="radio" name="accommodationType" value="${type.id}" 
                           style="display: none;">
                    <span class="custom-radio" style="width: 24px; height: 24px; border: 2px solid #ddd; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; background: white; transition: all 0.3s;">
                        <span style="width: 12px; height: 12px; border-radius: 50%; background: white; opacity: 0; transition: opacity 0.2s;"></span>
                    </span>
                    <span style="width: 36px; height: 36px; border-radius: 50%; background: ${type.color || '#667eea'}; display: inline-flex; align-items: center; justify-content: center; color: white; font-size: 1rem; flex-shrink: 0; box-shadow: 0 2px 8px rgba(0,0,0,0.15);">
                        <i class="fas ${type.icon}"></i>
                    </span>
                    <span style="flex: 1; font-weight: 500; color: #2c3e50; font-size: 0.95rem;">${type.nameTh}</span>
                </label>
            `).join('');
            
            // Add selected style and hover effects for radio buttons
            container.querySelectorAll('label').forEach(label => {
                const radio = label.querySelector('input[type="radio"]');
                const customRadio = label.querySelector('.custom-radio');
                const radioCircle = customRadio?.querySelector('span');
                const color = label.dataset.color || '#667eea';
                
                // Click on label to select radio
                label.addEventListener('click', function(e) {
                    radio.checked = true;
                    radio.dispatchEvent(new Event('change'));
                });
                
                // Hover effects
                label.addEventListener('mouseenter', function() {
                    if (!radio.checked) {
                        this.style.borderColor = color;
                        this.style.background = '#f8f9fa';
                    }
                });
                
                label.addEventListener('mouseleave', function() {
                    if (!radio.checked) {
                        this.style.borderColor = '#e0e0e0';
                        this.style.background = 'white';
                    }
                });
                
                // Change effect - รีเซ็ต radio อื่นๆ ให้เป็น unchecked style
                radio.addEventListener('change', function() {
                    // รีเซ็ต radio ทั้งหมด
                    container.querySelectorAll('label').forEach(otherLabel => {
                        const otherRadio = otherLabel.querySelector('input[type="radio"]');
                        const otherCustomRadio = otherLabel.querySelector('.custom-radio');
                        const otherRadioCircle = otherCustomRadio?.querySelector('span');
                        
                        if (otherRadio !== radio) {
                            otherLabel.style.borderColor = '#e0e0e0';
                            otherLabel.style.background = 'white';
                            otherLabel.style.boxShadow = 'none';
                            if (otherCustomRadio) {
                                otherCustomRadio.style.background = 'white';
                                otherCustomRadio.style.borderColor = '#ddd';
                            }
                            if (otherRadioCircle) otherRadioCircle.style.opacity = '0';
                        }
                    });
                    
                    // เซ็ต radio ที่เลือก
                    if (this.checked) {
                        label.style.borderColor = color;
                        label.style.background = '#f0f7ff';
                        label.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.2)';
                        if (customRadio) {
                            customRadio.style.background = 'white';
                            customRadio.style.borderColor = color;
                        }
                        if (radioCircle) {
                            radioCircle.style.opacity = '1';
                            radioCircle.style.background = color;
                        }
                    }
                });
                
                // Set initial state if already checked
                if (radio.checked) {
                    label.style.borderColor = color;
                    label.style.background = '#f0f7ff';
                    label.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.2)';
                    if (customRadio) {
                        customRadio.style.background = 'white';
                        customRadio.style.borderColor = color;
                    }
                    if (radioCircle) {
                        radioCircle.style.opacity = '1';
                        radioCircle.style.background = color;
                    }
                }
            });
        }
    } catch (error) {
        console.error('Error loading accommodation type radios:', error);
        const container = document.getElementById('accommodationTypesRadios');
        if (container) {
            container.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 20px; color: #e74c3c;">
                    <i class="fas fa-exclamation-triangle"></i> เกิดข้อผิดพลาดในการโหลด
                </div>
            `;
        }
    }
}

// Add event listeners for accommodation type color picker
document.addEventListener('DOMContentLoaded', function() {
    // Color picker sync
    const colorInput = document.getElementById('accommodationTypeColor');
    const colorTextInput = document.getElementById('accommodationTypeColorText');
    const iconInput = document.getElementById('accommodationTypeIcon');
    
    if (colorInput && colorTextInput) {
        colorInput.addEventListener('input', function() {
            colorTextInput.value = this.value;
            const icon = iconInput?.value || 'fa-hotel';
            updateAccommodationTypeColorPreview(this.value, icon);
        });
        
        
        colorTextInput.addEventListener('input', function() {
            if (/^#[0-9A-Fa-f]{6}$/.test(this.value)) {
                colorInput.value = this.value;
                const icon = iconInput?.value || 'fa-hotel';
                updateAccommodationTypeColorPreview(this.value, icon);
            }
        });
    }
    
    if (iconInput) {
        iconInput.addEventListener('input', function() {
            const color = colorInput?.value || '#667eea';
            updateAccommodationTypeColorPreview(color, this.value);
        });
    }
});

// ==================== WEBSETTINGS MANAGEMENT ====================

let currentWebSettings = {};

// Toggle favicon input based on type
function toggleFaviconInput() {
    const faviconType = document.getElementById('faviconType').value;
    const emojiGroup = document.getElementById('emojiGroup');
    const urlGroup = document.getElementById('urlGroup');
    
    if (faviconType === 'emoji') {
        emojiGroup.style.display = 'block';
        urlGroup.style.display = 'none';
    } else {
        emojiGroup.style.display = 'none';
        urlGroup.style.display = 'block';
    }
    
    previewChanges();
}

// Load web settings
async function loadWebSettings() {
    console.log('🎨 Loading web settings...');
    try {
        const response = await authenticatedFetch('/api/websettings');
        const settings = await response.json();
        
        currentWebSettings = settings;
        
        // Populate form fields
        document.getElementById('siteNameTh').value = settings.site_name_th || '';
        document.getElementById('siteNameEn').value = settings.site_name_en || '';
        
        // Site name colors
        document.getElementById('siteNameThColor').value = settings.site_name_th_color || '#2d3436';
        document.getElementById('siteNameThColorText').value = settings.site_name_th_color || '#2d3436';
        document.getElementById('siteNameEnColor').value = settings.site_name_en_color || '#636e72';
        document.getElementById('siteNameEnColorText').value = settings.site_name_en_color || '#636e72';
        
        // Header color
        document.getElementById('headerBgColor').value = settings.header_bg_color || '#ffffff';
        document.getElementById('headerBgColorText').value = settings.header_bg_color || '#ffffff';
        
        // Body gradient
        document.getElementById('bodyBgStart').value = settings.body_bg_gradient_start || '#667eea';
        document.getElementById('bodyBgStartText').value = settings.body_bg_gradient_start || '#667eea';
        document.getElementById('bodyBgEnd').value = settings.body_bg_gradient_end || '#764ba2';
        document.getElementById('bodyBgEndText').value = settings.body_bg_gradient_end || '#764ba2';
        
        // Filter button gradient
        document.getElementById('filterBtnStart').value = settings.filter_button_bg_start || '#667eea';
        document.getElementById('filterBtnStartText').value = settings.filter_button_bg_start || '#667eea';
        document.getElementById('filterBtnEnd').value = settings.filter_button_bg_end || '#764ba2';
        document.getElementById('filterBtnEndText').value = settings.filter_button_bg_end || '#764ba2';
        
        // Card colors
        document.getElementById('cardNameColor').value = settings.card_hotel_name_color || '#2d3436';
        document.getElementById('cardNameColorText').value = settings.card_hotel_name_color || '#2d3436';
        document.getElementById('cardPriceColor').value = settings.card_price_color || '#0066cc';
        document.getElementById('cardPriceColorText').value = settings.card_price_color || '#0066cc';
        
        // Favicon settings
        const faviconType = settings.favicon_type || 'emoji';
        document.getElementById('faviconType').value = faviconType;
        document.getElementById('faviconEmoji').value = settings.favicon_emoji || '🏝️';
        document.getElementById('faviconUrl').value = settings.favicon_url || '';
        toggleFaviconInput();
        
        // Update preview
        previewChanges();
        
        console.log('✅ Web settings loaded');
    } catch (error) {
        console.error('❌ Error loading web settings:', error);
        showNotification('ไม่สามารถโหลดการตั้งค่าได้', 'error');
    }
}

// Sync color picker with text input
function syncColorPicker(pickerId, hexValue) {
    if (/^#[0-9A-F]{6}$/i.test(hexValue)) {
        document.getElementById(pickerId).value = hexValue;
    }
}

// Preview changes in real-time
function previewChanges() {
    // Site names
    const siteNameTh = document.getElementById('siteNameTh').value;
    const siteNameEn = document.getElementById('siteNameEn').value;
    const previewTitleElement = document.getElementById('previewSiteNameTh');
    if (previewTitleElement) {
        previewTitleElement.textContent = siteNameTh || 'ค้นหาโรงแรมเกาะล้าน';
    }
    document.getElementById('previewSiteNameEn').textContent = siteNameEn || 'Koh Larn Hotel Search Engine';
    
    // Update header icon in preview
    const faviconEmoji = document.getElementById('faviconEmoji').value;
    const previewHeaderIcon = document.getElementById('previewHeaderIcon');
    if (previewHeaderIcon && faviconEmoji) {
        previewHeaderIcon.textContent = faviconEmoji;
    }
    
    // Site name colors
    const siteNameThColor = document.getElementById('siteNameThColor').value;
    const siteNameEnColor = document.getElementById('siteNameEnColor').value;
    document.getElementById('siteNameThColorText').value = siteNameThColor;
    document.getElementById('siteNameEnColorText').value = siteNameEnColor;
    document.getElementById('previewSiteNameTh').style.color = siteNameThColor;
    document.getElementById('previewSiteNameEn').style.color = siteNameEnColor;
    
    // Header background
    const headerBg = document.getElementById('headerBgColor').value;
    document.getElementById('headerBgColorText').value = headerBg;
    document.getElementById('previewHeader').style.background = headerBg;
    
    // Body gradient
    const bodyStart = document.getElementById('bodyBgStart').value;
    const bodyEnd = document.getElementById('bodyBgEnd').value;
    document.getElementById('bodyBgStartText').value = bodyStart;
    document.getElementById('bodyBgEndText').value = bodyEnd;
    document.getElementById('previewBody').style.background = 
        `linear-gradient(135deg, ${bodyStart} 0%, ${bodyEnd} 100%)`;
    
    // Filter button gradient
    const filterStart = document.getElementById('filterBtnStart').value;
    const filterEnd = document.getElementById('filterBtnEnd').value;
    document.getElementById('filterBtnStartText').value = filterStart;
    document.getElementById('filterBtnEndText').value = filterEnd;
    document.getElementById('previewFilterBtn').style.background = 
        `linear-gradient(135deg, ${filterStart} 0%, ${filterEnd} 100%)`;
    
    // Card colors
    const nameColor = document.getElementById('cardNameColor').value;
    const priceColor = document.getElementById('cardPriceColor').value;
    document.getElementById('cardNameColorText').value = nameColor;
    document.getElementById('cardPriceColorText').value = priceColor;
    document.getElementById('previewHotelName').style.color = nameColor;
    document.getElementById('previewPrice').style.color = priceColor;
    
    // Favicon preview
    const faviconType = document.getElementById('faviconType').value;
    const faviconPreview = document.getElementById('faviconPreview');
    
    if (faviconType === 'emoji') {
        const emoji = document.getElementById('faviconEmoji').value || '🏝️';
        faviconPreview.textContent = emoji;
    } else {
        const url = document.getElementById('faviconUrl').value;
        if (url) {
            faviconPreview.innerHTML = `<img src="${url}" alt="Favicon" style="width: 100%; height: 100%; object-fit: contain;">`;
        } else {
            faviconPreview.textContent = '🏝️';
        }
    }
}

// Save web settings
async function saveWebSettings() {
    try {
        const settings = {
            site_name_th: document.getElementById('siteNameTh').value,
            site_name_en: document.getElementById('siteNameEn').value,
            site_name_th_color: document.getElementById('siteNameThColor').value,
            site_name_en_color: document.getElementById('siteNameEnColor').value,
            header_bg_color: document.getElementById('headerBgColor').value,
            body_bg_gradient_start: document.getElementById('bodyBgStart').value,
            body_bg_gradient_end: document.getElementById('bodyBgEnd').value,
            filter_button_bg_start: document.getElementById('filterBtnStart').value,
            filter_button_bg_end: document.getElementById('filterBtnEnd').value,
            card_hotel_name_color: document.getElementById('cardNameColor').value,
            card_price_color: document.getElementById('cardPriceColor').value,
            favicon_type: document.getElementById('faviconType').value,
            favicon_emoji: document.getElementById('faviconEmoji').value,
            favicon_url: document.getElementById('faviconUrl').value
        };

        const response = await authenticatedFetch('/api/websettings', {
            method: 'POST',
            body: JSON.stringify(settings)
        });

        const result = await response.json();

        if (result.success) {
            alert('✅ บันทึกการตั้งค่าเรียบร้อย');
            currentWebSettings = settings;
        } else {
            alert('❌ ไม่สามารถบันทึกการตั้งค่าได้: ' + result.error);
        }
    } catch (error) {
        console.error('Error saving web settings:', error);
        alert('❌ เกิดข้อผิดพลาดในการบันทึก');
    }
}

// Reset to default values
function resetToDefaults() {
    if (!confirm('คุณต้องการรีเซ็ตเป็นค่าเริ่มต้นใช่หรือไม่?')) {
        return;
    }

    const defaults = {
        site_name_th: 'ค้นหาโรงแรมเกาะล้าน',
        site_name_en: 'Koh Larn Hotel Search Engine',
        site_name_th_color: '#2d3436',
        site_name_en_color: '#636e72',
        header_bg_color: '#ffffff',
        body_bg_gradient_start: '#667eea',
        body_bg_gradient_end: '#764ba2',
        filter_button_bg_start: '#667eea',
        filter_button_bg_end: '#764ba2',
        card_hotel_name_color: '#2d3436',
        card_price_color: '#0066cc'
    };

    document.getElementById('siteNameTh').value = defaults.site_name_th;
    document.getElementById('siteNameEn').value = defaults.site_name_en;
    document.getElementById('siteNameThColor').value = defaults.site_name_th_color;
    document.getElementById('siteNameThColorText').value = defaults.site_name_th_color;
    document.getElementById('siteNameEnColor').value = defaults.site_name_en_color;
    document.getElementById('siteNameEnColorText').value = defaults.site_name_en_color;
    document.getElementById('headerBgColor').value = defaults.header_bg_color;
    document.getElementById('headerBgColorText').value = defaults.header_bg_color;
    document.getElementById('bodyBgStart').value = defaults.body_bg_gradient_start;
    document.getElementById('bodyBgStartText').value = defaults.body_bg_gradient_start;
    document.getElementById('bodyBgEnd').value = defaults.body_bg_gradient_end;
    document.getElementById('bodyBgEndText').value = defaults.body_bg_gradient_end;
    document.getElementById('filterBtnStart').value = defaults.filter_button_bg_start;
    document.getElementById('filterBtnStartText').value = defaults.filter_button_bg_start;
    document.getElementById('filterBtnEnd').value = defaults.filter_button_bg_end;
    document.getElementById('filterBtnEndText').value = defaults.filter_button_bg_end;
    document.getElementById('cardNameColor').value = defaults.card_hotel_name_color;
    document.getElementById('cardNameColorText').value = defaults.card_hotel_name_color;
    document.getElementById('cardPriceColor').value = defaults.card_price_color;
    document.getElementById('cardPriceColorText').value = defaults.card_price_color;

    // Favicon
    document.getElementById('faviconType').value = 'emoji';
    document.getElementById('faviconEmoji').value = '🏝️';
    document.getElementById('faviconUrl').value = '';
    toggleFaviconInput();

    previewChanges();
    alert('🔄 รีเซ็ตเป็นค่าเริ่มต้นแล้ว');
}

// ==================== MEMBERS MANAGEMENT ====================

// Pagination and filter state
let currentMembersPage = 1;
const membersPerPage = 10;
let allMembers = [];
let filteredMembers = [];
let hotelsCache = {}; // Cache hotel data for searching

// Load members
async function loadMembers() {
    console.log('👥 Loading members...');
    try {
        // Load hotels first for search/filter
        await loadHotelsCache();
        
        const response = await fetch('/api/members');
        const data = await response.json();
        
        if (data.success) {
            allMembers = data.data || [];
            
            const userRole = currentUser.role || 'user';
            const userHotelId = currentUser.hotelId || '';
            
            // กรองข้อมูลตาม role
            if (userRole === 'user') {
                // user ธรรมดา แสดงเฉพาะข้อมูลตัวเอง
                allMembers = allMembers.filter(member => member.username === currentUser.username);
                console.log('🔒 Filtered to show only current user:', currentUser.username);
            } else if (userRole === 'hotel_owner' || userRole === 'hotel-owner') {
                // hotel_owner แสดงเฉพาะข้อมูลตัวเอง
                allMembers = allMembers.filter(member => member.username === currentUser.username);
                console.log('🔒 Hotel owner - Filtered to show only self:', currentUser.username);
            }
            
            filteredMembers = [...allMembers];
            currentMembersPage = 1;
            filterMembers();
        } else {
            allMembers = [];
            filteredMembers = [];
            displayMembers([]);
        }
    } catch (error) {
        console.error('❌ Error loading members:', error);
        allMembers = [];
        filteredMembers = [];
        displayMembers([]);
    }
}

// Load hotels cache for search
async function loadHotelsCache() {
    try {
        const response = await fetch('/api/hotels');
        const data = await response.json();
        if (data.success) {
            hotelsCache = {};
            data.data.forEach(hotel => {
                hotelsCache[hotel.id] = {
                    nameTh: hotel.nameTh || '',
                    nameEn: hotel.nameEn || '',
                    id: hotel.id
                };
            });
        }
    } catch (error) {
        console.error('Error loading hotels cache:', error);
    }
}

// Filter members based on search and filters
function filterMembers() {
    const searchTerm = document.getElementById('memberSearchInput').value.toLowerCase().trim();
    const roleFilter = document.getElementById('memberRoleFilter').value;
    const sortBy = document.getElementById('memberSortBy').value;
    
    // Apply filters
    filteredMembers = allMembers.filter(member => {
        // Role filter
        if (roleFilter && member.role !== roleFilter) {
            return false;
        }
        
        // Search filter
        if (searchTerm) {
            const nickname = (member.nickname || '').toLowerCase();
            const username = (member.username || '').toLowerCase();
            const hotelId = (member.hotelId || '').toLowerCase();
            
            // Search in hotel name
            let hotelName = '';
            if (member.hotelId && hotelsCache[member.hotelId]) {
                hotelName = (hotelsCache[member.hotelId].nameTh + ' ' + hotelsCache[member.hotelId].nameEn).toLowerCase();
            }
            
            const matchFound = nickname.includes(searchTerm) || 
                              username.includes(searchTerm) || 
                              hotelId.includes(searchTerm) ||
                              hotelName.includes(searchTerm);
            
            if (!matchFound) return false;
        }
        
        return true;
    });
    
    // Apply sorting
    if (sortBy === 'nickname') {
        filteredMembers.sort((a, b) => (a.nickname || '').localeCompare(b.nickname || '', 'th'));
    } else if (sortBy === 'role') {
        const roleOrder = { 'admin': 1, 'hotel-owner': 2, 'user': 3 };
        filteredMembers.sort((a, b) => (roleOrder[a.role] || 99) - (roleOrder[b.role] || 99));
    } else if (sortBy === 'hotel') {
        filteredMembers.sort((a, b) => {
            const hotelA = a.hotelId && hotelsCache[a.hotelId] ? hotelsCache[a.hotelId].nameTh : '';
            const hotelB = b.hotelId && hotelsCache[b.hotelId] ? hotelsCache[b.hotelId].nameTh : '';
            return hotelA.localeCompare(hotelB, 'th');
        });
    }
    
    // Update filter count
    document.getElementById('memberFilterCount').textContent = filteredMembers.length;
    
    // Reset to first page
    currentMembersPage = 1;
    displayMembersPage();
}

// Clear all filters
function clearMemberFilters() {
    document.getElementById('memberSearchInput').value = '';
    document.getElementById('memberRoleFilter').value = '';
    document.getElementById('memberSortBy').value = 'nickname';
    filterMembers();
}

// Display members page with pagination (now uses filteredMembers)
function displayMembersPage() {
    const startIndex = (currentMembersPage - 1) * membersPerPage;
    const endIndex = startIndex + membersPerPage;
    const membersToDisplay = filteredMembers.slice(startIndex, endIndex);
    
    displayMembers(membersToDisplay);
    updateMembersPagination();
}

// Update pagination controls (now uses filteredMembers)
function updateMembersPagination() {
    const totalPages = Math.ceil(filteredMembers.length / membersPerPage);
    const paginationDiv = document.getElementById('membersPagination');
    const pageInfo = document.getElementById('membersPageInfo');
    const prevBtn = document.getElementById('membersPrevBtn');
    const nextBtn = document.getElementById('membersNextBtn');
    
    if (filteredMembers.length > membersPerPage) {
        paginationDiv.style.display = 'block';
        pageInfo.textContent = `หน้า ${currentMembersPage} จาก ${totalPages} (${filteredMembers.length} รายการ)`;
        
        prevBtn.disabled = currentMembersPage === 1;
        nextBtn.disabled = currentMembersPage === totalPages;
    } else {
        paginationDiv.style.display = 'none';
    }
}

// Change members page (now uses filteredMembers)
function changeMembersPage(direction) {
    const totalPages = Math.ceil(filteredMembers.length / membersPerPage);
    const newPage = currentMembersPage + direction;
    
    if (newPage >= 1 && newPage <= totalPages) {
        currentMembersPage = newPage;
        displayMembersPage();
        
        // Scroll to top of members list
        document.getElementById('membersList').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// Display members
function displayMembers(members) {
    const container = document.getElementById('membersList');
    if (!container) return;
    
    if (!members || members.length === 0) {
        container.innerHTML = '<p style="text-align: center; padding: 40px; color: #999;">ยังไม่มีสมาชิก</p>';
        return;
    }
    
    const roleColors = {
        admin: '#e74c3c',
        'hotel-owner': '#f39c12',
        user: '#3498db'
    };
    
    const roleIcons = {
        admin: 'fa-user-shield',
        'hotel-owner': 'fa-building',
        user: 'fa-user'
    };
    
    const roleNames = {
        admin: 'คณะกรรมการ',
        'hotel-owner': 'เจ้าของโรงแรม',
        user: 'ผู้ใช้งาน'
    };
    
    // Fetch hotels for displaying hotel names
    fetch('/api/hotels')
        .then(res => res.json())
        .then(hotelData => {
            const hotels = hotelData.success ? hotelData.data : [];
            const hotelMap = {};
            hotels.forEach(h => hotelMap[h.id] = h.nameTh || h.nameEn || h.id);
            
            container.innerHTML = members.map(member => {
                const hotelInfo = member.role === 'hotel-owner' && member.hotelId 
                    ? `<p class="member-info" style="margin: 5px 0 0 0; color: #7f8c8d; font-size: 0.85rem;">
                        <i class="fas fa-building"></i> ${hotelMap[member.hotelId] || member.hotelId}
                       </p>`
                    : '';
                
                // ปุ่มสำหรับ user และ hotel_owner: ซ่อนปุ่มลบ, แสดงเฉพาะปุ่มแก้ไข
                const actionButtons = (currentUser.role === 'user' || currentUser.role === 'hotel_owner' || currentUser.role === 'hotel-owner')
                    ? `<button onclick="editMember('${member.username}')" class="btn-action" style="padding: 8px 12px; background: #3498db; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 0.85rem; transition: all 0.3s;" title="แก้ไข">
                        <i class="fas fa-edit"></i> <span>แก้ไขข้อมูล</span>
                       </button>`
                    : `<button onclick="editMember('${member.username}')" class="btn-action" style="padding: 8px 12px; background: #3498db; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 0.85rem; transition: all 0.3s;" title="แก้ไข">
                        <i class="fas fa-edit"></i> <span>แก้ไข</span>
                       </button>
                       <button onclick="deleteMember('${member.username}', '${member.nickname || member.username}')" class="btn-action" style="padding: 8px 12px; background: #e74c3c; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 0.85rem; transition: all 0.3s;" title="ลบ">
                        <i class="fas fa-trash"></i> <span>ลบ</span>
                       </button>`;
                
                return `
                    <div class="filter-card member-card" style="background: white; border-radius: 12px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                        <div style="display: flex; align-items: flex-start; gap: 12px; margin-bottom: 15px; flex-wrap: wrap;">
                            <div style="width: 50px; height: 50px; border-radius: 50%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center; color: white; font-size: 1.3rem; font-weight: bold; flex-shrink: 0;">
                                ${member.nickname ? member.nickname.charAt(0).toUpperCase() : (member.username ? member.username.charAt(0).toUpperCase() : '?')}
                            </div>
                            <div style="flex: 1; min-width: 150px;">
                                <h3 style="margin: 0 0 5px 0; font-size: 1.05rem; color: #2c3e50; word-break: break-word;">${member.nickname || member.username || 'ไม่ระบุชื่อ'}</h3>
                                <p class="member-info" style="margin: 0; color: #7f8c8d; font-size: 0.85rem; word-break: break-all;">
                                    <i class="fas fa-user-circle"></i> ${member.username || 'ไม่มี username'}
                                </p>
                                ${hotelInfo}
                            </div>
                            <div style="text-align: right; flex-shrink: 0;">
                                <span class="role-badge" style="display: inline-block; padding: 4px 12px; border-radius: 12px; background: ${roleColors[member.role] || '#999'}; color: white; font-size: 0.75rem; font-weight: bold; white-space: nowrap;">
                                    <i class="fas ${roleIcons[member.role] || 'fa-user'}"></i> ${roleNames[member.role] || member.role || 'ผู้ใช้งาน'}
                                </span>
                            </div>
                        </div>
                        
                        <div style="display: flex; gap: 8px; justify-content: flex-end; flex-wrap: wrap;">
                            ${actionButtons}
                        </div>
                    </div>
                `;
            }).join('');
        })
        .catch(error => {
            console.error('Error loading hotels:', error);
            container.innerHTML = members.map(member => `
                <div class="filter-card member-card" style="background: white; border-radius: 12px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                    <div style="display: flex; align-items: flex-start; gap: 12px; margin-bottom: 15px; flex-wrap: wrap;">
                        <div style="width: 50px; height: 50px; border-radius: 50%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center; color: white; font-size: 1.3rem; font-weight: bold; flex-shrink: 0;">
                            ${member.nickname ? member.nickname.charAt(0).toUpperCase() : (member.username ? member.username.charAt(0).toUpperCase() : '?')}
                        </div>
                        <div style="flex: 1; min-width: 150px;">
                            <h3 style="margin: 0 0 5px 0; font-size: 1.05rem; color: #2c3e50; word-break: break-word;">${member.nickname || member.username || 'ไม่ระบุชื่อ'}</h3>
                            <p class="member-info" style="margin: 0; color: #7f8c8d; font-size: 0.85rem; word-break: break-all;">
                                <i class="fas fa-user-circle"></i> ${member.username || 'ไม่มี username'}
                            </p>
                        </div>
                        <div style="text-align: right; flex-shrink: 0;">
                            <span class="role-badge" style="display: inline-block; padding: 4px 12px; border-radius: 12px; background: ${roleColors[member.role] || '#999'}; color: white; font-size: 0.75rem; font-weight: bold; white-space: nowrap;">
                                <i class="fas ${roleIcons[member.role] || 'fa-user'}"></i> ${roleNames[member.role] || member.role || 'ผู้ใช้งาน'}
                            </span>
                        </div>
                    </div>
                    
                    <div style="display: flex; gap: 8px; justify-content: flex-end; flex-wrap: wrap;">
                        <button onclick="editMember('${member.username}')" class="btn-action" style="padding: 8px 12px; background: #3498db; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 0.85rem; transition: all 0.3s;" title="แก้ไข">
                            <i class="fas fa-edit"></i> <span>แก้ไข</span>
                        </button>
                        <button onclick="deleteMember('${member.username}', '${member.nickname || member.username}')" class="btn-action" style="padding: 8px 12px; background: #e74c3c; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 0.85rem; transition: all 0.3s;" title="ลบ">
                            <i class="fas fa-trash"></i> <span>ลบ</span>
                        </button>
                    </div>
                </div>
            `).join('');
        });
}

// Open add member modal
function openAddMemberModal() {
    document.getElementById('memberModalTitle').innerHTML = '<i class="fas fa-user-plus"></i> เพิ่มสมาชิก';
    document.getElementById('memberUsername').value = '';
    document.getElementById('memberEditMode').value = 'false';
    document.getElementById('memberUsernameInput').value = '';
    document.getElementById('memberUsernameInput').disabled = false;
    document.getElementById('memberPassword').value = '';
    document.getElementById('memberPassword').required = true;
    document.getElementById('memberNickname').value = '';
    document.getElementById('memberRole').value = 'user';
    
    // Clear hotel search inputs
    const searchInput = document.getElementById('memberHotelSearch');
    const hiddenInput = document.getElementById('memberHotelId');
    const resultsDiv = document.getElementById('hotelSearchResults');
    
    if (searchInput) searchInput.value = '';
    if (hiddenInput) hiddenInput.value = '';
    if (resultsDiv) resultsDiv.style.display = 'none';
    
    document.getElementById('hotelIdGroup').style.display = 'none';
    
    // Load hotels for dropdown
    loadHotelsForDropdown();
    
    document.getElementById('memberModal').style.display = 'flex';
}

// Close member modal
function closeMemberModal() {
    document.getElementById('memberModal').style.display = 'none';
}

// Edit member
async function editMember(memberUsername) {
    try {
        const response = await fetch('/api/members');
        const data = await response.json();
        
        if (data.success) {
            const member = data.data.find(m => m.username === memberUsername);
            if (!member) {
                showError('ไม่พบข้อมูลสมาชิก');
                return;
            }
            
            document.getElementById('memberModalTitle').innerHTML = '<i class="fas fa-user-edit"></i> แก้ไขสมาชิก';
            document.getElementById('memberUsername').value = member.username;
            document.getElementById('memberEditMode').value = 'true';
            document.getElementById('memberUsernameInput').value = member.username;
            document.getElementById('memberUsernameInput').disabled = true; // Cannot change username
            document.getElementById('memberPassword').value = '';
            document.getElementById('memberPassword').required = false;
            document.getElementById('memberPassword').placeholder = 'เว้นว่างถ้าไม่ต้องการเปลี่ยน';
            document.getElementById('memberNickname').value = member.nickname || '';
            document.getElementById('memberRole').value = member.role || 'user';
            
            const userRole = currentUser.role || 'user';
            
            // ซ่อนฟิลด์ role และ hotelId ตาม role ของผู้ใช้
            const roleGroup = document.getElementById('roleGroup');
            const hotelIdGroup = document.getElementById('hotelIdGroup');
            
            if (userRole === 'user') {
                // user ไม่สามารถแก้ไข role และ hotelId ได้
                if (roleGroup) roleGroup.style.display = 'none';
                if (hotelIdGroup) hotelIdGroup.style.display = 'none';
            } else if (userRole === 'hotel_owner' || userRole === 'hotel-owner') {
                // hotel_owner สามารถแก้ไขได้เฉพาะ password และ nickname เท่านั้น
                if (roleGroup) roleGroup.style.display = 'none';
                if (hotelIdGroup) hotelIdGroup.style.display = 'none';
                console.log('🔒 Hotel owner - Hidden role and hotelId fields');
            } else {
                // admin เท่านั้นที่แก้ไข role และ hotelId ได้
                if (roleGroup) roleGroup.style.display = 'block';
                // hotelId จะแสดงตามเงื่อนไขด้านล่าง
            }
            
            // Load hotels for dropdown first
            await loadHotelsForDropdown();
            
            // Set hotel ID and search input after hotels are loaded
            const searchInput = document.getElementById('memberHotelSearch');
            const hiddenInput = document.getElementById('memberHotelId');
            
            if (member.hotelId && searchInput && hiddenInput) {
                hiddenInput.value = String(member.hotelId);
                
                // Find hotel and set display text
                const hotel = allHotelsData.find(h => String(h.id) === String(member.hotelId));
                if (hotel) {
                    const displayName = hotel.nameTh || hotel.nameEn || 'ไม่มีชื่อ';
                    searchInput.value = `${hotel.id} - ${displayName}`;
                } else {
                    searchInput.value = member.hotelId;
                }
            } else if (searchInput && hiddenInput) {
                searchInput.value = '';
                hiddenInput.value = '';
            }
            
            // Show/hide hotel field based on member's role AND current user's role
            const currentHotelInfo = document.getElementById('currentHotelInfo');
            
            // Only admin can see and edit hotelId field
            if ((member.role === 'hotel_owner' || member.role === 'hotel-owner') && userRole === 'admin') {
                // Admin viewing hotel_owner - show hotelId field
                if (hotelIdGroup) hotelIdGroup.style.display = 'block';
                
                // Show current hotel name if exists
                if (member.hotelId) {
                    // Use allHotelsData which is already loaded
                    const hotel = allHotelsData.find(h => String(h.id) === String(member.hotelId));
                    if (hotel) {
                        const hotelName = hotel.nameTh || hotel.nameEn || member.hotelId;
                        if (currentHotelInfo) {
                            currentHotelInfo.innerHTML = `<i class="fas fa-building"></i> ปัจจุบัน: <strong style="color: #2c3e50;">${hotel.id} - ${hotelName}</strong>`;
                        }
                    } else {
                        if (currentHotelInfo) {
                            currentHotelInfo.innerHTML = `<i class="fas fa-exclamation-triangle" style="color: #e74c3c;"></i> ไม่พบข้อมูลโรงแรม (ID: ${member.hotelId})`;
                        }
                    }
                } else {
                    if (currentHotelInfo) {
                        currentHotelInfo.innerHTML = '<i class="fas fa-info-circle"></i> ยังไม่ได้กำหนดโรงแรม';
                    }
                }
            } else {
                if (hotelIdGroup) hotelIdGroup.style.display = 'none';
                if (currentHotelInfo) currentHotelInfo.innerHTML = '';
            }
            
            document.getElementById('memberModal').style.display = 'flex';
        }
    } catch (error) {
        console.error('Error loading member:', error);
        showError('เกิดข้อผิดพลาดในการโหลดข้อมูล');
    }
}

// Save member
async function saveMember(event) {
    event.preventDefault();
    
    const memberUsername = document.getElementById('memberUsername').value;
    const isEdit = document.getElementById('memberEditMode').value === 'true';
    
    // Get values from form
    const usernameInput = document.getElementById('memberUsernameInput');
    const passwordInput = document.getElementById('memberPassword');
    const nicknameInput = document.getElementById('memberNickname');
    const roleSelect = document.getElementById('memberRole');
    const hotelIdSelect = document.getElementById('memberHotelId');
    
    console.log('🔍 Debug form values:', {
        isEdit,
        memberUsername: memberUsername,
        usernameInputValue: usernameInput.value,
        passwordInputValue: passwordInput.value ? '***' : '(empty)',
        nicknameInputValue: nicknameInput.value,
        roleValue: roleSelect.value,
        hotelIdValue: hotelIdSelect.value
    });
    
    const memberData = {
        username: isEdit ? memberUsername : usernameInput.value.trim(),
        nickname: nicknameInput.value.trim(),
        role: roleSelect.value,
        hotelId: hotelIdSelect.value ? String(hotelIdSelect.value) : ''
    };
    
    // Add password only if provided (for new user or password change)
    if (passwordInput.value) {
        memberData.password = passwordInput.value;
    }
    
    console.log('💾 Saving member data:', { ...memberData, password: memberData.password ? '***' : 'not set' });
    
    try {
        const url = isEdit ? `/api/admin/members/${memberUsername}` : '/api/admin/members';
        const method = isEdit ? 'PUT' : 'POST';
        
        console.log('📤 Sending to server:', { 
            ...memberData, 
            password: memberData.password ? '***' : 'not set'
        });
        
        const response = await fetchWithAuth(url, {
            method: method,
            body: JSON.stringify(memberData)
        });
        
        const data = await response.json();
        
        if (data.success) {
            showSuccess(isEdit ? 'แก้ไขสมาชิกสำเร็จ' : 'เพิ่มสมาชิกสำเร็จ');
            closeMemberModal();
            loadMembers();
        } else {
            showError(data.error || data.message || 'เกิดข้อผิดพลาด');
        }
    } catch (error) {
        console.error('Error saving member:', error);
        showError('เกิดข้อผิดพลาดในการบันทึก');
    }
}

// Delete member
async function deleteMember(memberId, memberName) {
    if (!confirm(`ต้องการลบสมาชิก "${memberName}" หรือไม่?`)) {
        return;
    }
    
    try {
        const response = await authenticatedFetch(`/api/admin/members/${memberId}`, {
            method: 'DELETE'
        });
        
        const data = await response.json();
        
        if (data.success) {
            showSuccess('ลบสมาชิกสำเร็จ');
            loadMembers();
        } else {
            showError(data.error || data.message || 'เกิดข้อผิดพลาด');
        }
    } catch (error) {
        console.error('Error deleting member:', error);
        showError('เกิดข้อผิดพลาดในการลบ');
    }
}

// Load hotels for dropdown
let allHotelsData = []; // Store all hotels for searching

async function loadHotelsForDropdown() {
    try {
        const response = await fetch('/api/hotels');
        const data = await response.json();
        
        if (data.success) {
            allHotelsData = data.data; // Store for search functionality
            
            // Setup search functionality
            const searchInput = document.getElementById('memberHotelSearch');
            const resultsDiv = document.getElementById('hotelSearchResults');
            const hiddenInput = document.getElementById('memberHotelId');
            
            if (!searchInput) return;
            
            // Search on input
            searchInput.addEventListener('input', function() {
                const searchTerm = this.value.toLowerCase().trim();
                
                if (searchTerm.length === 0) {
                    resultsDiv.style.display = 'none';
                    hiddenInput.value = '';
                    return;
                }
                
                // Filter hotels by ID, nameTh, or nameEn
                const filteredHotels = allHotelsData.filter(hotel => {
                    const id = String(hotel.id).toLowerCase();
                    const nameTh = (hotel.nameTh || '').toLowerCase();
                    const nameEn = (hotel.nameEn || '').toLowerCase();
                    
                    return id.includes(searchTerm) || 
                           nameTh.includes(searchTerm) || 
                           nameEn.includes(searchTerm);
                });
                
                displaySearchResults(filteredHotels);
            });
            
            // Close results when clicking outside
            document.addEventListener('click', function(e) {
                if (!searchInput.contains(e.target) && !resultsDiv.contains(e.target)) {
                    resultsDiv.style.display = 'none';
                }
            });
        }
    } catch (error) {
        console.error('Error loading hotels:', error);
    }
}

// Display search results
function displaySearchResults(hotels) {
    const resultsDiv = document.getElementById('hotelSearchResults');
    
    if (hotels.length === 0) {
        resultsDiv.innerHTML = '<div style="padding: 10px; color: #999; text-align: center;">ไม่พบโรงแรม</div>';
        resultsDiv.style.display = 'block';
        return;
    }
    
    let html = '';
    hotels.forEach(hotel => {
        const nameTh = hotel.nameTh || '';
        const nameEn = hotel.nameEn || '';
        const displayName = nameTh || nameEn || 'ไม่มีชื่อ';
        const secondaryName = nameTh && nameEn ? `<span style="color: #999; font-size: 0.9em;">${nameEn}</span>` : '';
        
        html += `
            <div 
                class="hotel-search-item" 
                onclick="selectHotel('${hotel.id}', '${displayName.replace(/'/g, "\\'")}', '${nameEn.replace(/'/g, "\\'")}', '${nameTh.replace(/'/g, "\\'")}')"
                style="padding: 10px; cursor: pointer; border-bottom: 1px solid #f0f0f0; transition: background 0.2s;"
                onmouseover="this.style.background='#f8f9fa'"
                onmouseout="this.style.background='white'"
            >
                <div style="font-weight: bold; color: #2c3e50;">
                    <i class="fas fa-hotel" style="color: #3498db; margin-right: 5px;"></i>
                    ${hotel.id} - ${displayName}
                </div>
                ${secondaryName ? `<div style="margin-left: 25px;">${secondaryName}</div>` : ''}
            </div>
        `;
    });
    
    resultsDiv.innerHTML = html;
    resultsDiv.style.display = 'block';
}

// Select hotel from search results
function selectHotel(hotelId, displayName, nameEn, nameTh) {
    const searchInput = document.getElementById('memberHotelSearch');
    const hiddenInput = document.getElementById('memberHotelId');
    const resultsDiv = document.getElementById('hotelSearchResults');
    
    // Set values
    const finalName = nameTh || nameEn || displayName;
    searchInput.value = `${hotelId} - ${finalName}`;
    hiddenInput.value = String(hotelId);
    
    // Hide results
    resultsDiv.style.display = 'none';
}

// Add event listener for role change to show/hide hotel field
document.addEventListener('DOMContentLoaded', function() {
    const roleSelect = document.getElementById('memberRole');
    if (roleSelect) {
        roleSelect.addEventListener('change', function() {
            const hotelIdGroup = document.getElementById('hotelIdGroup');
            const searchInput = document.getElementById('memberHotelSearch');
            const hiddenInput = document.getElementById('memberHotelId');
            const resultsDiv = document.getElementById('hotelSearchResults');
            
            if (this.value === 'hotel-owner') {
                hotelIdGroup.style.display = 'block';
            } else {
                hotelIdGroup.style.display = 'none';
                if (searchInput) searchInput.value = '';
                if (hiddenInput) hiddenInput.value = '';
                if (resultsDiv) resultsDiv.style.display = 'none';
            }
        });
    }
});





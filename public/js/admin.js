// Global variables
let currentUser = {
    username: '',
    password: '',
    nickname: ''
};
let currentPeriod = 'day';
let currentSort = 'most';
let statsInterval;
let isTemporaryPassword = false;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    setupLogin();
});

// Setup login
function setupLogin() {
    const loginForm = document.getElementById('loginForm');
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        try {
            const response = await fetch('/api/admin/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });
            
            const data = await response.json();
            
            if (data.success) {
                currentUser = {
                    username: username,
                    password: password,
                    nickname: data.user.nickname
                };
                isTemporaryPassword = data.isTemporary || false;
                document.getElementById('loginScreen').style.display = 'none';
                document.getElementById('adminDashboard').style.display = 'block';
                
                // Show welcome message
                const welcomeMsg = document.getElementById('welcomeMessage');
                if (welcomeMsg) {
                    welcomeMsg.innerHTML = `<i class="fas fa-user-circle"></i> ยินดีต้อนรับ, <strong>${data.user.nickname}</strong>`;
                }
                
                // Show notification if using temporary account
                if (isTemporaryPassword) {
                    showTempPasswordWarning();
                }
                
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
    setupTabs();
    loadStats();
    loadHotels();
    loadLikesStats();
    loadActivityLog();
    
    // Auto-refresh stats every 30 seconds
    statsInterval = setInterval(() => {
        loadStats();
        loadLikesStats();
    }, 30000);
    
    // Logout button
    document.getElementById('logoutBtn').addEventListener('click', () => {
        clearInterval(statsInterval);
        currentUser = { username: '', password: '', nickname: '' };
        document.getElementById('loginScreen').style.display = 'flex';
        document.getElementById('adminDashboard').style.display = 'none';
        document.getElementById('username').value = '';
        document.getElementById('password').value = '';
    });
}

// Setup tabs
function setupTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabName = btn.dataset.tab;
            
            // Remove active class from all
            tabButtons.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            // Add active to selected
            btn.classList.add('active');
            document.getElementById(`${tabName}Tab`).classList.add('active');
        });
    });
}

// Load statistics
async function loadStats() {
    try {
        const response = await fetch(`/api/admin/stats?username=${encodeURIComponent(currentUser.username)}&password=${encodeURIComponent(currentUser.password)}&period=${currentPeriod}`);
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
    document.getElementById('realtimeVisits').textContent = stats.realtimeVisits.count;
    document.getElementById('totalVisits').textContent = stats.visits.total.toLocaleString('th-TH');
    document.getElementById('uniqueVisits').textContent = stats.visits.unique.toLocaleString('th-TH');
    document.getElementById('totalLikes').textContent = stats.likes.total.toLocaleString('th-TH');
    
    // Update chart
    updateChart(stats.visits.byPeriod);
    
    // Period buttons
    const periodButtons = document.querySelectorAll('.period-btn');
    periodButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            periodButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentPeriod = btn.dataset.period;
            loadStats();
        });
    });
}

// Update chart
let visitsChart;
function updateChart(data) {
    const ctx = document.getElementById('visitsChart');
    
    if (visitsChart) {
        visitsChart.destroy();
    }
    
    visitsChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: Object.keys(data),
            datasets: [{
                label: 'การเข้าชม',
                data: Object.values(data),
                borderColor: '#667eea',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
}

// Load hotels
async function loadHotels() {
    try {
        const response = await fetch('/api/hotels');
        const data = await response.json();
        
        if (data.success) {
            displayHotelsTable(data.data);
        }
    } catch (error) {
        console.error('Error loading hotels:', error);
    }
}

// Display hotels table
function displayHotelsTable(hotels) {
    const container = document.getElementById('hotelsTable');
    
    if (hotels.length === 0) {
        container.innerHTML = '<p style="text-align: center; padding: 40px;">ยังไม่มีข้อมูลโรงแรม</p>';
        return;
    }
    
    container.innerHTML = `
        <table>
            <thead>
                <tr>
                    <th>รูป</th>
                    <th>ชื่อโรงแรม</th>
                    <th>ราคา</th>
                    <th>สิ่งอำนวยความสะดวก</th>
                    <th>การจัดการ</th>
                </tr>
            </thead>
            <tbody>
                ${hotels.map(hotel => `
                    <tr>
                        <td>
                            <img src="${hotel.imageUrl || 'https://via.placeholder.com/60'}" 
                                 class="hotel-thumb" 
                                 onerror="this.src='https://via.placeholder.com/60'"
                                 style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px;">
                        </td>
                        <td>
                            <strong>${hotel.nameTh || 'ไม่มีชื่อ'}</strong><br>
                            <small>${hotel.nameEn || ''}</small>
                        </td>
                        <td>฿${hotel.priceStart?.toLocaleString('th-TH') || '0'} - ฿${hotel.priceEnd?.toLocaleString('th-TH') || '0'}</td>
                        <td>
                            <div style="display: flex; gap: 5px; flex-wrap: wrap;">
                                ${hotel.beach ? '<span class="badge"><i class="fas fa-umbrella-beach"></i> ชายหาด</span>' : ''}
                                ${hotel.pool ? '<span class="badge"><i class="fas fa-swimming-pool"></i> สระว่ายน้ำ</span>' : ''}
                                ${hotel.wifi ? '<span class="badge"><i class="fas fa-wifi"></i> WiFi</span>' : ''}
                                ${hotel.parking ? '<span class="badge"><i class="fas fa-car"></i> ที่จอดรถ</span>' : ''}
                                ${hotel.breakfast ? '<span class="badge"><i class="fas fa-coffee"></i> อาหารเช้า</span>' : ''}
                                ${hotel.restaurant ? '<span class="badge"><i class="fas fa-utensils"></i> ร้านอาหาร</span>' : ''}
                            </div>
                        </td>
                        <td>
                            <div class="action-buttons">
                                <button class="btn btn-sm btn-primary" onclick="editHotel('${hotel.id}')">
                                    <i class="fas fa-edit"></i> แก้ไข
                                </button>
                                <button class="btn btn-sm btn-danger" onclick="deleteHotel('${hotel.id}', '${hotel.nameTh}')">
                                    <i class="fas fa-trash"></i> ลบ
                                </button>
                            </div>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
    
    // Add CSS for badges
    if (!document.getElementById('badge-styles')) {
        const style = document.createElement('style');
        style.id = 'badge-styles';
        style.textContent = `
            .badge {
                display: inline-flex;
                align-items: center;
                gap: 3px;
                background: #e3f2fd;
                color: #1976d2;
                padding: 2px 8px;
                border-radius: 12px;
                font-size: 0.75rem;
                white-space: nowrap;
            }
        `;
        document.head.appendChild(style);
    }
    
    // Add hotel button
    const addBtn = document.getElementById('addHotelBtn');
    if (addBtn) {
        addBtn.onclick = () => showHotelForm();
    }
}

// Load likes statistics
async function loadLikesStats() {
    try {
        const response = await fetch(`/api/admin/stats?username=${encodeURIComponent(currentUser.username)}&password=${encodeURIComponent(currentUser.password)}&period=${currentPeriod}`);
        const data = await response.json();
        
        if (data.success) {
            displayLikesStats(data.data.topHotels);
        }
    } catch (error) {
        console.error('Error loading likes stats:', error);
    }
}

// Display likes statistics
async function displayLikesStats(topHotels) {
    // Load all hotels to get names
    const hotelsResponse = await fetch('/api/hotels');
    const hotelsData = await hotelsResponse.json();
    const hotels = hotelsData.data;
    
    const container = document.getElementById('likesStats');
    
    if (topHotels.length === 0) {
        container.innerHTML = '<p style="text-align: center; padding: 40px;">ยังไม่มีข้อมูลการกดหัวใจ</p>';
        return;
    }
    
    container.innerHTML = topHotels.map((item, index) => {
        const hotel = hotels.find(h => h.id === item.hotelId);
        if (!hotel) return '';
        
        return `
            <div class="like-item">
                <div class="like-info">
                    <h4>#${index + 1} ${hotel.nameTh}</h4>
                    <p>${hotel.nameEn}</p>
                </div>
                <div class="like-count">
                    <i class="fas fa-heart"></i>
                    ${item.likes}
                </div>
            </div>
        `;
    }).join('');
    
    // Sort buttons
    const sortButtons = document.querySelectorAll('.sort-btn');
    sortButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            sortButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentSort = btn.dataset.sort;
            loadLikesStats();
        });
    });
}

// Load activity log
async function loadActivityLog() {
    try {
        const response = await fetch(`/api/admin/activity-logs?username=${encodeURIComponent(currentUser.username)}&password=${encodeURIComponent(currentUser.password)}`);
        const data = await response.json();
        
        if (data.success) {
            displayActivityLog(data.data);
        }
    } catch (error) {
        console.error('Error loading activity log:', error);
    }
}

// Display activity log
function displayActivityLog(logs) {
    const container = document.getElementById('activityLog');
    
    if (logs.length === 0) {
        container.innerHTML = '<p style="text-align: center; padding: 40px;">ยังไม่มีประวัติการใช้งาน</p>';
        return;
    }
    
    container.innerHTML = logs.map(log => `
        <div class="activity-item">
            <div class="activity-icon">
                <i class="fas ${getActivityIcon(log.action)}"></i>
            </div>
            <div class="activity-details">
                <strong>${log.nickname || log.username}</strong>
                <span>${log.action}</span>
                <p>${log.details}</p>
                <small>${formatDateTime(log.timestamp)}</small>
            </div>
        </div>
    `).join('');
}

// Get activity icon based on action type
function getActivityIcon(action) {
    if (action.includes('เพิ่ม') || action.includes('สร้าง')) return 'fa-plus-circle';
    if (action.includes('แก้ไข')) return 'fa-edit';
    if (action.includes('ลบ')) return 'fa-trash';
    if (action.includes('เข้าสู่ระบบ')) return 'fa-sign-in-alt';
    return 'fa-info-circle';
}

// Format date time
function formatDateTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days} วันที่แล้ว`;
    if (hours > 0) return `${hours} ชั่วโมงที่แล้ว`;
    if (minutes > 0) return `${minutes} นาทีที่แล้ว`;
    return 'เมื่อสักครู่';
}

// Show hotel form
function showHotelForm(hotelId = null) {
    const modal = document.getElementById('hotelFormModal');
    const form = document.getElementById('hotelForm');
    const title = document.getElementById('formTitle');
    
    // Reset form
    form.reset();
    
    if (hotelId) {
        title.textContent = 'แก้ไขโรงแรม';
        loadHotelData(hotelId);
    } else {
        title.textContent = 'เพิ่มโรงแรม';
        document.getElementById('hotelId').value = `hotel-${Date.now()}`;
    }
    
    modal.style.display = 'block';
    
    // Form submit
    form.onsubmit = async (e) => {
        e.preventDefault();
        await saveHotel(hotelId);
    };
    
    // Close button
    modal.querySelector('.close').onclick = () => {
        modal.style.display = 'none';
    };
}

// Load hotel data for editing
async function loadHotelData(hotelId) {
    try {
        const response = await fetch('/api/hotels');
        const data = await response.json();
        
        if (data.success) {
            const hotel = data.data.find(h => h.id === hotelId);
            if (hotel) {
                // Basic info
                document.getElementById('hotelId').value = hotel.id || '';
                document.getElementById('nameTh').value = hotel.nameTh || '';
                document.getElementById('nameEn').value = hotel.nameEn || '';
                document.getElementById('images').value = hotel.imageUrl || '';
                
                // Pricing
                document.getElementById('priceStart').value = hotel.priceStart || '';
                
                // Description (if exists in form)
                const descTh = document.getElementById('descriptionTh');
                const descEn = document.getElementById('descriptionEn');
                if (descTh) descTh.value = hotel.descriptionTh || '';
                if (descEn) descEn.value = hotel.descriptionEn || '';
                
                // Facilities - mapping to existing form checkboxes
                const beachCheckbox = document.getElementById('beachfront');
                const poolCheckbox = document.getElementById('poolVilla');
                const wifiCheckbox = document.getElementById('bathtub');
                const parkingCheckbox = document.getElementById('freeShuttle');
                const breakfastCheckbox = document.getElementById('breakfast');
                const restaurantCheckbox = document.getElementById('freeMotorcycle');
                
                if (beachCheckbox) beachCheckbox.checked = hotel.beach || false;
                if (poolCheckbox) poolCheckbox.checked = hotel.pool || false;
                if (wifiCheckbox) wifiCheckbox.checked = hotel.wifi || false;
                if (parkingCheckbox) parkingCheckbox.checked = hotel.parking || false;
                if (breakfastCheckbox) breakfastCheckbox.checked = hotel.breakfast || false;
                if (restaurantCheckbox) restaurantCheckbox.checked = hotel.restaurant || false;
                
                // Contact info
                const phoneInput = document.getElementById('phone');
                if (phoneInput) phoneInput.value = hotel.phone || '';
            }
        }
    } catch (error) {
        console.error('Error loading hotel data:', error);
    }
}

// Save hotel
async function saveHotel(hotelId) {
    // Build hotel object matching Google Sheets structure (18 columns)
    const hotel = {
        id: document.getElementById('hotelId')?.value || `hotel-${Date.now()}`,
        nameTh: document.getElementById('nameTh')?.value || '',
        nameEn: document.getElementById('nameEn')?.value || '',
        descriptionTh: document.getElementById('descriptionTh')?.value || '',
        descriptionEn: document.getElementById('descriptionEn')?.value || '',
        priceStart: parseFloat(document.getElementById('priceStart')?.value) || 0,
        priceEnd: parseFloat(document.getElementById('priceStart')?.value) || 0, // Use same as start if no end field
        imageUrl: document.getElementById('images')?.value || '',
        rating: 0, // Default rating
        latitude: 0, // Default coordinates
        longitude: 0,
        beach: document.getElementById('beachfront')?.checked || false,
        pool: document.getElementById('poolVilla')?.checked || false,
        wifi: document.getElementById('bathtub')?.checked || false,
        parking: document.getElementById('freeShuttle')?.checked || false,
        breakfast: document.getElementById('breakfast')?.checked || false,
        restaurant: document.getElementById('freeMotorcycle')?.checked || false,
        phone: document.getElementById('phone')?.value || ''
    };
    
    try {
        const url = hotelId ? `/api/admin/hotels/${hotelId}` : '/api/admin/hotels';
        const method = hotelId ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: currentUser.username,
                password: currentUser.password,
                hotel
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showSuccess(hotelId ? 'แก้ไขโรงแรมสำเร็จ' : 'เพิ่มโรงแรมสำเร็จ');
            document.getElementById('hotelFormModal').style.display = 'none';
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
        const response = await fetch(`/api/admin/hotels/${hotelId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: currentUser.username,
                password: currentUser.password,
                hotelName: hotelName
            })
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

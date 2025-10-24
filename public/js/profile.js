// Global variables
let currentUser = null;
let allHotels = [];
let followedHotels = [];

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    checkUserLogin();
    setupEventListeners();
});

// Get username from URL query parameter
function getUsernameFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}

// Check if user is logged in
function checkUserLogin() {
    const savedToken = localStorage.getItem('authToken');
    const savedUser = localStorage.getItem('currentUser');
    const urlUsername = getUsernameFromURL();
    
    if (!savedToken || !savedUser) {
        // Redirect to home page if not logged in
        window.location.href = '/';
        return;
    }

    // Verify token with server
    fetch('/api/auth/verify', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${savedToken}`,
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            currentUser = JSON.parse(savedUser);
            
            // Check if viewing own profile
            if (urlUsername && urlUsername !== currentUser.username) {
                // Redirect if trying to view other user's profile
                window.location.href = `/profile?id=${currentUser.username}`;
                return;
            }
            
            updateUserUI();
            loadFollowedHotels();
        } else {
            localStorage.removeItem('authToken');
            localStorage.removeItem('currentUser');
            window.location.href = '/';
        }
    })
    .catch(error => {
        console.error('Token verification error:', error);
        window.location.href = '/';
    });
}

// Update user UI
function updateUserUI() {
    if (!currentUser) return;

    document.getElementById('userDisplayName').textContent = currentUser.nickname || currentUser.username;
    document.getElementById('profileNickname').textContent = currentUser.nickname || currentUser.username;
    document.getElementById('profileUsername').textContent = `@${currentUser.username}`;
    
    // Set profile link with username
    const profileFollowLink = document.getElementById('profileFollowLink');
    if (profileFollowLink) {
        profileFollowLink.href = `/profile?id=${currentUser.username}`;
    }
    
    // Display role
    const roleMap = {
        'admin': 'ผู้ดูแลระบบ',
        'hotel_owner': 'เจ้าของโรงแรม',
        'user': 'สมาชิก'
    };
    document.getElementById('profileRole').textContent = roleMap[currentUser.role] || 'สมาชิก';
}

// Setup event listeners
function setupEventListeners() {
    // Profile dropdown
    const profileBtn = document.getElementById('profileBtn');
    const profileDropdown = document.getElementById('profileDropdown');
    
    if (profileBtn) {
        profileBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            profileDropdown.classList.toggle('show');
        });
    }

    // Close dropdown when clicking outside
    document.addEventListener('click', () => {
        if (profileDropdown) {
            profileDropdown.classList.remove('show');
        }
    });

    // Logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            logout();
        });
    }

    // Tab switching
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.dataset.tab;
            switchTab(targetTab);
        });
    });

    // Hotel modal close
    const modal = document.getElementById('hotelModal');
    const closeBtn = modal?.querySelector('.close');
    
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            modal.classList.remove('show');
        });
    }

    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('show');
            }
        });
    }
}

// Logout
function logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    window.location.href = '/';
}

// Switch tab
function switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.tab === tabName) {
            btn.classList.add('active');
        }
    });

    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    const targetContent = document.getElementById(`${tabName}Tab`);
    if (targetContent) {
        targetContent.classList.add('active');
    }
}

// Load followed hotels
async function loadFollowedHotels() {
    const grid = document.getElementById('followedHotelsGrid');
    const emptyState = document.getElementById('emptyFollowed');
    const token = localStorage.getItem('authToken');

    try {
        // Show loading
        grid.innerHTML = `
            <div class="loading">
                <i class="fas fa-spinner fa-spin"></i>
                <p>กำลังโหลดข้อมูล...</p>
            </div>
        `;

        // Load all hotels first
        const hotelsResponse = await fetch('/api/hotels');
        const hotelsData = await hotelsResponse.json();
        
        // Handle both array and object responses
        allHotels = Array.isArray(hotelsData) ? hotelsData : (hotelsData.data || []);

        // Load followed hotels
        const followedResponse = await fetch('/api/followed-hotels', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const followedData = await followedResponse.json();
        
        if (followedData.success) {
            followedHotels = followedData.data;
            
            // Update count
            const count = followedHotels.length;
            document.getElementById('followedCount').textContent = count;
            document.getElementById('followedCountText').textContent = count;

            if (count === 0) {
                // Show empty state
                grid.innerHTML = '';
                emptyState.style.display = 'block';
            } else {
                // Show hotels
                emptyState.style.display = 'none';
                displayFollowedHotels();
            }
        }
    } catch (error) {
        console.error('Error loading followed hotels:', error);
        grid.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>เกิดข้อผิดพลาด</h3>
                <p>ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่อีกครั้ง</p>
            </div>
        `;
    }
}

// Display followed hotels
function displayFollowedHotels() {
    const grid = document.getElementById('followedHotelsGrid');
    
    // Get full hotel details for followed hotels
    const hotelCards = followedHotels.map(followed => {
        const hotel = allHotels.find(h => h.id === followed.hotel_id);
        if (!hotel) return '';
        
        return createHotelCard(hotel, true);
    }).filter(card => card !== '').join('');

    grid.innerHTML = hotelCards;

    // Add click handlers
    document.querySelectorAll('.hotel-card').forEach(card => {
        card.addEventListener('click', () => {
            const hotelId = card.dataset.hotelId;
            const hotel = allHotels.find(h => h.id === hotelId);
            if (hotel) {
                showHotelModal(hotel);
            }
        });
    });
}

// Create hotel card (simplified version from app.js)
function createHotelCard(hotel, isFollowed = false) {
    const name = hotel.nameTh || hotel.nameEn || 'ไม่มีชื่อ';
    const nameEn = hotel.nameTh && hotel.nameEn ? hotel.nameEn : '';
    const price = hotel.priceStart || 0;
    const priceEnd = hotel.priceEnd || price;
    
    const images = hotel.images && hotel.images.length > 0 
        ? hotel.images 
        : [hotel.imageUrl || 'https://via.placeholder.com/300x200'];
    
    return `
        <div class="hotel-card" data-hotel-id="${hotel.id}">
            <div class="hotel-image">
                <img src="${images[0]}" alt="${name}" onerror="this.src='https://via.placeholder.com/300x200'">
                ${hotel.maxGuests ? `<span class="guests-badge"><i class="fas fa-users"></i> ${hotel.maxGuests} คน</span>` : ''}
            </div>
            <div class="hotel-info">
                <h3 class="hotel-name">${name}</h3>
                ${nameEn ? `<p class="hotel-name-en">${nameEn}</p>` : ''}
                <div class="hotel-price">
                    <i class="fas fa-tag"></i>
                    <span>${price.toLocaleString('th-TH')} ${priceEnd > price ? '- ' + priceEnd.toLocaleString('th-TH') : ''} บาท</span>
                </div>
                <div class="hotel-footer">
                    <span class="hotel-id"><i class="fas fa-tag"></i> ${hotel.id}</span>
                    <div class="hotel-actions">
                        <button class="follow-btn following" data-hotel-id="${hotel.id}" data-hotel-name="${name}" title="เลิกติดตามโรงแรม" onclick="event.stopPropagation(); unfollowHotel('${hotel.id}', this)">
                            <i class="fas fa-bookmark"></i>
                        </button>
                        <button class="like-btn" data-hotel-id="${hotel.id}" title="กดหัวใจ">
                            <i class="fas fa-heart"></i>
                            <span>${hotel.likes || 0}</span>
                        </button>
                    </div>
                    <span class="view-details">ดูรายละเอียด <i class="fas fa-arrow-right"></i></span>
                </div>
            </div>
        </div>
    `;
}

// Unfollow hotel from profile page
async function unfollowHotel(hotelId, buttonElement) {
    const token = localStorage.getItem('authToken');

    try {
        const response = await fetch(`/api/unfollow-hotel/${hotelId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            // Remove hotel from list
            followedHotels = followedHotels.filter(h => h.hotel_id !== hotelId);
            
            // Update count
            const count = followedHotels.length;
            document.getElementById('followedCount').textContent = count;
            document.getElementById('followedCountText').textContent = count;

            // Reload display
            if (count === 0) {
                document.getElementById('followedHotelsGrid').innerHTML = '';
                document.getElementById('emptyFollowed').style.display = 'block';
            } else {
                displayFollowedHotels();
            }
        } else {
            alert('เกิดข้อผิดพลาดในการเลิกติดตามโรงแรม');
        }
    } catch (error) {
        console.error('Error unfollowing hotel:', error);
        alert('เกิดข้อผิดพลาดในการเลิกติดตามโรงแรม');
    }
}

// Show hotel modal (simplified version)
function showHotelModal(hotel) {
    const modal = document.getElementById('hotelModal');
    const modalContent = document.getElementById('modalContent');

    const name = hotel.nameTh || hotel.nameEn || 'ไม่มีชื่อ';
    const nameEn = hotel.nameTh && hotel.nameEn ? hotel.nameEn : '';
    const price = hotel.priceStart || 0;
    const priceEnd = hotel.priceEnd || price;
    
    const images = hotel.images && hotel.images.length > 0 
        ? hotel.images 
        : [hotel.imageUrl || 'https://via.placeholder.com/300x200'];

    modalContent.innerHTML = `
        <div class="modal-header">
            <h2>${name}</h2>
            ${nameEn ? `<p class="modal-subtitle">${nameEn}</p>` : ''}
        </div>
        <div class="modal-body">
            <div class="modal-images">
                ${images.map(img => `<img src="${img}" alt="${name}" onerror="this.src='https://via.placeholder.com/600x400'">`).join('')}
            </div>
            <div class="modal-info">
                <div class="info-row">
                    <i class="fas fa-tag"></i>
                    <strong>ราคา:</strong> ${price.toLocaleString('th-TH')} ${priceEnd > price ? '- ' + priceEnd.toLocaleString('th-TH') : ''} บาท
                </div>
                ${hotel.maxGuests ? `
                <div class="info-row">
                    <i class="fas fa-users"></i>
                    <strong>รองรับผู้เข้าพัก:</strong> ${hotel.maxGuests} คน
                </div>
                ` : ''}
                ${hotel.description ? `
                <div class="info-row description">
                    <i class="fas fa-info-circle"></i>
                    <strong>รายละเอียด:</strong>
                    <p>${hotel.description}</p>
                </div>
                ` : ''}
            </div>
        </div>
    `;

    modal.classList.add('show');
}

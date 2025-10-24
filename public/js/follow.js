// Global variables
let currentUser = null;
let allHotels = [];
let followedHotels = [];
let allFilters = []; // For filter data
let allRoomTypes = []; // For room type data
let allAccommodationTypes = []; // For accommodation type data

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
    
    // Set profile and follow links
    const profileLink = document.getElementById('profileLink');
    const followLink = document.getElementById('followLink');
    if (profileLink) {
        profileLink.href = `/profile?id=${currentUser.username}`;
    }
    if (followLink) {
        followLink.href = `/follow?id=${currentUser.username}`;
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

// Create hotel card (same as main page)
function createHotelCard(hotel, isFollowed = false) {
    const filters = hotel.filters ? hotel.filters.split(',').map(f => f.trim()).filter(f => f) : [];
    const roomTypesList = hotel.roomTypes ? hotel.roomTypes.split(',').map(rt => rt.trim()).filter(rt => rt) : [];
    const name = hotel.nameTh || hotel.nameEn || 'ไม่มีชื่อ';
    const nameEn = hotel.nameTh && hotel.nameEn ? hotel.nameEn : '';
    const price = hotel.priceStart || 0;
    const priceEnd = hotel.priceEnd || price;
    
    const images = hotel.images && hotel.images.length > 0 
        ? hotel.images 
        : [hotel.imageUrl || 'https://via.placeholder.com/300x200'];
    
    // Get amenities for display (first 3)
    const displayAmenities = filters.slice(0, 3);
    const remainingCount = filters.length - displayAmenities.length;
    
    // Get room types for display (first 2)
    const displayRoomTypes = roomTypesList.slice(0, 2);
    const remainingRoomTypesCount = roomTypesList.length - displayRoomTypes.length;
    
    // Get accommodation type data
    const accommodationTypesList = hotel.accommodationTypes ? hotel.accommodationTypes.split(',').map(at => at.trim()).filter(at => at) : [];
    const firstAccommodationType = accommodationTypesList.length > 0 ? getAccommodationTypeData(accommodationTypesList[0]) : null;
    
    // Create carousel HTML if multiple images
    const carouselHTML = images.length > 1 ? `
        <div class="hotel-carousel" data-hotel-id="${hotel.id}">
            ${images.map((img, idx) => `
                <div class="carousel-slide ${idx === 0 ? 'active' : ''}" style="display: ${idx === 0 ? 'block' : 'none'};">
                    <img src="${img}" alt="${name}" onerror="this.src='https://via.placeholder.com/300x200'">
                </div>
            `).join('')}
            ${images.length > 1 ? `
                <button class="carousel-btn prev" onclick="event.stopPropagation(); prevImage('${hotel.id}')">
                    <i class="fas fa-chevron-left"></i>
                </button>
                <button class="carousel-btn next" onclick="event.stopPropagation(); nextImage('${hotel.id}')">
                    <i class="fas fa-chevron-right"></i>
                </button>
                <div class="carousel-indicators">
                    ${images.map((_, idx) => `<span class="indicator ${idx === 0 ? 'active' : ''}" onclick="event.stopPropagation(); goToSlide('${hotel.id}', ${idx})"></span>`).join('')}
                </div>
            ` : ''}
            ${hotel.maxGuests ? `<span class="guests-badge"><i class="fas fa-users"></i> ${hotel.maxGuests} คน</span>` : ''}
            ${firstAccommodationType ? `<span class="accommodation-badge" style="background: ${firstAccommodationType.color || '#667eea'};">
                <i class="fas ${firstAccommodationType.icon || 'fa-hotel'}"></i> ${firstAccommodationType.nameTh || firstAccommodationType.nameEn}
            </span>` : ''}
        </div>
    ` : `
        <div class="hotel-image">
            <img src="${images[0]}" alt="${name}" onerror="this.src='https://via.placeholder.com/300x200'">
            ${hotel.maxGuests ? `<span class="guests-badge"><i class="fas fa-users"></i> ${hotel.maxGuests} คน</span>` : ''}
            ${firstAccommodationType ? `<span class="accommodation-badge" style="background: ${firstAccommodationType.color || '#667eea'};">
                <i class="fas ${firstAccommodationType.icon || 'fa-hotel'}"></i> ${firstAccommodationType.nameTh || firstAccommodationType.nameEn}
            </span>` : ''}
        </div>
    `;
    
    return `
        <div class="hotel-card" data-hotel-id="${hotel.id}">
            ${carouselHTML}
            <div class="hotel-info">
                <h3 class="hotel-name">${name}</h3>
                ${nameEn ? `<p class="hotel-name-en">${nameEn}</p>` : ''}
                <div class="hotel-price">
                    <i class="fas fa-tag"></i>
                    <span>${price.toLocaleString('th-TH')} ${priceEnd > price ? '- ' + priceEnd.toLocaleString('th-TH') : ''} บาท</span>
                </div>
                ${displayAmenities.length > 0 ? `
                <div class="hotel-features">
                    ${displayAmenities.map(amenityName => {
                        const amenityData = getFilterData(amenityName);
                        return `<span class="feature-badge" style="background: ${amenityData.color};" title="${amenityName}">
                            <i class="fas ${amenityData.icon}"></i> ${amenityName}
                        </span>`;
                    }).join('')}
                    ${remainingCount > 0 ? `<span class="feature-more" title="มีสิ่งอำนวยความสะดวกเพิ่มเติม ${remainingCount} รายการ">+${remainingCount}</span>` : ''}
                </div>
                ` : ''}
                ${displayRoomTypes.length > 0 ? `
                <div class="hotel-room-types">
                    ${displayRoomTypes.map(roomTypeId => {
                        const roomTypeData = getRoomTypeData(roomTypeId);
                        if (!roomTypeData) return '';
                        return `<span class="room-type-badge" style="background: ${roomTypeData.color || '#667eea'};" title="${roomTypeData.nameTh || roomTypeId}">
                            <i class="fas ${roomTypeData.icon || 'fa-bed'}"></i> ${roomTypeData.nameTh || roomTypeId}
                        </span>`;
                    }).join('')}
                    ${remainingRoomTypesCount > 0 ? `<span class="feature-more" title="มีประเภทห้องพักเพิ่มเติม ${remainingRoomTypesCount} รายการ">+${remainingRoomTypesCount}</span>` : ''}
                </div>
                ` : ''}
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
    
    // Get hotel name
    const hotelName = buttonElement?.dataset.hotelName || 'โรงแรมนี้';
    
    // Show beautiful confirmation popup
    const confirmed = await showFollowPopup(
        'ยืนยันการเลิกติดตาม',
        `ต้องการเลิกติดตาม "${hotelName}" หรือไม่?`,
        true
    );
    
    if (!confirmed) {
        return; // User cancelled
    }

    try {
        const response = await fetch(`/api/unfollow-hotel/${hotelId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            // Show success message
            showFollowMessage('เลิกติดตามโรงแรมเรียบร้อยแล้ว', 'info');
            
            // Remove hotel from list
            followedHotels = followedHotels.filter(h => h.hotel_id !== hotelId);
            
            // Update count
            const count = followedHotels.length;
            document.getElementById('followedCount').textContent = count;
            document.getElementById('followedCountText').textContent = count;
            
            // Update badge count in menu (if exists)
            updateFollowCountBadge(count);

            // Reload display
            if (count === 0) {
                document.getElementById('followedHotelsGrid').innerHTML = '';
                document.getElementById('emptyFollowed').style.display = 'block';
            } else {
                displayFollowedHotels();
            }
        } else {
            showFollowMessage('เกิดข้อผิดพลาดในการเลิกติดตามโรงแรม', 'error');
        }
    } catch (error) {
        console.error('Error unfollowing hotel:', error);
        showFollowMessage('เกิดข้อผิดพลาดในการเลิกติดตามโรงแรม', 'error');
    }
}

// Update follow count badge
function updateFollowCountBadge(count) {
    const badge = document.getElementById('followCountBadge');
    if (badge) {
        badge.textContent = count;
        badge.style.display = count > 0 ? 'inline-block' : 'none';
    }
}

// Show follow success/info message
function showFollowMessage(message, type = 'success') {
    // Remove existing message if any
    const existingMsg = document.querySelector('.follow-message');
    if (existingMsg) {
        existingMsg.remove();
    }
    
    // Create message element
    const msgDiv = document.createElement('div');
    msgDiv.className = `follow-message ${type}`;
    msgDiv.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(msgDiv);
    
    // Trigger animation
    setTimeout(() => msgDiv.classList.add('show'), 10);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        msgDiv.classList.remove('show');
        setTimeout(() => msgDiv.remove(), 300);
    }, 3000);
}

// Show beautiful confirmation popup
function showFollowPopup(title, message, isUnfollow = false) {
    return new Promise((resolve) => {
        const popup = document.getElementById('followPopup');
        const popupTitle = document.getElementById('popupTitle');
        const popupMessage = document.getElementById('popupMessage');
        const confirmBtn = document.getElementById('popupConfirmBtn');
        const cancelBtn = document.getElementById('popupCancelBtn');
        
        // Set content
        popupTitle.textContent = title;
        popupMessage.innerHTML = message.replace(/\n/g, '<br>');
        
        // Add/remove unfollow class for different styling
        if (isUnfollow) {
            popup.classList.add('unfollow');
        } else {
            popup.classList.remove('unfollow');
        }
        
        // Show popup
        popup.classList.add('show');
        
        // Handle confirm
        const handleConfirm = () => {
            popup.classList.remove('show');
            cleanup();
            resolve(true);
        };
        
        // Handle cancel
        const handleCancel = () => {
            popup.classList.remove('show');
            cleanup();
            resolve(false);
        };
        
        // Handle overlay click
        const handleOverlayClick = (e) => {
            if (e.target === popup) {
                handleCancel();
            }
        };
        
        // Handle Escape key
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                handleCancel();
            }
        };
        
        // Cleanup function
        const cleanup = () => {
            confirmBtn.removeEventListener('click', handleConfirm);
            cancelBtn.removeEventListener('click', handleCancel);
            popup.removeEventListener('click', handleOverlayClick);
            document.removeEventListener('keydown', handleEscape);
        };
        
        // Add event listeners
        confirmBtn.addEventListener('click', handleConfirm);
        cancelBtn.addEventListener('click', handleCancel);
        popup.addEventListener('click', handleOverlayClick);
        document.addEventListener('keydown', handleEscape);
    });
}

// Show hotel modal (same as main page)
async function showHotelModal(hotel) {
    if (!hotel) return;
    
    // Track click
    try {
        await fetch(`/api/hotels/${hotel.id}/click`, { method: 'POST' });
    } catch (error) {
        console.error('Error tracking click:', error);
    }
    
    // Get click count
    let clicks = 0;
    try {
        const response = await fetch(`/api/hotels/${hotel.id}/clicks`);
        const data = await response.json();
        clicks = data.clicks || 0;
    } catch (error) {
        console.error('Error fetching clicks:', error);
    }
    
    const modal = document.getElementById('hotelModal');
    const modalContent = document.getElementById('modalContent');

    const filters = hotel.filters ? hotel.filters.split(',').map(f => f.trim()).filter(f => f) : [];
    const roomTypesList = hotel.roomTypes ? hotel.roomTypes.split(',').map(rt => rt.trim()).filter(rt => rt) : [];
    const name = hotel.nameTh || hotel.nameEn || 'ไม่มีชื่อ';
    const nameEn = hotel.nameTh && hotel.nameEn ? hotel.nameEn : '';
    
    // Get all images
    const images = hotel.images && hotel.images.length > 0 ? hotel.images : [hotel.imageUrl || 'https://via.placeholder.com/600x400'];
    
    // Get accommodation type data
    const accommodationTypesList = hotel.accommodationTypes ? hotel.accommodationTypes.split(',').map(at => at.trim()).filter(at => at) : [];
    const firstAccommodationType = accommodationTypesList.length > 0 ? getAccommodationTypeData(accommodationTypesList[0]) : null;
    
    // Create carousel HTML for modal
    const modalImageHTML = images.length > 1 ? `
        <div class="modal-carousel" data-hotel-id="${hotel.id}">
            ${images.map((img, idx) => `
                <div class="modal-carousel-slide ${idx === 0 ? 'active' : ''}" style="display: ${idx === 0 ? 'block' : 'none'};">
                    <img src="${img}" alt="${name}" onerror="this.src='https://via.placeholder.com/600x400'">
                </div>
            `).join('')}
            ${images.length > 1 ? `
                <button class="modal-carousel-btn prev" onclick="event.stopPropagation(); prevModalImage('${hotel.id}')">
                    <i class="fas fa-chevron-left"></i>
                </button>
                <button class="modal-carousel-btn next" onclick="event.stopPropagation(); nextModalImage('${hotel.id}')">
                    <i class="fas fa-chevron-right"></i>
                </button>
                <div class="modal-carousel-indicators">
                    ${images.map((_, idx) => `<span class="modal-indicator ${idx === 0 ? 'active' : ''}" onclick="event.stopPropagation(); goToModalSlide('${hotel.id}', ${idx})"></span>`).join('')}
                </div>
            ` : ''}
            ${firstAccommodationType ? `<span class="modal-accommodation-badge" style="background: ${firstAccommodationType.color || '#667eea'};">
                <i class="fas ${firstAccommodationType.icon || 'fa-hotel'}"></i> ${firstAccommodationType.nameTh || firstAccommodationType.nameEn}
            </span>` : ''}
        </div>
    ` : `
        <div class="detail-image">
            <img src="${images[0]}" alt="${name}" onerror="this.src='https://via.placeholder.com/600x400'">
            ${firstAccommodationType ? `<span class="modal-accommodation-badge" style="background: ${firstAccommodationType.color || '#667eea'};">
                <i class="fas ${firstAccommodationType.icon || 'fa-hotel'}"></i> ${firstAccommodationType.nameTh || firstAccommodationType.nameEn}
            </span>` : ''}
        </div>
    `;

    modalContent.innerHTML = `
        <div class="hotel-detail">
            <div class="detail-header">
                <h2>${name}</h2>
                ${nameEn ? `<p class="detail-name-en">${nameEn}</p>` : ''}
                <div class="detail-stats">
                    <span class="stat-item">
                        <i class="fas fa-eye"></i> 
                        ${clicks.toLocaleString('th-TH')} ครั้ง
                    </span>
                    <span class="stat-item">
                        <i class="fas fa-tag"></i> 
                        ${hotel.id}
                    </span>
                </div>
            </div>
            
            ${modalImageHTML}
            
            <div class="detail-info">
                <div class="info-row">
                    <div class="info-item">
                        <i class="fas fa-tag"></i>
                        <div>
                            <strong>ราคา</strong>
                            <p>${(hotel.priceStart || 0).toLocaleString('th-TH')} - ${(hotel.priceEnd || hotel.priceStart || 0).toLocaleString('th-TH')} บาท</p>
                        </div>
                    </div>
                    
                    ${hotel.maxGuests ? `
                    <div class="info-item">
                        <i class="fas fa-users"></i>
                        <div>
                            <strong>รองรับผู้เข้าพัก</strong>
                            <p>${hotel.maxGuests} คน</p>
                        </div>
                    </div>
                    ` : ''}
                </div>
                
                <div class="info-row">
                    <div class="info-item">
                        <i class="fas fa-phone"></i>
                        <div>
                            <strong>โทรศัพท์</strong>
                            <p><a href="tel:${hotel.phone}">${hotel.phone || '-'}</a></p>
                        </div>
                    </div>
                </div>
                
                ${hotel.lineId || hotel.facebookUrl || hotel.websiteUrl ? `
                <div class="contact-links">
                    <strong><i class="fas fa-link"></i> ช่องทางติดต่อ</strong>
                    <div class="links">
                        ${hotel.lineId ? `<a href="https://line.me/ti/p/~${hotel.lineId.replace('@', '')}" target="_blank" class="link-btn line"><i class="fab fa-line"></i> Line</a>` : ''}
                        ${hotel.facebookUrl ? `<a href="${hotel.facebookUrl}" target="_blank" class="link-btn facebook"><i class="fab fa-facebook"></i> Facebook</a>` : ''}
                        ${hotel.websiteUrl ? `<a href="${hotel.websiteUrl}" target="_blank" class="link-btn website"><i class="fas fa-globe"></i> เว็บไซต์</a>` : ''}
                    </div>
                </div>
                ` : ''}
                
                ${filters.length > 0 ? `
                <div class="facilities">
                    <strong><i class="fas fa-check-circle"></i> สิ่งอำนวยความสะดวก</strong>
                    <div class="facility-tags">
                        ${filters.map(f => {
                            const filterData = getFilterData(f);
                            return `<span class="facility-tag" style="background: ${filterData.color};"><i class="fas ${filterData.icon}"></i> ${f}</span>`;
                        }).join('')}
                    </div>
                </div>
                ` : ''}
                
                ${roomTypesList.length > 0 ? `
                <div class="facilities">
                    <strong><i class="fas fa-bed"></i> ประเภทห้องพัก</strong>
                    <div class="facility-tags">
                        ${roomTypesList.map(rtId => {
                            const roomTypeData = getRoomTypeData(rtId);
                            if (!roomTypeData) return '';
                            return `<span class="facility-tag" style="background: ${roomTypeData.color || '#667eea'};"><i class="fas ${roomTypeData.icon || 'fa-bed'}"></i> ${roomTypeData.nameTh || rtId}</span>`;
                        }).join('')}
                    </div>
                </div>
                ` : ''}
                
                ${hotel.bankName || hotel.accountName || hotel.accountNumber ? `
                <div class="bank-info">
                    <strong><i class="fas fa-university"></i> ข้อมูลบัญชีธนาคาร</strong>
                    ${hotel.bankName ? `<p><i class="fas fa-building"></i> <strong>ธนาคาร:</strong> ${hotel.bankName}</p>` : ''}
                    ${hotel.accountName ? `<p><i class="fas fa-user"></i> <strong>ชื่อบัญชี:</strong> ${hotel.accountName}</p>` : ''}
                    ${hotel.accountNumber ? `<p><i class="fas fa-credit-card"></i> <strong>เลขที่บัญชี:</strong> ${hotel.accountNumber}</p>` : ''}
                </div>
                ` : ''}
            </div>
        </div>
    `;

    modal.classList.add('show');
}

// ==================== HELPER FUNCTIONS ====================

// Load filters data
async function loadFiltersData() {
    if (allFilters.length === 0) {
        try {
            const response = await fetch('/api/filters');
            const data = await response.json();
            if (data.success && data.data) {
                allFilters = data.data;
            }
        } catch (error) {
            console.error('Error loading filters:', error);
        }
    }
}

// Load room types data
async function loadRoomTypesData() {
    if (allRoomTypes.length === 0) {
        try {
            const response = await fetch('/api/room-types');
            const data = await response.json();
            if (data.success && data.data) {
                allRoomTypes = data.data;
            }
        } catch (error) {
            console.error('Error loading room types:', error);
        }
    }
}

// Load accommodation types data
async function loadAccommodationTypesData() {
    if (allAccommodationTypes.length === 0) {
        try {
            const response = await fetch('/api/accommodation-types');
            const data = await response.json();
            if (data.success && data.data) {
                allAccommodationTypes = data.data;
            }
        } catch (error) {
            console.error('Error loading accommodation types:', error);
        }
    }
}

// Get filter data by name
function getFilterData(filterName) {
    const filter = allFilters.find(f => f.nameTh === filterName || f.nameEn === filterName);
    return filter || {
        nameTh: filterName,
        nameEn: filterName,
        icon: 'fa-check',
        color: '#95a5a6'
    };
}

// Get room type data by ID
function getRoomTypeData(roomTypeId) {
    return allRoomTypes.find(rt => rt.id === roomTypeId);
}

// Get accommodation type data by ID
function getAccommodationTypeData(accommodationTypeId) {
    return allAccommodationTypes.find(at => at.id === accommodationTypeId);
}

// Carousel navigation for cards
function nextImage(hotelId) {
    const carousel = document.querySelector(`.hotel-carousel[data-hotel-id="${hotelId}"]`);
    if (!carousel) return;
    
    const slides = carousel.querySelectorAll('.carousel-slide');
    const indicators = carousel.querySelectorAll('.indicator');
    let currentIndex = Array.from(slides).findIndex(slide => slide.classList.contains('active'));
    
    slides[currentIndex].classList.remove('active');
    slides[currentIndex].style.display = 'none';
    indicators[currentIndex].classList.remove('active');
    
    const nextIndex = (currentIndex + 1) % slides.length;
    slides[nextIndex].classList.add('active');
    slides[nextIndex].style.display = 'block';
    indicators[nextIndex].classList.add('active');
}

function prevImage(hotelId) {
    const carousel = document.querySelector(`.hotel-carousel[data-hotel-id="${hotelId}"]`);
    if (!carousel) return;
    
    const slides = carousel.querySelectorAll('.carousel-slide');
    const indicators = carousel.querySelectorAll('.indicator');
    let currentIndex = Array.from(slides).findIndex(slide => slide.classList.contains('active'));
    
    slides[currentIndex].classList.remove('active');
    slides[currentIndex].style.display = 'none';
    indicators[currentIndex].classList.remove('active');
    
    const prevIndex = currentIndex === 0 ? slides.length - 1 : currentIndex - 1;
    slides[prevIndex].classList.add('active');
    slides[prevIndex].style.display = 'block';
    indicators[prevIndex].classList.add('active');
}

function goToSlide(hotelId, index) {
    const carousel = document.querySelector(`.hotel-carousel[data-hotel-id="${hotelId}"]`);
    if (!carousel) return;
    
    const slides = carousel.querySelectorAll('.carousel-slide');
    const indicators = carousel.querySelectorAll('.indicator');
    
    slides.forEach(slide => {
        slide.classList.remove('active');
        slide.style.display = 'none';
    });
    indicators.forEach(ind => ind.classList.remove('active'));
    
    slides[index].classList.add('active');
    slides[index].style.display = 'block';
    indicators[index].classList.add('active');
}

// Modal carousel navigation
function nextModalImage(hotelId) {
    const carousel = document.querySelector(`.modal-carousel[data-hotel-id="${hotelId}"]`);
    if (!carousel) return;
    
    const slides = carousel.querySelectorAll('.modal-carousel-slide');
    const indicators = carousel.querySelectorAll('.modal-indicator');
    let currentIndex = Array.from(slides).findIndex(slide => slide.classList.contains('active'));
    
    slides[currentIndex].classList.remove('active');
    slides[currentIndex].style.display = 'none';
    indicators[currentIndex].classList.remove('active');
    
    const nextIndex = (currentIndex + 1) % slides.length;
    slides[nextIndex].classList.add('active');
    slides[nextIndex].style.display = 'block';
    indicators[nextIndex].classList.add('active');
}

function prevModalImage(hotelId) {
    const carousel = document.querySelector(`.modal-carousel[data-hotel-id="${hotelId}"]`);
    if (!carousel) return;
    
    const slides = carousel.querySelectorAll('.modal-carousel-slide');
    const indicators = carousel.querySelectorAll('.modal-indicator');
    let currentIndex = Array.from(slides).findIndex(slide => slide.classList.contains('active'));
    
    slides[currentIndex].classList.remove('active');
    slides[currentIndex].style.display = 'none';
    indicators[currentIndex].classList.remove('active');
    
    const prevIndex = currentIndex === 0 ? slides.length - 1 : currentIndex - 1;
    slides[prevIndex].classList.add('active');
    slides[prevIndex].style.display = 'block';
    indicators[prevIndex].classList.add('active');
}

function goToModalSlide(hotelId, index) {
    const carousel = document.querySelector(`.modal-carousel[data-hotel-id="${hotelId}"]`);
    if (!carousel) return;
    
    const slides = carousel.querySelectorAll('.modal-carousel-slide');
    const indicators = carousel.querySelectorAll('.modal-indicator');
    
    slides.forEach(slide => {
        slide.classList.remove('active');
        slide.style.display = 'none';
    });
    indicators.forEach(ind => ind.classList.remove('active'));
    
    slides[index].classList.add('active');
    slides[index].style.display = 'block';
    indicators[index].classList.add('active');
}

// Load reference data on page load
(async function() {
    await Promise.all([
        loadFiltersData(),
        loadRoomTypesData(),
        loadAccommodationTypesData()
    ]);
})();

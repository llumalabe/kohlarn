// Global variables
let allHotels = [];
let filteredHotels = [];
let allFilters = [];
let activeFilters = {
    search: '',
    features: [],
    minPrice: 0,
    maxPrice: 100000,
    maxGuests: 1
};

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    loadFilters();
    loadHotels();
    setupEventListeners();
});

// Load filters from API
async function loadFilters() {
    try {
        const response = await fetch('/api/filters');
        const data = await response.json();
        
        if (data.success && data.data) {
            allFilters = data.data;
            displayFilterButtons();
        } else {
            document.getElementById('filterButtons').innerHTML = '<p style="color: #999;">ไม่พบตัวกรอง</p>';
        }
    } catch (error) {
        console.error('Error loading filters:', error);
        document.getElementById('filterButtons').innerHTML = '<p style="color: #e74c3c;">เกิดข้อผิดพลาดในการโหลดตัวกรอง</p>';
    }
}

// Display filter buttons
function displayFilterButtons() {
    const container = document.getElementById('filterButtons');
    
    if (allFilters.length === 0) {
        container.innerHTML = '<p style="color: #999;">ไม่มีตัวกรอง</p>';
        return;
    }
    
    container.innerHTML = allFilters.map(filter => `
        <button class="filter-btn" data-filter="${filter.nameTh}" title="${filter.nameEn}">
            <i class="fas ${filter.icon}"></i> ${filter.nameTh}
        </button>
    `).join('');
    
    // Add event listeners to new buttons
    container.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const filter = btn.dataset.filter;
            btn.classList.toggle('active');
            
            if (btn.classList.contains('active')) {
                activeFilters.features.push(filter);
            } else {
                activeFilters.features = activeFilters.features.filter(f => f !== filter);
            }
            
            filterHotels();
        });
    });
}

// Setup event listeners
function setupEventListeners() {
    // Search input
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', (e) => {
        activeFilters.search = e.target.value.toLowerCase().trim();
        filterHotels();
    });

    // Price filters
    const minPrice = document.getElementById('minPrice');
    const maxPrice = document.getElementById('maxPrice');
    
    minPrice.addEventListener('input', (e) => {
        activeFilters.minPrice = parseInt(e.target.value) || 0;
        filterHotels();
    });
    
    maxPrice.addEventListener('input', (e) => {
        activeFilters.maxPrice = parseInt(e.target.value) || 100000;
        filterHotels();
    });

    // Guests filter
    const maxGuests = document.getElementById('maxGuests');
    maxGuests.addEventListener('input', (e) => {
        activeFilters.maxGuests = parseInt(e.target.value) || 1;
        filterHotels();
    });

    // Clear filters
    const clearFilters = document.getElementById('clearFilters');
    clearFilters.addEventListener('click', () => {
        // Reset UI
        searchInput.value = '';
        document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
        minPrice.value = 0;
        maxPrice.value = 100000;
        maxGuests.value = 1;
        
        // Reset filters
        activeFilters = {
            search: '',
            features: [],
            minPrice: 0,
            maxPrice: 100000,
            maxGuests: 1
        };
        
        filterHotels();
    });

    // Modal close
    const modal = document.getElementById('hotelModal');
    const closeBtn = modal.querySelector('.close');
    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });
    
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
}

// Load hotels from API
async function loadHotels() {
    try {
        const response = await fetch('/api/hotels');
        const data = await response.json();
        
        if (data.success && data.data) {
            allHotels = data.data;
            filteredHotels = [...allHotels];
            displayHotels(filteredHotels);
            updateResultCount();
        } else {
            showError('ไม่สามารถโหลดข้อมูลโรงแรมได้');
        }
    } catch (error) {
        console.error('Error loading hotels:', error);
        showError('เกิดข้อผิดพลาดในการโหลดข้อมูล');
    }
}

// Filter hotels
function filterHotels() {
    filteredHotels = allHotels.filter(hotel => {
        // Search filter - ค้นหา: ชื่อ, รหัส, ชื่อบัญชี, เลขบัญชี
        if (activeFilters.search) {
            const searchLower = activeFilters.search;
            const matchName = (hotel.nameTh && hotel.nameTh.toLowerCase().includes(searchLower)) ||
                            (hotel.nameEn && hotel.nameEn.toLowerCase().includes(searchLower));
            const matchId = hotel.id && hotel.id.toLowerCase().includes(searchLower);
            const matchAccount = hotel.accountName && hotel.accountName.toLowerCase().includes(searchLower);
            const matchAccountNumber = hotel.accountNumber && hotel.accountNumber.includes(searchLower);
            
            if (!matchName && !matchId && !matchAccount && !matchAccountNumber) {
                return false;
            }
        }
        
        // Price filter
        const price = hotel.priceStart || 0;
        if (price < activeFilters.minPrice || price > activeFilters.maxPrice) {
            return false;
        }
        
        // Guests filter
        const maxGuests = hotel.maxGuests || 1;
        if (maxGuests < activeFilters.maxGuests) {
            return false;
        }
        
        // Features filter
        if (activeFilters.features.length > 0) {
            const hotelFilters = hotel.filters ? hotel.filters.split(',').map(f => f.trim()) : [];
            const hasAllFeatures = activeFilters.features.every(feature => 
                hotelFilters.includes(feature)
            );
            if (!hasAllFeatures) {
                return false;
            }
        }
        
        return true;
    });
    
    displayHotels(filteredHotels);
    updateResultCount();
}

// Update result count
function updateResultCount() {
    document.getElementById('resultCount').textContent = filteredHotels.length;
    document.getElementById('totalCount').textContent = allHotels.length;
}

// Display hotels
function displayHotels(hotels) {
    const grid = document.getElementById('hotelsGrid');
    
    if (hotels.length === 0) {
        grid.innerHTML = `
            <div class="no-results">
                <i class="fas fa-search"></i>
                <h3>ไม่พบโรงแรมที่ตรงกับเงื่อนไข</h3>
                <p>ลองเปลี่ยนตัวกรองหรือคำค้นหา</p>
            </div>
        `;
        return;
    }
    
    grid.innerHTML = hotels.map(hotel => createHotelCard(hotel)).join('');
    
    // Add click event listeners
    grid.querySelectorAll('.hotel-card').forEach(card => {
        card.addEventListener('click', () => {
            const hotelId = card.dataset.hotelId;
            openHotelModal(hotelId);
        });
    });
}

// Create hotel card HTML
function createHotelCard(hotel) {
    const name = hotel.nameTh || hotel.nameEn || 'ไม่มีชื่อ';
    const nameEn = hotel.nameTh && hotel.nameEn ? hotel.nameEn : '';
    const price = hotel.priceStart || 0;
    const priceEnd = hotel.priceEnd || price;
    const image = hotel.imageUrl || 'https://via.placeholder.com/300x200';
    const filters = hotel.filters ? hotel.filters.split(',').map(f => f.trim()).slice(0, 3) : [];
    
    return `
        <div class="hotel-card" data-hotel-id="${hotel.id}">
            <div class="hotel-image">
                <img src="${image}" alt="${name}" onerror="this.src='https://via.placeholder.com/300x200'">
                ${hotel.maxGuests ? `<span class="guests-badge"><i class="fas fa-users"></i> ${hotel.maxGuests} คน</span>` : ''}
            </div>
            <div class="hotel-info">
                <h3 class="hotel-name">${name}</h3>
                ${nameEn ? `<p class="hotel-name-en">${nameEn}</p>` : ''}
                <div class="hotel-price">
                    <i class="fas fa-tag"></i>
                    <span>${price.toLocaleString('th-TH')} ${priceEnd > price ? '- ' + priceEnd.toLocaleString('th-TH') : ''} บาท</span>
                </div>
                ${filters.length > 0 ? `
                <div class="hotel-features">
                    ${filters.map(f => `<span class="feature-badge">${f}</span>`).join('')}
                    ${hotel.filters.split(',').length > 3 ? `<span class="feature-more">+${hotel.filters.split(',').length - 3}</span>` : ''}
                </div>
                ` : ''}
                <div class="hotel-footer">
                    <span class="hotel-id"><i class="fas fa-tag"></i> ${hotel.id}</span>
                    <span class="view-details">ดูรายละเอียด <i class="fas fa-arrow-right"></i></span>
                </div>
            </div>
        </div>
    `;
}

// Open hotel modal and track click
async function openHotelModal(hotelId) {
    const hotel = allHotels.find(h => h.id === hotelId);
    if (!hotel) return;
    
    // Track click
    try {
        await fetch(`/api/hotels/${hotelId}/click`, { method: 'POST' });
    } catch (error) {
        console.error('Error tracking click:', error);
    }
    
    // Get click count
    let clicks = 0;
    try {
        const response = await fetch(`/api/hotels/${hotelId}/clicks`);
        const data = await response.json();
        clicks = data.clicks || 0;
    } catch (error) {
        console.error('Error fetching clicks:', error);
    }
    
    // Display modal
    const modal = document.getElementById('hotelModal');
    const modalContent = document.getElementById('modalContent');
    
    const filters = hotel.filters ? hotel.filters.split(',').map(f => f.trim()).filter(f => f) : [];
    const name = hotel.nameTh || hotel.nameEn || 'ไม่มีชื่อ';
    const nameEn = hotel.nameTh && hotel.nameEn ? hotel.nameEn : '';
    
    modalContent.innerHTML = `
        <div class="hotel-detail">
            <div class="detail-header">
                <h2>${name}</h2>
                ${nameEn ? `<p class="detail-name-en">${nameEn}</p>` : ''}
                <div class="detail-stats">
                    <span class="stat-item"><i class="fas fa-eye"></i> ${clicks.toLocaleString('th-TH')} ครั้ง</span>
                    <span class="stat-item"><i class="fas fa-tag"></i> ${hotel.id}</span>
                </div>
            </div>
            
            <div class="detail-image">
                <img src="${hotel.imageUrl || 'https://via.placeholder.com/600x400'}" alt="${name}" onerror="this.src='https://via.placeholder.com/600x400'">
            </div>
            
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
                        <i class="fas fa-user-tie"></i>
                        <div>
                            <strong>เจ้าของ</strong>
                            <p>${hotel.ownerName || '-'}</p>
                        </div>
                    </div>
                    
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
                        ${filters.map(f => `<span class="facility-tag">${f}</span>`).join('')}
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
    
    modal.style.display = 'flex';
}

// Show error
function showError(message) {
    const grid = document.getElementById('hotelsGrid');
    grid.innerHTML = `
        <div class="error-message">
            <i class="fas fa-exclamation-circle"></i>
            <h3>${message}</h3>
        </div>
    `;
}

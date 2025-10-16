// Global variables
let allHotels = [];
let filteredHotels = [];
let activeFilters = {
    search: '',
    features: [],
    maxPrice: 10000,
    minGuests: 1
};

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    loadHotels();
    setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
    // Search input
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', (e) => {
        activeFilters.search = e.target.value.toLowerCase();
        filterHotels();
    });

    // Filter buttons
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
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

    // Price filter
    const maxPrice = document.getElementById('maxPrice');
    const priceDisplay = document.getElementById('priceDisplay');
    maxPrice.addEventListener('input', (e) => {
        const value = parseInt(e.target.value);
        priceDisplay.textContent = value.toLocaleString('th-TH');
        activeFilters.maxPrice = value;
        filterHotels();
    });

    // Guests filter
    const minGuests = document.getElementById('minGuests');
    minGuests.addEventListener('input', (e) => {
        activeFilters.minGuests = parseInt(e.target.value);
        filterHotels();
    });

    // Clear filters
    const clearFilters = document.getElementById('clearFilters');
    clearFilters.addEventListener('click', () => {
        // Reset UI
        searchInput.value = '';
        filterButtons.forEach(btn => btn.classList.remove('active'));
        maxPrice.value = 10000;
        priceDisplay.textContent = '10,000';
        minGuests.value = 1;
        
        // Reset filters
        activeFilters = {
            search: '',
            features: [],
            maxPrice: 10000,
            minGuests: 1
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
        
        if (data.success) {
            allHotels = data.data;
            filteredHotels = [...allHotels];
            
            // Load likes for all hotels
            await loadAllLikes();
            
            displayHotels();
        } else {
            showError('ไม่สามารถโหลดข้อมูลโรงแรมได้');
        }
    } catch (error) {
        console.error('Error loading hotels:', error);
        showError('เกิดข้อผิดพลาดในการโหลดข้อมูล');
    }
}

// Load likes for all hotels
async function loadAllLikes() {
    const promises = allHotels.map(hotel => 
        fetch(`/api/hotels/${hotel.id}/likes`)
            .then(res => res.json())
            .then(data => {
                hotel.likes = data.likes || 0;
            })
            .catch(() => {
                hotel.likes = 0;
            })
    );
    
    await Promise.all(promises);
}

// Filter hotels
function filterHotels() {
    filteredHotels = allHotels.filter(hotel => {
        // Search filter
        if (activeFilters.search) {
            const searchTerms = [
                hotel.nameTh,
                hotel.nameEn,
                hotel.priceStart.toString(),
                hotel.bankName,
                hotel.accountName,
                hotel.accountNumber
            ].join(' ').toLowerCase();
            
            if (!searchTerms.includes(activeFilters.search)) {
                return false;
            }
        }
        
        // Feature filters
        for (const feature of activeFilters.features) {
            if (!hotel[feature]) {
                return false;
            }
        }
        
        // Price filter
        if (hotel.priceStart > activeFilters.maxPrice) {
            return false;
        }
        
        // Guests filter
        if (hotel.maxGuests < activeFilters.minGuests) {
            return false;
        }
        
        return true;
    });
    
    displayHotels();
}

// Display hotels
function displayHotels() {
    const grid = document.getElementById('hotelsGrid');
    const resultCount = document.getElementById('resultCount');
    
    resultCount.textContent = filteredHotels.length;
    
    if (filteredHotels.length === 0) {
        grid.innerHTML = `
            <div class="loading">
                <i class="fas fa-search"></i>
                <p>ไม่พบโรงแรมที่ตรงกับเงื่อนไขการค้นหา</p>
            </div>
        `;
        return;
    }
    
    grid.innerHTML = filteredHotels.map(hotel => createHotelCard(hotel)).join('');
    
    // Add event listeners to like buttons
    document.querySelectorAll('.like-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            likeHotel(btn.dataset.hotelId);
        });
    });
    
    // Add event listeners to view details buttons
    document.querySelectorAll('.view-details').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent card click event
            const hotelId = btn.dataset.hotelId;
            // Record click
            recordHotelClick(hotelId);
            // Show details
            showHotelDetails(hotelId);
        });
    });
    
    // Add click event to cards
    document.querySelectorAll('.hotel-card').forEach(card => {
        card.addEventListener('click', () => {
            const hotelId = card.dataset.hotelId;
            // Record click
            recordHotelClick(hotelId);
            // Show details
            showHotelDetails(hotelId);
        });
    });
}

// Record hotel card click
async function recordHotelClick(hotelId) {
    try {
        await fetch(`/api/hotels/${hotelId}/click`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        // Silent - no need to show anything to user
    } catch (error) {
        // Silent error - don't interrupt user experience
        console.log('Click tracking failed:', error);
    }
}

// Create hotel card HTML
function createHotelCard(hotel) {
    const features = [];
    if (hotel.beachfront) features.push('ติดทะเล');
    if (hotel.breakfast) features.push('รวมอาหารเช้า');
    if (hotel.freeShuttle) features.push('ฟรีรถรับส่ง');
    if (hotel.freeMotorcycle) features.push('ฟรีมอไซค์');
    if (hotel.bathtub) features.push('อ่างอาบน้ำ');
    if (hotel.poolVilla) features.push('พลูวิลล่า');
    if (hotel.poolTable) features.push('โต๊ะพลู');
    
    const imageUrl = Array.isArray(hotel.images) ? hotel.images[0] : hotel.images.split(',')[0].trim();
    
    return `
        <div class="hotel-card" data-hotel-id="${hotel.id}">
            <img src="${imageUrl}" alt="${hotel.nameTh}" class="hotel-image" onerror="this.src='https://via.placeholder.com/400x300?text=No+Image'">
            <div class="hotel-info">
                <div class="hotel-name">${hotel.nameTh}</div>
                <div class="hotel-name-en">${hotel.nameEn}</div>
                <div class="hotel-price">
                    ฿${hotel.priceStart.toLocaleString('th-TH')}
                    <small>/ คืน</small>
                </div>
                <div class="hotel-features">
                    ${features.slice(0, 3).map(f => `<span class="feature-tag">${f}</span>`).join('')}
                    ${features.length > 3 ? `<span class="feature-tag">+${features.length - 3}</span>` : ''}
                </div>
                <div class="hotel-actions">
                    <button class="like-btn" data-hotel-id="${hotel.id}">
                        <i class="fas fa-heart"></i>
                        <span>${hotel.likes || 0}</span>
                    </button>
                    <button class="view-details" data-hotel-id="${hotel.id}">
                        ดูรายละเอียด
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Like hotel
async function likeHotel(hotelId) {
    try {
        const response = await fetch(`/api/hotels/${hotelId}/like`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Update local data
            const hotel = allHotels.find(h => h.id === hotelId);
            if (hotel) {
                hotel.likes = data.likes;
            }
            
            // Update UI
            const likeBtn = document.querySelector(`.like-btn[data-hotel-id="${hotelId}"]`);
            if (likeBtn) {
                likeBtn.classList.add('liked');
                likeBtn.querySelector('span').textContent = data.likes;
            }
            
            showSuccess('❤️ ขอบคุณที่กดหัวใจ!');
        } else {
            showError(data.error || 'ไม่สามารถกดหัวใจได้');
        }
    } catch (error) {
        console.error('Error liking hotel:', error);
        showError('เกิดข้อผิดพลาด');
    }
}

// Show hotel details
function showHotelDetails(hotelId) {
    const hotel = allHotels.find(h => h.id === hotelId);
    if (!hotel) return;
    
    const modal = document.getElementById('hotelModal');
    const modalContent = document.getElementById('modalContent');
    
    const images = Array.isArray(hotel.images) ? hotel.images : hotel.images.split(',').map(img => img.trim());
    
    const features = [];
    if (hotel.beachfront) features.push('🏖️ ติดทะเล');
    if (hotel.breakfast) features.push('☕ รวมอาหารเช้า');
    if (hotel.freeShuttle) features.push('🚐 ฟรีรถรับส่ง');
    if (hotel.freeMotorcycle) features.push('🏍️ ฟรีมอไซค์');
    if (hotel.bathtub) features.push('🛁 มีอ่างอาบน้ำ');
    if (hotel.poolVilla) features.push('🏊 พลูวิลล่า');
    if (hotel.poolTable) features.push('🎱 โต๊ะพลู');
    
    modalContent.innerHTML = `
        <h2>${hotel.nameTh}</h2>
        <p style="color: #636e72; margin-bottom: 20px;">${hotel.nameEn}</p>
        
        <div class="modal-images">
            ${images.map(img => `<img src="${img}" alt="${hotel.nameTh}" onerror="this.style.display='none'">`).join('')}
        </div>
        
        <div class="modal-section">
            <h3>💰 ราคา</h3>
            <p style="font-size: 1.5rem; color: var(--primary-color); font-weight: bold;">
                ฿${hotel.priceStart.toLocaleString('th-TH')} / คืน
            </p>
        </div>
        
        <div class="modal-section">
            <h3>✨ สิ่งอำนวยความสะดวก</h3>
            <p>${features.join(' • ')}</p>
            <p>👥 รองรับผู้เข้าพักสูงสุด: ${hotel.maxGuests} คน</p>
        </div>
        
        ${hotel.bankName ? `
        <div class="modal-section">
            <h3>🏦 ข้อมูลธนาคาร</h3>
            <p><strong>ธนาคาร:</strong> ${hotel.bankName}</p>
            <p><strong>ชื่อบัญชี:</strong> ${hotel.accountName}</p>
            <p><strong>เลขบัญชี:</strong> ${hotel.accountNumber}</p>
        </div>
        ` : ''}
        
        <div class="modal-section">
            <h3>📞 ติดต่อโรงแรม</h3>
            <div class="contact-links">
                ${hotel.phone ? `<a href="tel:${hotel.phone}"><i class="fas fa-phone"></i> ${hotel.phone}</a>` : ''}
                ${hotel.facebook ? `<a href="${hotel.facebook}" target="_blank"><i class="fab fa-facebook"></i> Facebook</a>` : ''}
                ${hotel.line ? `<a href="https://line.me/ti/p/${hotel.line}" target="_blank"><i class="fab fa-line"></i> Line</a>` : ''}
                ${hotel.website ? `<a href="${hotel.website}" target="_blank"><i class="fas fa-globe"></i> Website</a>` : ''}
            </div>
        </div>
        
        ${hotel.mapEmbed ? `
        <div class="modal-section">
            <h3>📍 แผนที่</h3>
            ${hotel.mapEmbed}
        </div>
        ` : hotel.mapUrl ? `
        <div class="modal-section">
            <h3>📍 แผนที่</h3>
            <a href="${hotel.mapUrl}" target="_blank" class="btn btn-primary">
                <i class="fas fa-map-marker-alt"></i> ดูแผนที่ Google Maps
            </a>
        </div>
        ` : ''}
    `;
    
    modal.style.display = 'block';
}

// Show success message
function showSuccess(message) {
    const alert = document.createElement('div');
    alert.className = 'alert alert-success';
    alert.textContent = message;
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
    alert.textContent = message;
    alert.style.position = 'fixed';
    alert.style.top = '20px';
    alert.style.right = '20px';
    alert.style.zIndex = '10000';
    alert.style.animation = 'slideIn 0.3s';
    alert.style.background = '#f8d7da';
    alert.style.color = '#721c24';
    alert.style.padding = '15px 20px';
    alert.style.borderRadius = '8px';
    alert.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
    
    document.body.appendChild(alert);
    
    setTimeout(() => {
        alert.remove();
    }, 3000);
}

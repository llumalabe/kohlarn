// Global variables
let allHotels = [];
let filteredHotels = [];
let allFilters = [];
let allRoomTypes = []; // Room types data
let allAccommodationTypes = []; // Accommodation types data
let webSettings = {}; // Web settings from Google Sheets
let activeFilters = {
    search: '',
    features: [],
    roomTypes: [],
    accommodationTypes: [], // เพิ่มการกรองประเภทที่พัก
    minPrice: 0,
    maxPrice: 100000,
    maxGuests: 1
};

// Current user data
let currentUser = null;

// Pagination and randomization variables
let shuffledHotels = []; // โรงแรมที่ถูกสุ่มลำดับแล้ว
let displayedCount = 0; // จำนวนการ์ดที่แสดงไปแล้ว
const ITEMS_PER_PAGE = 20; // แสดงทีละ 20 การ์ด

// Initialize app
document.addEventListener('DOMContentLoaded', async () => {
    await loadWebSettings(); // Load settings first
    
    // Load data in parallel (but wait for all to complete)
    await Promise.all([
        loadFilters(),
        loadRoomTypes(),
        loadAccommodationTypes()
    ]);
    
    // Load hotels and display filters (hotels loaded last because filters depend on it)
    await loadHotels();
    
    setupEventListeners();
    checkUserLogin(); // Check if user is logged in
    setupLoginHandlers(); // Setup login/logout handlers
});

// Load web settings and apply to page
async function loadWebSettings() {
    try {
        const response = await fetch('/api/websettings');
        webSettings = await response.json();
        
        // Apply settings to page
        applyWebSettings();
    } catch (error) {
        console.error('Error loading web settings:', error);
        // Use defaults if loading fails
        webSettings = {
            site_name_th: 'ค้นหาโรงแรมเกาะล้าน',
            site_name_en: 'Koh Larn Hotel Search Engine',
            header_bg_color: '#ffffff',
            body_bg_gradient_start: '#667eea',
            body_bg_gradient_end: '#764ba2',
            filter_button_bg_start: '#667eea',
            filter_button_bg_end: '#764ba2',
            card_hotel_name_color: '#2d3436',
            card_price_color: '#0066cc'
        };
    }
}

// Apply web settings to DOM
function applyWebSettings() {
    // Site names
    const headerH1 = document.querySelector('header h1');
    const headerSubtitle = document.querySelector('header .subtitle');
    const headerIcon = document.getElementById('headerIcon');
    const headerTitle = document.getElementById('headerTitle');
    
    // Update header icon
    if (headerIcon && webSettings.favicon_emoji) {
        headerIcon.textContent = webSettings.favicon_emoji;
    }
    
    // Update header text
    if (headerTitle && webSettings.site_name_th) {
        headerTitle.textContent = webSettings.site_name_th;
    }
    
    if (headerSubtitle && webSettings.site_name_en) {
        headerSubtitle.textContent = webSettings.site_name_en;
    }
    
    // Update page title
    if (webSettings.site_name_th) {
        document.title = `${webSettings.site_name_th} - ${webSettings.site_name_en}`;
    }
    
    // Apply colors via CSS custom properties
    const root = document.documentElement;
    
    if (webSettings.site_name_th_color) {
        root.style.setProperty('--site-name-th-color', webSettings.site_name_th_color);
    }
    
    if (webSettings.site_name_en_color) {
        root.style.setProperty('--site-name-en-color', webSettings.site_name_en_color);
    }
    
    if (webSettings.header_bg_color) {
        root.style.setProperty('--header-bg-color', webSettings.header_bg_color);
    }
    
    if (webSettings.body_bg_gradient_start && webSettings.body_bg_gradient_end) {
        root.style.setProperty('--body-bg-gradient-start', webSettings.body_bg_gradient_start);
        root.style.setProperty('--body-bg-gradient-end', webSettings.body_bg_gradient_end);
    }
    
    if (webSettings.filter_button_bg_start && webSettings.filter_button_bg_end) {
        root.style.setProperty('--filter-btn-bg-start', webSettings.filter_button_bg_start);
        root.style.setProperty('--filter-btn-bg-end', webSettings.filter_button_bg_end);
    }
    
    if (webSettings.card_hotel_name_color) {
        root.style.setProperty('--card-hotel-name-color', webSettings.card_hotel_name_color);
    }
    
    if (webSettings.card_price_color) {
        root.style.setProperty('--card-price-color', webSettings.card_price_color);
    }
    
    // Update favicon
    updateFavicon();
}

// Update favicon dynamically
function updateFavicon() {
    const faviconType = webSettings.favicon_type || 'emoji';
    const faviconLink = document.getElementById('favicon');
    
    if (!faviconLink) return;
    
    if (faviconType === 'emoji') {
        const emoji = webSettings.favicon_emoji || '🏝️';
        const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>${emoji}</text></svg>`;
        faviconLink.href = `data:image/svg+xml,${encodeURIComponent(svg)}`;
    } else if (faviconType === 'url' && webSettings.favicon_url) {
        faviconLink.href = webSettings.favicon_url;
    }
}

// Load accommodation types from API
async function loadAccommodationTypes() {
    try {
        const response = await fetch('/api/accommodation-types');
        const data = await response.json();
        
        if (data.success && data.data) {
            allAccommodationTypes = data.data; // ไม่กรอง enabled เพราะไม่มีคอลัมน์นี้
            displayAccommodationTypeButtons();
        }
    } catch (error) {
        console.error('Error loading accommodation types:', error);
        allAccommodationTypes = [];
        const container = document.getElementById('accommodationTypeButtons');
        if (container) {
            container.innerHTML = '<p style="color: #e74c3c;">เกิดข้อผิดพลาดในการโหลดประเภทที่พัก</p>';
        }
    }
}

// Display accommodation type filter buttons (only show types that are used by hotels)
function displayAccommodationTypeButtons() {
    const container = document.getElementById('accommodationTypeButtons');
    
    if (!container) return;
    
    // Don't display until hotels are loaded
    if (allHotels.length === 0) {
        container.innerHTML = '<p style="color: #999;"><i class="fas fa-spinner fa-spin"></i> กำลังโหลด...</p>';
        return;
    }
    
    if (allAccommodationTypes.length === 0) {
        container.innerHTML = '<p style="color: #999;">ไม่มีประเภทที่พัก</p>';
        return;
    }
    
    // Get unique accommodation types used by hotels
    const usedAccommodationTypes = new Set();
    allHotels.forEach(hotel => {
        if (hotel.accommodationTypes) {
            const types = hotel.accommodationTypes.split(',').map(t => t.trim()).filter(t => t);
            types.forEach(t => usedAccommodationTypes.add(t));
        }
    });
    
    // Filter to show only used types
    const activeAccommodationTypes = allAccommodationTypes.filter(at => usedAccommodationTypes.has(at.id));
    
    if (activeAccommodationTypes.length === 0) {
        container.innerHTML = '<p style="color: #999;">ไม่มีประเภทที่พักที่ใช้งาน</p>';
        return;
    }
    
    container.innerHTML = activeAccommodationTypes.map(accommodationType => `
        <button class="filter-btn accommodation-type-filter" data-accommodationtype="${accommodationType.id}" title="${accommodationType.nameEn || accommodationType.nameTh}" style="--filter-color: ${accommodationType.color || '#667eea'};">
            <i class="fas ${accommodationType.icon || 'fa-hotel'}"></i> ${accommodationType.nameTh}
        </button>
    `).join('');
    
    // Add event listeners to new buttons
    container.querySelectorAll('.accommodation-type-filter').forEach(btn => {
        btn.addEventListener('click', () => {
            const accommodationTypeId = btn.dataset.accommodationtype;
            btn.classList.toggle('active');
            
            if (btn.classList.contains('active')) {
                activeFilters.accommodationTypes.push(accommodationTypeId);
            } else {
                activeFilters.accommodationTypes = activeFilters.accommodationTypes.filter(at => at !== accommodationTypeId);
            }
            
            filterHotels();
        });
    });
}

// Load room types from API
async function loadRoomTypes() {
    try {
        const response = await fetch('/api/room-types');
        const data = await response.json();
        
        if (data.success && data.data) {
            allRoomTypes = data.data.filter(rt => rt.enabled === 'TRUE' || rt.enabled === true);
            displayRoomTypeButtons();
        }
    } catch (error) {
        console.error('Error loading room types:', error);
        allRoomTypes = [];
        const container = document.getElementById('roomTypeButtons');
        if (container) {
            container.innerHTML = '<p style="color: #e74c3c;">เกิดข้อผิดพลาดในการโหลดประเภทห้องพัก</p>';
        }
    }
}

// Display room type filter buttons (only show types that are used by hotels)
function displayRoomTypeButtons() {
    const container = document.getElementById('roomTypeButtons');
    
    if (!container) return;
    
    // Don't display until hotels are loaded
    if (allHotels.length === 0) {
        container.innerHTML = '<p style="color: #999;"><i class="fas fa-spinner fa-spin"></i> กำลังโหลด...</p>';
        return;
    }
    
    if (allRoomTypes.length === 0) {
        container.innerHTML = '<p style="color: #999;">ไม่มีประเภทห้องพัก</p>';
        return;
    }
    
    // Get unique room types used by hotels
    const usedRoomTypes = new Set();
    allHotels.forEach(hotel => {
        if (hotel.roomTypes) {
            const types = hotel.roomTypes.split(',').map(t => t.trim()).filter(t => t);
            types.forEach(t => usedRoomTypes.add(t));
        }
    });
    
    // Filter to show only used types
    const activeRoomTypes = allRoomTypes.filter(rt => usedRoomTypes.has(rt.id));
    
    if (activeRoomTypes.length === 0) {
        container.innerHTML = '<p style="color: #999;">ไม่มีประเภทห้องพักที่ใช้งาน</p>';
        return;
    }
    
    container.innerHTML = activeRoomTypes.map(roomType => `
        <button class="filter-btn room-type-filter" data-roomtype="${roomType.id}" title="${roomType.nameEn || roomType.nameTh}" style="--filter-color: ${roomType.color || '#667eea'};">
            <i class="fas ${roomType.icon || 'fa-bed'}"></i> ${roomType.nameTh}
        </button>
    `).join('');
    
    // Add event listeners to new buttons
    container.querySelectorAll('.room-type-filter').forEach(btn => {
        btn.addEventListener('click', () => {
            const roomTypeId = btn.dataset.roomtype;
            btn.classList.toggle('active');
            
            if (btn.classList.contains('active')) {
                activeFilters.roomTypes.push(roomTypeId);
            } else {
                activeFilters.roomTypes = activeFilters.roomTypes.filter(rt => rt !== roomTypeId);
            }
            
            filterHotels();
        });
    });
}

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

// Display filter buttons (only show filters that are used by hotels)
function displayFilterButtons() {
    const container = document.getElementById('filterButtons');
    
    // Don't display until hotels are loaded
    if (allHotels.length === 0) {
        container.innerHTML = '<p style="color: #999;"><i class="fas fa-spinner fa-spin"></i> กำลังโหลด...</p>';
        return;
    }
    
    if (allFilters.length === 0) {
        container.innerHTML = '<p style="color: #999;">ไม่มีสิ่งอำนวยความสะดวก</p>';
        return;
    }
    
    // Get unique filters used by hotels
    const usedFilters = new Set();
    allHotels.forEach(hotel => {
        if (hotel.filters) {
            const filters = hotel.filters.split(',').map(f => f.trim()).filter(f => f);
            filters.forEach(f => usedFilters.add(f));
        }
    });
    
    // Filter to show only used filters
    const availableFilters = allFilters.filter(f => usedFilters.has(f.nameTh));
    
    if (availableFilters.length === 0) {
        container.innerHTML = '<p style="color: #999;">ไม่มีสิ่งอำนวยความสะดวกที่ใช้งาน</p>';
        return;
    }
    
    container.innerHTML = availableFilters.map(filter => `
        <button class="filter-btn" data-filter="${filter.nameTh}" title="${filter.nameEn}" style="--filter-color: ${filter.color || '#667eea'};">
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

// Get filter data by name
function getFilterData(filterName) {
    return allFilters.find(f => f.nameTh === filterName) || { color: '#667eea', icon: 'fa-tag' };
}

// Get room type data by ID
function getRoomTypeData(roomTypeId) {
    return allRoomTypes.find(rt => rt.id === roomTypeId) || null;
}

// Get accommodation type data by ID
function getAccommodationTypeData(accommodationTypeId) {
    return allAccommodationTypes.find(at => at.id === accommodationTypeId) || null;
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
        document.querySelectorAll('.room-type-filter').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.accommodation-type-filter').forEach(btn => btn.classList.remove('active'));
        minPrice.value = 0;
        maxPrice.value = 100000;
        maxGuests.value = 1;
        
        // Reset filters
        activeFilters = {
            search: '',
            features: [],
            roomTypes: [],
            accommodationTypes: [],
            minPrice: 0,
            maxPrice: 100000,
            maxGuests: 1
        };
        
        filterHotels();
    });

    // Toggle filters
    const toggleFiltersBtn = document.getElementById('toggleFilters');
    const filtersContainer = document.getElementById('filtersContainer');
    
    toggleFiltersBtn.addEventListener('click', () => {
        const isVisible = filtersContainer.style.display !== 'none';
        
        if (isVisible) {
            // Hide filters
            filtersContainer.style.display = 'none';
            toggleFiltersBtn.classList.remove('active');
            toggleFiltersBtn.querySelector('span').textContent = 'แสดงตัวกรองเพิ่มเติม';
        } else {
            // Show filters
            filtersContainer.style.display = 'block';
            filtersContainer.classList.add('show');
            toggleFiltersBtn.classList.add('active');
            toggleFiltersBtn.querySelector('span').textContent = 'ซ่อนตัวกรอง';
        }
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
        // Add timestamp to prevent caching
        const timestamp = new Date().getTime();
        const response = await fetch(`/api/hotels?t=${timestamp}`, {
            cache: 'no-cache',
            headers: {
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache'
            }
        });
        const data = await response.json();
        
        if (data.success && data.data) {
            allHotels = data.data;
            
            // Load likes for each hotel
            await Promise.all(allHotels.map(async (hotel) => {
                try {
                    const likesResponse = await fetch(`/api/hotels/${hotel.id}/likes`);
                    const likesData = await likesResponse.json();
                    hotel.likes = likesData.likes || 0;
                } catch (error) {
                    hotel.likes = 0;
                }
            }));
            
            // Update filter buttons to show only used filters
            displayAccommodationTypeButtons();
            displayFilterButtons();
            displayRoomTypeButtons();
            
            // Filter hotels (will automatically hide inactive hotels)
            filterHotels();
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
        // Filter out inactive hotels (hide from public view)
        if (hotel.status === 'inactive') {
            return false;
        }
        
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
        
        // Room Types filter
        if (activeFilters.roomTypes.length > 0) {
            const hotelRoomTypes = hotel.roomTypes ? hotel.roomTypes.split(',').map(rt => rt.trim()) : [];
            const hasAnyRoomType = activeFilters.roomTypes.some(roomType => 
                hotelRoomTypes.includes(roomType)
            );
            if (!hasAnyRoomType) {
                return false;
            }
        }
        
        // Accommodation Types filter
        if (activeFilters.accommodationTypes.length > 0) {
            const hotelAccommodationTypes = hotel.accommodationTypes ? hotel.accommodationTypes.split(',').map(at => at.trim()) : [];
            const hasAnyAccommodationType = activeFilters.accommodationTypes.some(accommodationType => 
                hotelAccommodationTypes.includes(accommodationType)
            );
            if (!hasAnyAccommodationType) {
                return false;
            }
        }
        
        return true;
    });
    
    // สุ่มลำดับโรงแรมและ reset การแสดงผล
    shuffleAndResetDisplay();
    displayHotels();
    updateResultCount();
}

// ฟังก์ชันสุ่มลำดับโรงแรมแบบ Fisher-Yates Shuffle
function shuffleArray(array) {
    const shuffled = [...array]; // สำเนา array
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// สุ่มลำดับและ reset การแสดงผล
function shuffleAndResetDisplay() {
    shuffledHotels = shuffleArray(filteredHotels);
    displayedCount = 0;
}

// โหลดโรงแรมเพิ่มเติม
function loadMoreHotels() {
    displayedCount += ITEMS_PER_PAGE;
    displayHotels();
}

// Update result count
function updateResultCount() {
    document.getElementById('resultCount').textContent = filteredHotels.length;
    document.getElementById('totalCount').textContent = allHotels.length;
}

// Display hotels
function displayHotels() {
    const grid = document.getElementById('hotelsGrid');
    
    if (shuffledHotels.length === 0) {
        grid.innerHTML = `
            <div class="no-results">
                <i class="fas fa-search"></i>
                <h3>ไม่พบโรงแรมที่ตรงกับเงื่อนไข</h3>
                <p>ลองเปลี่ยนตัวกรองหรือคำค้นหา</p>
            </div>
        `;
        return;
    }
    
    // คำนวณจำนวนที่จะแสดง
    const hotelsToShow = shuffledHotels.slice(0, displayedCount + ITEMS_PER_PAGE);
    displayedCount = hotelsToShow.length;
    
    // สร้าง HTML สำหรับการ์ด
    const cardsHTML = hotelsToShow.map(hotel => createHotelCard(hotel)).join('');
    
    // ตรวจสอบว่ายังมีโรงแรมเหลืออีกหรือไม่
    const hasMore = displayedCount < shuffledHotels.length;
    
    // สร้างปุ่มโหลดเพิ่มเติม
    const loadMoreButton = hasMore ? `
        <div class="load-more-container">
            <button class="load-more-btn" onclick="loadMoreHotels()">
                <i class="fas fa-plus-circle"></i> ดูที่พักเพิ่มเติม (เหลืออีก ${shuffledHotels.length - displayedCount} แห่ง)
            </button>
        </div>
    ` : '';
    
    grid.innerHTML = cardsHTML + loadMoreButton;
    
    // Add click event listeners for cards
    grid.querySelectorAll('.hotel-card').forEach(card => {
        card.addEventListener('click', (e) => {
            // ถ้าคลิกที่ปุ่มหัวใจ ให้ไม่เปิด modal
            if (e.target.closest('.like-btn')) {
                return;
            }
            const hotelId = card.dataset.hotelId;
            openHotelModal(hotelId);
        });
    });
    
    // Add event listeners for like buttons
    grid.querySelectorAll('.like-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation(); // ป้องกันไม่ให้เปิด modal
            const hotelId = btn.dataset.hotelId;
            likeHotel(hotelId);
        });
    });
}

// Create hotel card HTML
function createHotelCard(hotel) {
    const name = hotel.nameTh || hotel.nameEn || 'ไม่มีชื่อ';
    const nameEn = hotel.nameTh && hotel.nameEn ? hotel.nameEn : '';
    const price = hotel.priceStart || 0;
    const priceEnd = hotel.priceEnd || price;
    
    // Get all images (support multiple images)
    const images = hotel.images && hotel.images.length > 0 
        ? hotel.images 
        : [hotel.imageUrl || 'https://via.placeholder.com/300x200'];
    
    // Debug log
    if (images.length > 1) {
    }
    
    // Parse amenities/filters from comma-separated string และสุ่มแสดงสูงสุด 4 รายการ
    const amenitiesList = hotel.filters ? hotel.filters.split(',').map(f => f.trim()).filter(f => f) : [];
    
    // สุ่มสิ่งอำนวยความสะดวก ถ้ามีมากกว่า 4 รายการ
    let displayAmenities;
    if (amenitiesList.length > 4) {
        // สุ่มแบบ Fisher-Yates Shuffle แล้วเอา 4 อันแรก
        const shuffledAmenities = shuffleArray(amenitiesList);
        displayAmenities = shuffledAmenities.slice(0, 4);
    } else {
        displayAmenities = amenitiesList;
    }
    const remainingCount = amenitiesList.length - displayAmenities.length;
    
    // Parse room types from comma-separated string
    const roomTypesList = hotel.roomTypes ? hotel.roomTypes.split(',').map(rt => rt.trim()).filter(rt => rt) : [];
    // ถ้ามีมากกว่า 3 รายการ -> แสดง 2 + +เหลือ, ถ้า ≤ 3 -> แสดงทั้งหมด
    const displayRoomTypes = roomTypesList.length > 3 ? roomTypesList.slice(0, 2) : roomTypesList;
    const remainingRoomTypesCount = roomTypesList.length > 3 ? roomTypesList.length - 2 : 0;
    
    // Parse accommodation types from comma-separated string
    const accommodationTypesList = hotel.accommodationTypes ? hotel.accommodationTypes.split(',').map(at => at.trim()).filter(at => at) : [];
    const firstAccommodationType = accommodationTypesList.length > 0 ? getAccommodationTypeData(accommodationTypesList[0]) : null;
    
    // Debug log
    if (firstAccommodationType) {
    } else if (accommodationTypesList.length > 0) {
    }
    
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
                    <button class="like-btn" data-hotel-id="${hotel.id}" title="กดหัวใจ">
                        <i class="fas fa-heart"></i>
                        <span>${hotel.likes || 0}</span>
                    </button>
                    <span class="view-details">ดูรายละเอียด <i class="fas fa-arrow-right"></i></span>
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
        
        // Check if response is successful (200-299)
        if (response.ok && data.success) {
            // Update local data
            const hotel = allHotels.find(h => h.id === hotelId);
            if (hotel) {
                hotel.likes = data.likes;
            }
            
            // Update UI - ปุ่มในการ์ด
            const likeBtn = document.querySelector(`.like-btn[data-hotel-id="${hotelId}"]`);
            if (likeBtn) {
                likeBtn.classList.add('liked');
                const span = likeBtn.querySelector('span');
                if (span) {
                    span.textContent = data.likes;
                }
                
                // Animation effect
                setTimeout(() => {
                    likeBtn.classList.remove('liked');
                }, 1000);
            }
            
            // แสดงข้อความสำเร็จ
            showLikeSuccess();
        } else {
            // แสดง error message (เช่น กดซ้ำในวันเดียวกัน)
            showLikeError(data.error || 'ไม่สามารถกดหัวใจได้');
        }
    } catch (error) {
        console.error('Error liking hotel:', error);
        showLikeError('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
    }
}

// Show like success message
function showLikeSuccess() {
    const message = document.createElement('div');
    message.className = 'like-success';
    message.innerHTML = '<i class="fas fa-heart"></i> ขอบคุณที่กดหัวใจ!';
    document.body.appendChild(message);
    
    setTimeout(() => {
        message.classList.add('show');
    }, 10);
    
    setTimeout(() => {
        message.classList.remove('show');
        setTimeout(() => {
            message.remove();
        }, 300);
    }, 2000);
}

// Show like error message
function showLikeError(errorMsg) {
    const message = document.createElement('div');
    message.className = 'like-error';
    message.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${errorMsg}`;
    document.body.appendChild(message);
    
    setTimeout(() => {
        message.classList.add('show');
    }, 10);
    
    setTimeout(() => {
        message.classList.remove('show');
        setTimeout(() => {
            message.remove();
        }, 300);
    }, 3000);
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
                    <span class="stat-item"><i class="fas fa-eye"></i> ${clicks.toLocaleString('th-TH')} ครั้ง</span>
                    <span class="stat-item"><i class="fas fa-tag"></i> ${hotel.id}</span>
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
    
    modal.style.display = 'flex';
}

// Carousel navigation functions
function nextImage(hotelId) {
    const carousel = document.querySelector(`.hotel-carousel[data-hotel-id="${hotelId}"]`);
    if (!carousel) return;
    
    const slides = carousel.querySelectorAll('.carousel-slide');
    const indicators = carousel.querySelectorAll('.indicator');
    let currentIndex = Array.from(slides).findIndex(slide => slide.classList.contains('active'));
    
    slides[currentIndex].classList.remove('active');
    slides[currentIndex].style.display = 'none';
    indicators[currentIndex].classList.remove('active');
    
    currentIndex = (currentIndex + 1) % slides.length;
    
    slides[currentIndex].classList.add('active');
    slides[currentIndex].style.display = 'block';
    indicators[currentIndex].classList.add('active');
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
    
    currentIndex = (currentIndex - 1 + slides.length) % slides.length;
    
    slides[currentIndex].classList.add('active');
    slides[currentIndex].style.display = 'block';
    indicators[currentIndex].classList.add('active');
}

function goToSlide(hotelId, index) {
    const carousel = document.querySelector(`.hotel-carousel[data-hotel-id="${hotelId}"]`);
    if (!carousel) return;
    
    const slides = carousel.querySelectorAll('.carousel-slide');
    const indicators = carousel.querySelectorAll('.indicator');
    const currentIndex = Array.from(slides).findIndex(slide => slide.classList.contains('active'));
    
    if (currentIndex === index) return;
    
    slides[currentIndex].classList.remove('active');
    slides[currentIndex].style.display = 'none';
    indicators[currentIndex].classList.remove('active');
    
    slides[index].classList.add('active');
    slides[index].style.display = 'block';
    indicators[index].classList.add('active');
}

// Modal Carousel Navigation Functions
function nextModalImage(hotelId) {
    const carousel = document.querySelector(`.modal-carousel[data-hotel-id="${hotelId}"]`);
    if (!carousel) return;
    
    const slides = carousel.querySelectorAll('.modal-carousel-slide');
    const indicators = carousel.querySelectorAll('.modal-indicator');
    const currentIndex = Array.from(slides).findIndex(slide => slide.classList.contains('active'));
    const nextIndex = (currentIndex + 1) % slides.length;
    
    slides[currentIndex].classList.remove('active');
    slides[currentIndex].style.display = 'none';
    indicators[currentIndex].classList.remove('active');
    
    slides[nextIndex].classList.add('active');
    slides[nextIndex].style.display = 'block';
    indicators[nextIndex].classList.add('active');
}

function prevModalImage(hotelId) {
    const carousel = document.querySelector(`.modal-carousel[data-hotel-id="${hotelId}"]`);
    if (!carousel) return;
    
    const slides = carousel.querySelectorAll('.modal-carousel-slide');
    const indicators = carousel.querySelectorAll('.modal-indicator');
    const currentIndex = Array.from(slides).findIndex(slide => slide.classList.contains('active'));
    const prevIndex = currentIndex === 0 ? slides.length - 1 : currentIndex - 1;
    
    slides[currentIndex].classList.remove('active');
    slides[currentIndex].style.display = 'none';
    indicators[currentIndex].classList.remove('active');
    
    slides[prevIndex].classList.add('active');
    slides[prevIndex].style.display = 'block';
    indicators[prevIndex].classList.add('active');
}

function goToModalSlide(hotelId, index) {
    const carousel = document.querySelector(`.modal-carousel[data-hotel-id="${hotelId}"]`);
    if (!carousel) return;
    
    const slides = carousel.querySelectorAll('.modal-carousel-slide');
    const indicators = carousel.querySelectorAll('.modal-indicator');
    const currentIndex = Array.from(slides).findIndex(slide => slide.classList.contains('active'));
    
    if (currentIndex === index) return;
    
    slides[currentIndex].classList.remove('active');
    slides[currentIndex].style.display = 'none';
    indicators[currentIndex].classList.remove('active');
    
    slides[index].classList.add('active');
    slides[index].style.display = 'block';
    indicators[index].classList.add('active');
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

// ==================== USER LOGIN/LOGOUT ====================

// Check if user is logged in
function checkUserLogin() {
    const savedToken = localStorage.getItem('authToken');
    const savedUser = localStorage.getItem('currentUser');
    
    if (savedToken && savedUser) {
        // ตรวจสอบ token กับ server
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
                // Token ยังใช้งานได้
                currentUser = JSON.parse(savedUser);
                updateUserUI();
            } else {
                // Token หมดอายุหรือไม่ถูกต้อง
                localStorage.removeItem('authToken');
                localStorage.removeItem('currentUser');
                updateUserUI();
            }
        })
        .catch(error => {
            console.error('Token verification error:', error);
            localStorage.removeItem('authToken');
            localStorage.removeItem('currentUser');
            updateUserUI();
        });
    }
}

// Update UI based on login status
function updateUserUI() {
    const loginBtn = document.getElementById('loginBtn');
    const userProfile = document.getElementById('userProfile');
    const userDisplayName = document.getElementById('userDisplayName');
    
    if (currentUser) {
        // User is logged in
        loginBtn.style.display = 'none';
        userProfile.style.display = 'block';
        userDisplayName.textContent = currentUser.nickname || currentUser.username;
    } else {
        // User is not logged in
        loginBtn.style.display = 'flex';
        userProfile.style.display = 'none';
    }
}

// Setup login/logout handlers
function setupLoginHandlers() {
    const loginBtn = document.getElementById('loginBtn');
    const loginModal = document.getElementById('loginModal');
    const closeLoginModal = document.getElementById('closeLoginModal');
    const cancelLogin = document.getElementById('cancelLogin');
    const loginForm = document.getElementById('loginForm');
    const profileBtn = document.getElementById('profileBtn');
    const profileDropdown = document.getElementById('profileDropdown');
    const logoutBtn = document.getElementById('logoutBtn');
    
    // Open login modal
    loginBtn.addEventListener('click', () => {
        loginModal.classList.add('show');
    });
    
    // Close login modal
    closeLoginModal.addEventListener('click', () => {
        loginModal.classList.remove('show');
        loginForm.reset();
    });
    
    cancelLogin.addEventListener('click', () => {
        loginModal.classList.remove('show');
        loginForm.reset();
    });
    
    // Close modal when clicking outside
    loginModal.addEventListener('click', (e) => {
        if (e.target === loginModal) {
            loginModal.classList.remove('show');
            loginForm.reset();
        }
    });
    
    // Handle login form submission
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const username = document.getElementById('loginUsername').value;
        const password = document.getElementById('loginPassword').value;
        
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });
            
            const data = await response.json();
            
            if (data.success) {
                // บันทึก JWT Token และ user data
                localStorage.setItem('authToken', data.token);
                localStorage.setItem('currentUser', JSON.stringify(data.user));
                currentUser = data.user;
                
                // Update UI
                updateUserUI();
                
                // Close modal
                loginModal.classList.remove('show');
                loginForm.reset();
                
                // Show success message
                alert(`ยินดีต้อนรับ ${currentUser.nickname || currentUser.username}!`);
            } else {
                alert('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
            }
        } catch (error) {
            console.error('Login error:', error);
            alert('เกิดข้อผิดพลาดในการเข้าสู่ระบบ');
        }
    });
    
    // Toggle profile dropdown
    profileBtn.addEventListener('click', () => {
        profileDropdown.classList.toggle('show');
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!profileBtn.contains(e.target) && !profileDropdown.contains(e.target)) {
            profileDropdown.classList.remove('show');
        }
    });
    
    // Handle logout
    logoutBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        
        if (confirm('ต้องการออกจากระบบหรือไม่?')) {
            try {
                // เรียก API logout เพื่อลบ session
                const token = localStorage.getItem('authToken');
                await fetch('/api/auth/logout', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
            } catch (error) {
                console.error('Logout error:', error);
            }
            
            // ลบข้อมูลจาก localStorage
            currentUser = null;
            localStorage.removeItem('authToken');
            localStorage.removeItem('currentUser');
            updateUserUI();
            profileDropdown.classList.remove('show');
            alert('ออกจากระบบเรียบร้อยแล้ว');
        }
    });
    
    // Setup registration modal handlers
    setupRegistrationHandlers();
}

/**
 * Setup Registration Modal Handlers
 */
function setupRegistrationHandlers() {
    const registerModal = document.getElementById('registerModal');
    const closeRegisterModal = document.getElementById('closeRegisterModal');
    const cancelRegister = document.getElementById('cancelRegister');
    const registerForm = document.getElementById('registerForm');
    const showRegisterModal = document.getElementById('showRegisterModal');
    const showLoginModal = document.getElementById('showLoginModal');
    const loginModal = document.getElementById('loginModal');
    
    // Open registration modal from login modal
    showRegisterModal.addEventListener('click', (e) => {
        e.preventDefault();
        loginModal.classList.remove('show');
        registerModal.classList.add('show');
    });
    
    // Open login modal from registration modal
    showLoginModal.addEventListener('click', (e) => {
        e.preventDefault();
        registerModal.classList.remove('show');
        loginModal.classList.add('show');
    });
    
    // Close registration modal
    closeRegisterModal.addEventListener('click', () => {
        registerModal.classList.remove('show');
        registerForm.reset();
    });
    
    cancelRegister.addEventListener('click', () => {
        registerModal.classList.remove('show');
        registerForm.reset();
    });
    
    // Close modal when clicking outside
    registerModal.addEventListener('click', (e) => {
        if (e.target === registerModal) {
            registerModal.classList.remove('show');
            registerForm.reset();
        }
    });
    
    // Handle registration form submission
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const username = document.getElementById('registerUsername').value.trim();
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('registerConfirmPassword').value;
        const nickname = document.getElementById('registerNickname').value.trim();
        
        // Client-side validation
        if (username.length < 4) {
            alert('ชื่อผู้ใช้ต้องมีอย่างน้อย 4 ตัวอักษร');
            return;
        }
        
        if (password.length < 6) {
            alert('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร');
            return;
        }
        
        if (password !== confirmPassword) {
            alert('รหัสผ่านไม่ตรงกัน');
            return;
        }
        
        if (!nickname) {
            alert('กรุณากรอกชื่อ-นามสกุล');
            return;
        }
        
        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    username, 
                    password, 
                    nickname
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                // บันทึก JWT Token และ user data
                localStorage.setItem('authToken', data.token);
                localStorage.setItem('currentUser', JSON.stringify(data.user));
                currentUser = data.user;
                
                // Update UI
                updateUserUI();
                
                // Close modal
                registerModal.classList.remove('show');
                registerForm.reset();
                
                // Show success message
                alert(`สมัครสมาชิกสำเร็จ! ยินดีต้อนรับ ${currentUser.nickname}!`);
            } else {
                alert(data.message || 'เกิดข้อผิดพลาดในการสมัครสมาชิก');
            }
        } catch (error) {
            console.error('Registration error:', error);
            alert('เกิดข้อผิดพลาดในการสมัครสมาชิก');
        }
    });
}


// ฟังก์ชันเพิ่มเติมสำหรับ admin_v2.js

// Upload image to ImgBB or convert to base64 (DEPRECATED - ใช้ uploadImage(imageNumber) ใน admin_v2.js แทน)
async function uploadImageOld() {
    const fileInput = document.getElementById('imageFile');
    const file = fileInput?.files?.[0];
    
    if (!file) {
        showError('กรุณาเลือกไฟล์รูปภาพ');
        return;
    }
    
    // Check file type
    if (!file.type.startsWith('image/')) {
        showError('กรุณาเลือกไฟล์รูปภาพเท่านั้น');
        return;
    }
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
        showError('ขนาดไฟล์ต้องไม่เกิน 5MB');
        return;
    }
    
    const uploadBtn = document.getElementById('uploadBtn');
    if (uploadBtn) {
        uploadBtn.disabled = true;
        uploadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> กำลังอัพโหลด...';
    }
    
    try {
        // Convert to base64 Data URL
        const reader = new FileReader();
        reader.onload = function(e) {
            const imageUrl = e.target.result;
            document.getElementById('imageUrl').value = imageUrl;
            previewImageUrl(imageUrl);
            showSuccess('อัพโหลดรูปภาพสำเร็จ');
            if (uploadBtn) {
                uploadBtn.disabled = false;
                uploadBtn.innerHTML = '<i class="fas fa-upload"></i> อัพโหลด';
            }
        };
        reader.onerror = function() {
            showError('เกิดข้อผิดพลาดในการอ่านไฟล์');
            if (uploadBtn) {
                uploadBtn.disabled = false;
                uploadBtn.innerHTML = '<i class="fas fa-upload"></i> อัพโหลด';
            }
        };
        reader.readAsDataURL(file);
    } catch (error) {
        console.error('Error uploading image:', error);
        showError('เกิดข้อผิดพลาดในการอัพโหลด');
        if (uploadBtn) {
            uploadBtn.disabled = false;
            uploadBtn.innerHTML = '<i class="fas fa-upload"></i> อัพโหลด';
        }
    }
}

// Preview image URL
function previewImageUrl(url) {
    const preview = document.getElementById('imagePreview');
    const img = document.getElementById('previewImg');
    
    if (url) {
        img.src = url;
        preview.style.display = 'block';
    } else {
        preview.style.display = 'none';
    }
}

// Enhanced load hotel data with all new fields
async function loadHotelDataEnhanced(hotelId) {
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
                document.getElementById('imageUrl').value = hotel.imageUrl || '';
                document.getElementById('facebookUrl').value = hotel.facebookUrl || '';
                document.getElementById('websiteUrl').value = hotel.websiteUrl || '';
                document.getElementById('lineId').value = hotel.lineId || '';
                document.getElementById('phoneNumber').value = hotel.phone || '';
                document.getElementById('maxGuests').value = hotel.maxGuests || '';
                document.getElementById('bankName').value = hotel.bankName || '';
                document.getElementById('accountName').value = hotel.accountName || '';
                document.getElementById('accountNumber').value = hotel.accountNumber || '';
                
                // Preview image
                if (hotel.imageUrl) {
                    previewImageUrl(hotel.imageUrl);
                }
                
                // Load filters after a short delay to ensure they're loaded
                setTimeout(() => {
                    const selectedFilters = hotel.filters ? hotel.filters.split(',').map(f => f.trim()) : [];
                    const checkboxes = document.querySelectorAll('#filtersCheckboxes input[type="checkbox"]');
                    checkboxes.forEach(cb => {
                        const filterName = cb.dataset.filterName;
                        if (selectedFilters.includes(filterName)) {
                            cb.checked = true;
                        }
                    });
                }, 500);
            }
        }
    } catch (error) {
        console.error('Error loading hotel data:', error);
    }
}

// Enhanced save hotel with validation
async function saveHotelEnhanced(hotelId) {
    // Get form values
    const id = document.getElementById('hotelId')?.value.trim();
    const nameTh = document.getElementById('hotelNameTh')?.value.trim();
    const nameEn = document.getElementById('hotelNameEn')?.value.trim();
    const ownerName = document.getElementById('ownerName')?.value.trim();
    const minPrice = document.getElementById('minPrice')?.value;
    const maxPrice = document.getElementById('maxPrice')?.value;
    const imageUrl = document.getElementById('imageUrl')?.value.trim();
    const facebookUrl = document.getElementById('facebookUrl')?.value.trim();
    const websiteUrl = document.getElementById('websiteUrl')?.value.trim();
    const lineId = document.getElementById('lineId')?.value.trim();
    const phoneNumber = document.getElementById('phoneNumber')?.value.trim();
    const maxGuests = document.getElementById('maxGuests')?.value;
    const bankName = document.getElementById('bankName')?.value.trim();
    const accountName = document.getElementById('accountName')?.value.trim();
    const accountNumber = document.getElementById('accountNumber')?.value.trim();
    
    // Validation
    if (!id) {
        showError('กรุณาระบุ ID โรงแรม');
        document.getElementById('hotelId').focus();
        return;
    }
    
    if (!nameTh && !nameEn) {
        showError('กรุณาระบุชื่อโรงแรม (ภาษาไทยหรืออังกฤษ อย่างน้อย 1 ภาษา)');
        return;
    }
    
    if (!ownerName) {
        showError('กรุณาระบุชื่อเจ้าของโรงแรม');
        document.getElementById('ownerName').focus();
        return;
    }
    
    if (!minPrice || parseFloat(minPrice) <= 0) {
        showError('กรุณาระบุราคาต่ำสุดที่ถูกต้อง');
        document.getElementById('minPrice').focus();
        return;
    }
    
    if (!imageUrl) {
        showError('กรุณาอัพโหลดรูปภาพหรือระบุ URL');
        return;
    }
    
    if (!phoneNumber) {
        showError('กรุณาระบุเบอร์โทรศัพท์');
        document.getElementById('phoneNumber').focus();
        return;
    }
    
    // Get checked filters
    const selectedFilters = [];
    const checkboxes = document.querySelectorAll('#filtersCheckboxes input[type="checkbox"]:checked');
    checkboxes.forEach(cb => {
        const filterName = cb.dataset.filterName;
        if (filterName) {
            selectedFilters.push(filterName);
        }
    });
    const filtersString = selectedFilters.join(',');
    
    const hotel = {
        id: id,
        nameTh: nameTh || '',
        nameEn: nameEn || '',
        ownerName: ownerName,
        priceStart: parseFloat(minPrice),
        priceEnd: maxPrice ? parseFloat(maxPrice) : parseFloat(minPrice),
        imageUrl: imageUrl,
        facebookUrl: facebookUrl || '',
        websiteUrl: websiteUrl || '',
        lineId: lineId || '',
        phone: phoneNumber,
        maxGuests: maxGuests ? parseInt(maxGuests) : 1,
        filters: filtersString,
        bankName: bankName || '',
        accountName: accountName || '',
        accountNumber: accountNumber || ''
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

// Enhanced load filter checkboxes with proper data attributes
async function loadFilterCheckboxesEnhanced() {
    try {
        const response = await fetch('/api/filters');
        const data = await response.json();
        
        if (data.success && data.data && data.data.length > 0) {
            const container = document.getElementById('filtersCheckboxes');
            if (!container) return;
            
            container.innerHTML = data.data.map(filter => {
                return `
                    <label style="display: flex; align-items: center; gap: 8px; padding: 10px; background: white; border-radius: 6px; cursor: pointer; transition: all 0.3s; border: 2px solid transparent;">
                        <input type="checkbox" data-filter-name="${filter.nameTh}" style="width: 18px; height: 18px; cursor: pointer;">
                        <i class="fas ${filter.icon}" style="color: var(--primary-color);"></i>
                        <span style="flex: 1;">${filter.nameTh}</span>
                    </label>
                `;
            }).join('');
        } else {
            // No filters found
            const container = document.getElementById('filtersCheckboxes');
            if (container) {
                container.innerHTML = `
                    <div style="grid-column: 1 / -1; text-align: center; color: #999; padding: 20px;">
                        <i class="fas fa-exclamation-circle"></i> ไม่พบตัวกรอง
                    </div>
                `;
            }
        }
    } catch (error) {
        console.error('Error loading filter checkboxes:', error);
        const container = document.getElementById('filtersCheckboxes');
        if (container) {
            container.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; color: #dc3545; padding: 20px;">
                    <i class="fas fa-exclamation-triangle"></i> เกิดข้อผิดพลาดในการโหลดตัวกรอง
                </div>
            `;
        }
    }
}

console.log('✅ Hotel management enhancements loaded');

// Global variables
let currentUser = null;

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
    
    // Update info section
    document.getElementById('infoUsername').textContent = currentUser.username;
    document.getElementById('infoNickname').textContent = currentUser.nickname || currentUser.username;
    
    // Set profile and follow links
    const profileLink = document.getElementById('profileLink');
    const followLink = document.getElementById('followLink');
    const followLink2 = document.getElementById('followLink2');
    
    if (profileLink) {
        profileLink.href = `/profile?id=${currentUser.username}`;
    }
    if (followLink) {
        followLink.href = `/follow?id=${currentUser.username}`;
    }
    if (followLink2) {
        followLink2.href = `/follow?id=${currentUser.username}`;
    }
    
    // Display role
    const roleMap = {
        'admin': 'ผู้ดูแลระบบ',
        'hotel_owner': 'เจ้าของโรงแรม',
        'hotel-owner': 'เจ้าของโรงแรม',
        'user': 'สมาชิก'
    };
    const roleText = roleMap[currentUser.role] || 'สมาชิก';
    document.getElementById('profileRole').textContent = roleText;
    document.getElementById('infoRole').textContent = roleText;
    
    // Show admin link if user is admin or hotel_owner
    if (currentUser.role === 'admin' || currentUser.role === 'hotel_owner' || currentUser.role === 'hotel-owner') {
        const adminLink = document.getElementById('adminLink');
        if (adminLink) {
            adminLink.style.display = 'inline-flex';
        }
    }
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
}

// Logout
function logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    window.location.href = '/';
}

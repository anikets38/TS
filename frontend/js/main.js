// ================================
// NAVIGATION TOGGLE
// ================================
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');

if (hamburger) {
    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        hamburger.classList.toggle('active');
    });
}

// ================================
// SMOOTH SCROLLING
// ================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// ================================
// API BASE URL
// ================================
const API_BASE_URL = 'http://localhost:5000/api';

// ================================
// AUTH HELPER FUNCTIONS
// ================================
function getToken() {
    return localStorage.getItem('token');
}

function setToken(token) {
    localStorage.setItem('token', token);
}

function removeToken() {
    localStorage.removeItem('token');
}

function isAuthenticated() {
    return !!getToken();
}

function redirectIfNotAuthenticated() {
    if (!isAuthenticated()) {
        window.location.href = '/pages/login.html';
    }
}

function redirectIfAuthenticated() {
    if (isAuthenticated()) {
        window.location.href = '/pages/dashboard.html';
    }
}

// ================================
// API CALL HELPER
// ================================
async function apiCall(endpoint, method = 'GET', data = null) {
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
        }
    };

    const token = getToken();
    if (token) {
        options.headers['Authorization'] = `Bearer ${token}`;
    }

    if (data && method !== 'GET') {
        options.body = JSON.stringify(data);
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'API request failed');
        }

        return result;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// ================================
// UPDATE NAVIGATION BASED ON AUTH
// ================================
async function updateNavigation() {
    const navLinks = document.getElementById('navLinks');
    if (!navLinks) return;

    if (isAuthenticated()) {
        try {
            // Get user profile to check care mode
            const response = await apiCall('/auth/me', 'GET');
            const careMode = response.data?.careMode;
            
            let navHTML = '';
            
            if (careMode === 'planning') {
                // Planning stage navigation
                navHTML = `
                    <a href="/pages/fertility-planning.html">Planning</a>
                    <div class="user-profile-dropdown">
                        <button class="profile-btn" onclick="toggleProfileMenu(event)">
                            <span class="profile-icon">👤</span>
                            <span class="profile-name">${response.data.name || 'User'}</span>
                            <span class="dropdown-arrow">▼</span>
                        </button>
                        <div class="profile-menu" id="profileMenu">
                            <div class="profile-info">
                                <div class="profile-name-full">${response.data.name || 'User'}</div>
                                <div class="profile-email">${response.data.email || ''}</div>
                            </div>
                            <div class="profile-divider"></div>
                            <a href="/pages/mode-selection.html?switch=true" class="profile-menu-item">
                                <span>🔄</span> Switch Stage
                            </a>
                            <a href="#" onclick="logout()" class="profile-menu-item logout">
                                <span>🚪</span> Logout
                            </a>
                        </div>
                    </div>
                `;
            } else if (careMode === 'pregnancy') {
                // Pregnancy stage navigation
                navHTML = `
                    <a href="/pages/pregnancy-guide.html">Pregnancy Guide</a>
                    <div class="user-profile-dropdown">
                        <button class="profile-btn" onclick="toggleProfileMenu(event)">
                            <span class="profile-icon">👤</span>
                            <span class="profile-name">${response.data.name || 'User'}</span>
                            <span class="dropdown-arrow">▼</span>
                        </button>
                        <div class="profile-menu" id="profileMenu">
                            <div class="profile-info">
                                <div class="profile-name-full">${response.data.name || 'User'}</div>
                                <div class="profile-email">${response.data.email || ''}</div>
                            </div>
                            <div class="profile-divider"></div>
                            <a href="/pages/mode-selection.html?switch=true" class="profile-menu-item">
                                <span>🔄</span> Switch Stage
                            </a>
                            <a href="#" onclick="logout()" class="profile-menu-item logout">
                                <span>🚪</span> Logout
                            </a>
                        </div>
                    </div>
                `;
            } else if (careMode === 'baby-care') {
                // Baby care stage navigation
                navHTML = `
                    <a href="/pages/dashboard.html">Dashboard</a>
                    <a href="/pages/baby-tracking.html">Tracking</a>
                    <a href="/pages/vaccination.html">Vaccination</a>
                    <a href="/pages/nutrition.html">Nutrition</a>
                    <a href="/pages/health-awareness.html">Health</a>
                    <div class="user-profile-dropdown">
                        <button class="profile-btn" onclick="toggleProfileMenu(event)">
                            <span class="profile-icon">👤</span>
                            <span class="profile-name">${response.data.name || 'User'}</span>
                            <span class="dropdown-arrow">▼</span>
                        </button>
                        <div class="profile-menu" id="profileMenu">
                            <div class="profile-info">
                                <div class="profile-name-full">${response.data.name || 'User'}</div>
                                <div class="profile-email">${response.data.email || ''}</div>
                            </div>
                            <div class="profile-divider"></div>
                            <a href="/pages/mode-selection.html?switch=true" class="profile-menu-item">
                                <span>🔄</span> Switch Stage
                            </a>
                            <a href="#" onclick="logout()" class="profile-menu-item logout">
                                <span>🚪</span> Logout
                            </a>
                        </div>
                    </div>
                `;
            } else {
                // Default navigation if no mode selected
                navHTML = `
                    <a href="/pages/mode-selection.html">Choose Mode</a>
                    <div class="user-profile-dropdown">
                        <button class="profile-btn" onclick="toggleProfileMenu(event)">
                            <span class="profile-icon">👤</span>
                            <span class="profile-name">${response.data.name || 'User'}</span>
                            <span class="dropdown-arrow">▼</span>
                        </button>
                        <div class="profile-menu" id="profileMenu">
                            <div class="profile-info">
                                <div class="profile-name-full">${response.data.name || 'User'}</div>
                                <div class="profile-email">${response.data.email || ''}</div>
                            </div>
                            <div class="profile-divider"></div>
                            <a href="#" onclick="logout()" class="profile-menu-item logout">
                                <span>🚪</span> Logout
                            </a>
                        </div>
                    </div>
                `;
            }
            
            navLinks.innerHTML = navHTML;
        } catch (error) {
            console.error('Error updating navigation:', error);
            // Fallback navigation
            navLinks.innerHTML = `
                <a href="/pages/mode-selection.html">Choose Mode</a>
                <div class="user-profile-dropdown">
                    <button class="profile-btn" onclick="toggleProfileMenu(event)">
                        <span class="profile-icon">👤</span>
                        <span class="profile-name">User</span>
                        <span class="dropdown-arrow">▼</span>
                    </button>
                    <div class="profile-menu" id="profileMenu">
                        <a href="#" onclick="logout()" class="profile-menu-item logout">
                            <span>🚪</span> Logout
                        </a>
                    </div>
                </div>
            `;
        }
    }
}

// Helper function to redirect to appropriate dashboard based on care mode
function redirectToUserDashboard(careMode) {
    if (careMode === 'planning') {
        window.location.href = '/pages/fertility-planning.html';
    } else if (careMode === 'pregnancy') {
        window.location.href = '/pages/pregnancy-guide.html';
    } else if (careMode === 'baby-care') {
        window.location.href = '/pages/dashboard.html';
    } else {
        // Default to mode selection if unknown mode
        window.location.href = '/pages/mode-selection.html';
    }
}

function logout() {
    removeToken();
    localStorage.removeItem('user');
    window.location.href = '/index.html';
}

// Toggle profile dropdown menu
function toggleProfileMenu(event) {
    event.stopPropagation();
    const menu = document.getElementById('profileMenu');
    if (menu) {
        menu.classList.toggle('show');
    }
}

// Close profile menu when clicking outside
document.addEventListener('click', function(event) {
    const menu = document.getElementById('profileMenu');
    const profileBtn = document.querySelector('.profile-btn');
    
    if (menu && !profileBtn?.contains(event.target)) {
        menu.classList.remove('show');
    }
});

// ================================
// SHOW/HIDE PASSWORD
// ================================
function togglePassword(inputId, buttonId) {
    const input = document.getElementById(inputId);
    const button = document.getElementById(buttonId);
    
    if (input.type === 'password') {
        input.type = 'text';
        button.textContent = '🙈';
    } else {
        input.type = 'password';
        button.textContent = '👁️';
    }
}

// ================================
// TOAST NOTIFICATIONS
// ================================
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        background: ${type === 'success' ? '#10B981' : type === 'error' ? '#EF4444' : '#A78BFA'};
        color: white;
        border-radius: 0.5rem;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        z-index: 9999;
        animation: slideIn 0.3s ease-out;
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ================================
// LOADING SPINNER
// ================================
function showLoading(button) {
    button.disabled = true;
    button.dataset.originalText = button.textContent;
    button.innerHTML = '<span class="spinner"></span> Loading...';
}

function hideLoading(button) {
    button.disabled = false;
    button.textContent = button.dataset.originalText;
}

// ================================
// DATE FORMATTING
// ================================
function formatDate(date) {
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function formatTime(time) {
    return new Date(time).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
    });
}

// ================================
// INITIALIZE ON PAGE LOAD
// ================================
document.addEventListener('DOMContentLoaded', () => {
    updateNavigation();
});

// Add CSS for animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .spinner {
        display: inline-block;
        width: 14px;
        height: 14px;
        border: 2px solid rgba(255,255,255,0.3);
        border-top-color: white;
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
    }
    
    @keyframes spin {
        to { transform: rotate(360deg); }
    }
`;
document.head.appendChild(style);

// ================================
// AUTH HANDLER SCRIPTS
// ================================

// Redirect if already authenticated
document.addEventListener('DOMContentLoaded', () => {
    const currentPage = window.location.pathname;
    if ((currentPage.includes('login') || currentPage.includes('signup')) && isAuthenticated()) {
        window.location.href = '/pages/dashboard.html';
    }
});

// ================================
// LOGIN FORM
// ================================
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const submitBtn = e.target.querySelector('button[type="submit"]');
        showLoading(submitBtn);
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        try {
            const result = await apiCall('/auth/login', 'POST', { email, password });
            
            if (result.token) {
                setToken(result.token);
                localStorage.setItem('user', JSON.stringify(result.user));
                showToast('Login successful! Redirecting...', 'success');
                
                setTimeout(() => {
                    // Check if user has selected care mode
                    if (result.user && result.user.careMode) {
                        // User has already selected mode, go to appropriate page
                        redirectToUserDashboard(result.user.careMode);
                    } else {
                        // First time user, show mode selection
                        window.location.href = '/pages/mode-selection.html';
                    }
                }, 1000);
            }
        } catch (error) {
            showToast(error.message || 'Login failed. Please try again.', 'error');
            hideLoading(submitBtn);
        }
    });
}

// ================================
// SIGNUP FORM
// ================================
const signupForm = document.getElementById('signupForm');
if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const submitBtn = e.target.querySelector('button[type="submit"]');
        showLoading(submitBtn);
        
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        // Validation
        if (password !== confirmPassword) {
            showToast('Passwords do not match!', 'error');
            hideLoading(submitBtn);
            return;
        }
        
        if (password.length < 6) {
            showToast('Password must be at least 6 characters!', 'error');
            hideLoading(submitBtn);
            return;
        }
        
        const terms = document.getElementById('terms').checked;
        if (!terms) {
            showToast('Please accept the terms and conditions!', 'error');
            hideLoading(submitBtn);
            return;
        }
        
        try {
            const result = await apiCall('/auth/signup', 'POST', { name, email, password });
            
            if (result.token) {
                setToken(result.token);
                localStorage.setItem('user', JSON.stringify(result.user));
                showToast('Account created successfully! Redirecting...', 'success');
                
                setTimeout(() => {
                    // New user always goes to mode selection
                    window.location.href = '/pages/mode-selection.html';
                }, 1000);
            }
        } catch (error) {
            showToast(error.message || 'Signup failed. Please try again.', 'error');
            hideLoading(submitBtn);
        }
    });
}

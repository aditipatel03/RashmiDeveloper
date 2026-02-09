// Auth Page Logic (Mock)

document.addEventListener('DOMContentLoaded', () => {

    // Login Form Handler
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = loginForm.querySelector('button');
            const originalText = btn.innerHTML;

            // Loading State
            btn.innerHTML = '<i class="ri-loader-4-line ri-spin"></i> Logging in...';
            btn.style.opacity = '0.8';

            setTimeout(() => {
                alert('Login Successful! Welcome back.');
                // Simulate logged in state (In real app, set token)
                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('userName', 'Demo User');
                window.location.href = 'userdashboard/index.html';
            }, 1500);
        });
    }

    // Register Form Handler
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = registerForm.querySelector('button');

            // Loading State
            btn.innerHTML = '<i class="ri-loader-4-line ri-spin"></i> Creating Account...';
            btn.style.opacity = '0.8';

            setTimeout(() => {
                alert('Account Created Successfully! Please Log In.');
                window.location.href = 'login.html';
            }, 1500);
        });
    }

    // Forgot Password Handler
    const forgotForm = document.getElementById('forgotForm');
    if (forgotForm) {
        forgotForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = forgotForm.querySelector('button');

            // Loading State
            btn.innerHTML = '<i class="ri-loader-4-line ri-spin"></i> Sending...';
            btn.style.opacity = '0.8';

            setTimeout(() => {
                alert('Reset instructions sent to your email.');
                btn.innerHTML = 'Sent <i class="ri-check-line"></i>';
                btn.style.backgroundColor = 'var(--success)';
            }, 1500);
        });
    }

});

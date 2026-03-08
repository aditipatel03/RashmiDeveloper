// Auth Page Logic

document.addEventListener('DOMContentLoaded', () => {

    // Login Form Handler
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = loginForm.querySelector('input[type="email"]').value;
            const password = loginForm.querySelector('input[type="password"]').value;
            const btn = loginForm.querySelector('button');
            const originalText = btn.innerHTML;

            // Loading State
            btn.innerHTML = '<i class="ri-loader-4-line ri-spin"></i> Logging in...';
            btn.disabled = true;

            try {
                const result = await window.api.login(email, password);
                if (result.token) {
                    window.notifications.show('Login Successful! Redirecting...', 'success');
                    setTimeout(() => {
                        window.location.href = 'admin/index.html';
                    }, 1000);
                } else {
                    window.notifications.show(result.msg || 'Invalid credentials', 'error');
                    btn.innerHTML = originalText;
                    btn.disabled = false;
                }
            } catch (err) {
                window.notifications.show('Connection error. Is the server running?', 'error');
                btn.innerHTML = originalText;
                btn.disabled = false;
            }
        });
    }

    // Register Form Handler
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = registerForm.querySelector('input[placeholder="Full Name"]').value;
            const email = registerForm.querySelector('input[type="email"]').value;
            const password = registerForm.querySelector('input[type="password"]').value;
            const btn = registerForm.querySelector('button');

            btn.innerHTML = '<i class="ri-loader-4-line ri-spin"></i> Creating Account...';
            btn.disabled = true;

            try {
                const result = await window.api.register({ name, email, password });
                if (result.token || result.msg === 'User Registered') {
                    window.notifications.show('Account Created Successfully! Please Log In.', 'success');
                    setTimeout(() => window.location.href = 'login.html', 1500);
                } else {
                    window.notifications.show(result.msg || 'Registration failed', 'error');
                    btn.innerHTML = 'Sign Up';
                    btn.disabled = false;
                }
            } catch (err) {
                window.notifications.show('Error connecting to server', 'error');
                btn.innerHTML = 'Sign Up';
                btn.disabled = false;
            }
        });
    }
});

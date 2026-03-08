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
                const phone = registerForm.querySelector('input[placeholder="Phone Number"]').value;
                const result = await window.api.register({ name, email, password, phone });
                if (result.token || result.msg.toLowerCase().includes('success')) {
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

    // Forgot Password Form Handler
    const forgotForm = document.getElementById('forgotForm');
    if (forgotForm) {
        forgotForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = forgotForm.querySelector('input[type="email"]').value;
            const btn = forgotForm.querySelector('button');

            btn.innerHTML = '<i class="ri-loader-4-line ri-spin"></i> Sending...';
            btn.disabled = true;

            try {
                const result = await window.api.forgotPassword(email);
                window.notifications.show(result.msg, result.msg.includes('sent') ? 'success' : 'error');
                if (result.msg.includes('sent')) {
                    forgotForm.reset();
                }
            } catch (err) {
                window.notifications.show('Error sending instructions', 'error');
            } finally {
                btn.innerHTML = 'Send Instructions <i class="ri-send-plane-fill"></i>';
                btn.disabled = false;
            }
        });
    }

    // Reset Password Form Handler (if on reset-password.html)
    const resetForm = document.getElementById('resetForm');
    if (resetForm) {
        // Handle Supabase Hash fragment if any
        const hash = window.location.hash;
        if (hash && hash.includes('access_token')) {
            const params = new URLSearchParams(hash.replace('#', '?'));
            const token = params.get('access_token');
            if (token) localStorage.setItem('rld_token', token);
        }

        resetForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const password = resetForm.querySelector('input[placeholder="New Password"]').value;
            const confirm = resetForm.querySelector('input[placeholder="Confirm Password"]').value;

            if (password !== confirm) {
                return window.notifications.show('Passwords do not match', 'error');
            }

            const btn = resetForm.querySelector('button');
            btn.innerHTML = '<i class="ri-loader-4-line ri-spin"></i> Updating...';
            btn.disabled = true;

            try {
                const result = await window.api.resetPassword(password);
                if (result.msg.includes('success')) {
                    window.notifications.show('Password updated! Redirecting...', 'success');
                    setTimeout(() => window.location.href = 'login.html', 1500);
                } else {
                    window.notifications.show(result.msg, 'error');
                }
            } catch (err) {
                window.notifications.show('Error updating password', 'error');
            } finally {
                btn.innerHTML = 'Reset Password';
                btn.disabled = false;
            }
        });
    }
});

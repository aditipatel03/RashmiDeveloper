/**
 * auth-state.js
 * Handles dynamic Login/Logout UI in the header across all public pages.
 */

document.addEventListener('DOMContentLoaded', () => {
    const navActions = document.getElementById('user-nav-actions');
    if (!navActions) return;

    const user = window.api.getUser();

    if (user) {
        // User is logged in - Show Profile & Logout
        navActions.innerHTML = `
            <div class="user-dropdown" style="position: relative; cursor: pointer; display: flex; align-items: center; gap: 10px;">
                <div style="width: 35px; height: 35px; background: var(--gold); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">
                    ${user.username?.substring(0, 1).toUpperCase() || 'U'}
                </div>
                <span class="premium-font" style="font-size: 0.9rem;">${user.username}</span>
                <button onclick="window.api.logout()" class="btn btn-outline" style="padding: 5px 15px; font-size: 0.8rem;">Logout</button>
            </div>
            <div class="hamburger" id="hamburger">
                <i class="ri-menu-3-line"></i>
            </div>
        `;
    } else {
        // User is not logged in - Show standard Login
        navActions.innerHTML = `
            <a href="login.html" class="btn btn-outline" style="padding: 10px 20px; margin-right: 10px;">Log In</a>
            <div class="hamburger" id="hamburger">
                <i class="ri-menu-3-line"></i>
            </div>
        `;
    }
});

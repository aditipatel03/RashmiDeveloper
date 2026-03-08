/**
 * auth-state.js
 * Handles dynamic Login/Logout UI in the header across all public pages.
 */

document.addEventListener('DOMContentLoaded', () => {
    const navActions = document.getElementById('user-nav-actions');
    if (!navActions) return;

    const user = window.api.getUser();

    if (user) {
        const displayName = user.username || user.email?.split('@')[0] || 'User';
        const firstLetter = displayName.substring(0, 1).toUpperCase();

        // User is logged in - Show Premium Profile Dropdown
        navActions.innerHTML = `
            <div class="user-profile-dropdown" id="userProfileDropdown">
                <div class="user-info-trigger" id="dropdownTrigger">
                    <div class="user-avatar-circle">${firstLetter}</div>
                    <div class="user-welcome-text">
                        <span class="welcome-label">Welcome,</span>
                        <span class="user-name">${displayName}</span>
                    </div>
                    <i class="ri-arrow-down-s-line"></i>
                </div>
                <div class="dropdown-menu">
                    <a href="userdashboard/index.html">
                        <i class="ri-dashboard-line"></i> Dashboard
                    </a>
                    <a href="userdashboard/profile.html">
                        <i class="ri-user-settings-line"></i> My Profile
                    </a>
                    <hr>
                    <a href="#" id="header-logout-btn">
                        <i class="ri-logout-box-r-line"></i> Logout
                    </a>
                </div>
            </div>
            <div class="hamburger" id="hamburger">
                <i class="ri-menu-3-line"></i>
            </div>
        `;

        // Dropdown Toggle Logic
        const dropdown = document.getElementById('userProfileDropdown');
        const trigger = document.getElementById('dropdownTrigger');
        const logoutBtn = document.getElementById('header-logout-btn');

        trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdown.classList.toggle('active');
        });

        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.api.logout();
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!dropdown.contains(e.target)) {
                dropdown.classList.remove('active');
            }
        });
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

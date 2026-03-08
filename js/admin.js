document.addEventListener('DOMContentLoaded', async () => {
    // Check Authentication
    const token = window.api.getToken();
    if (!token && !window.location.pathname.includes('login.html')) {
        window.location.href = '../login.html';
    }

    // Sidebar Navigation Highlighting
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-link');

    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage || (currentPage === '' && href === 'index.html')) {
            link.classList.add('active');
        }
    });

    // --- Global Data Fetching ---
    let stats = null;
    if (document.querySelector('.stats-grid')) {
        try {
            stats = await window.api.getDashboardStats();
            updateAllStats(stats);
        } catch (err) {
            console.error('Failed to load global stats:', err);
        }
    }

    function updateAllStats(s) {
        if (!s) return;

        // Index Dashboard
        const totalPropEl = document.getElementById('stat-total-props');
        const pendingPropEl = document.getElementById('stat-pending-props');
        const visitsTodayEl = document.getElementById('stat-visits-today');
        const totalUsersEl = document.getElementById('stat-total-users');

        if (totalPropEl) totalPropEl.textContent = s.totalProperties;
        if (pendingPropEl) pendingPropEl.textContent = s.pendingProperties;
        if (visitsTodayEl) visitsTodayEl.textContent = s.visitsToday;
        if (totalUsersEl) totalUsersEl.textContent = s.totalUsers;

        // Properties Page Specific
        const activePropEl = document.getElementById('stat-active-props');
        const pendingPropListEl = document.getElementById('stat-pending-props-list');
        const soldPropEl = document.getElementById('stat-sold-props');

        if (activePropEl) activePropEl.textContent = s.activeProperties;
        if (pendingPropListEl) pendingPropListEl.textContent = s.pendingProperties;
        if (soldPropEl) soldPropEl.textContent = s.soldProperties;

        // Users Page Specific
        const totalUsersListEl = document.getElementById('stat-total-users-list');
        if (totalUsersListEl) totalUsersListEl.textContent = s.totalUsers;
    }

    async function refreshStats() {
        try {
            const newStats = await window.api.getDashboardStats();
            updateAllStats(newStats);
        } catch (err) {
            console.error('Stats refresh failed:', err);
        }
    }

    // --- Dynamic Property Management (for properties.html) ---
    const adminPropsTable = document.getElementById('admin-properties-table');
    if (adminPropsTable) {
        renderAdminProperties();
    }

    async function renderAdminProperties() {
        const tbody = adminPropsTable.querySelector('tbody');
        try {
            const properties = await window.api.getProperties();

            if (!properties || properties.length === 0) {
                tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding: 40px; color: #888;">No properties found in database.</td></tr>';
                return;
            }

            tbody.innerHTML = properties.map(prop => `
                <tr>
                    <td>
                        <div style="display: flex; align-items: center; gap: 15px;">
                            <img src="${prop.image}" alt="" style="width: 50px; height: 50px; border-radius: 8px; object-fit: cover;">
                        </div>
                    </td>
                    <td>
                        <strong style="display: block;">${prop.title}</strong>
                        <span style="font-size: 0.8rem; color: #888;">ID: #${prop.id?.toString().slice(-6)}</span>
                    </td>
                    <td>${prop.category}</td>
                    <td>₹ ${prop.price}</td>
                    <td>${prop.location}</td>
                    <td><span class="status-badge status-${prop.verified ? 'active' : 'pending'}">${prop.verified ? 'Verified' : 'Pending'}</span></td>
                    <td>
                        <div style="display: flex; gap: 5px;">
                            <button class="action-icon-btn edit" onclick="window.location.href='add-property.html?id=${prop.id}'"><i class="ri-edit-line"></i></button>
                            <button class="action-icon-btn delete" onclick="deleteProperty('${prop.id}')" title="Delete Listing">
                                <i class="ri-delete-bin-line"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `).join('');
        } catch (err) {
            console.error('Failed to load admin properties:', err);
            tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; color: red;">Error loading properties.</td></tr>';
        }
    }

    window.deleteProperty = async (id) => {
        if (confirm('Are you sure you want to delete this property?')) {
            try {
                const response = await window.api.deleteProperty(id);
                if (response) {
                    window.notifications.show('Property deleted successfully', 'success');
                    renderAdminProperties();
                    refreshStats();
                } else {
                    window.notifications.show('Failed to delete property', 'error');
                }
            } catch (err) {
                window.notifications.show('Error deleting property', 'error');
            }
        }
    };

    // --- Users Management (for users.html) ---
    const adminUsersTable = document.getElementById('admin-users-table');
    if (adminUsersTable) {
        renderUsersList();
    }

    async function renderUsersList() {
        try {
            const users = await window.api.getUsersList();
            if (!users || users.length === 0) {
                adminUsersTable.innerHTML = '<tr><td colspan="6" style="text-align:center; padding: 40px; color: #888;">No users found.</td></tr>';
                return;
            }

            adminUsersTable.innerHTML = users.map(user => `
                <tr>
                    <td>
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <div style="width: 30px; height: 30px; background: var(--admin-gold); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; font-weight: bold;">
                                ${user.username?.substring(0, 2).toUpperCase() || 'U'}
                            </div>
                            <strong>${user.username || 'User'}</strong>
                        </div>
                    </td>
                    <td>${user.email || 'N/A'}</td>
                    <td>${new Date(user.created_at).toLocaleDateString()}</td>
                    <td>-</td>
                    <td><span class="status-badge status-active">${user.role?.toUpperCase() || 'USER'}</span></td>
                    <td>
                        <button class="action-icon-btn delete" onclick="deleteUser('${user.id}')" title="Delete User account"><i class="ri-delete-bin-line"></i></button>
                    </td>
                </tr>
            `).join('');
        } catch (err) {
            console.error('Failed to load users:', err);
            adminUsersTable.innerHTML = '<tr><td colspan="6" style="text-align:center; color: red;">Error loading users.</td></tr>';
        }
    }

    window.deleteUser = async (id) => {
        if (confirm('Are you sure you want to delete this user?')) {
            try {
                const result = await window.api.deleteUser(id);
                if (result) {
                    window.notifications.show('User deleted successfully', 'success');
                    renderUsersList();
                    refreshStats();
                }
            } catch (err) {
                window.notifications.show('Error deleting user', 'error');
            }
        }
    };

    // --- Appointment Management (for appointments.html) ---
    const adminAppointmentsTable = document.getElementById('admin-appointments-table');
    if (adminAppointmentsTable) {
        renderAppointments();
    }

    async function renderAppointments() {
        try {
            const appointments = await window.api.getAppointments();

            if (!appointments || appointments.length === 0) {
                adminAppointmentsTable.innerHTML = '<tr><td colspan="6" style="text-align:center; padding: 40px; color: #888;">No appointment requests found.</td></tr>';
                return;
            }

            adminAppointmentsTable.innerHTML = appointments.map(app => `
                <tr>
                    <td><strong>${new Date(app.created_at).toLocaleDateString()}</strong><br><span style="font-size: 0.8rem; color: #888;">${new Date(app.created_at).toLocaleTimeString()}</span></td>
                    <td>${app.name}<br><span style="font-size: 0.8rem; color: #888;">${app.phone}</span></td>
                    <td>${app.property_id ? 'Property: ' + app.property_id.slice(-6) : 'General Enquiry'}</td>
                    <td><span style="background: #e3f2fd; color: #1565c0; padding: 4px 8px; border-radius: 4px; font-size: 0.8rem;">Enquiry</span></td>
                    <td><span class="status-badge status-pending">Pending</span></td>
                    <td>
                        <button class="action-icon-btn approve" title="Confirm" onclick="alert('Feature coming soon')"><i class="ri-check-line"></i></button>
                        <button class="action-icon-btn delete" title="Cancel" onclick="deleteAppointment('${app.id}')"><i class="ri-close-line"></i></button>
                    </td>
                </tr>
            `).join('');
        } catch (err) {
            console.error('Failed to load appointments:', err);
            adminAppointmentsTable.innerHTML = '<tr><td colspan="6" style="text-align:center; color: red;">Error loading appointments.</td></tr>';
        }
    }

    window.deleteAppointment = async (id) => {
        if (confirm('Are you sure you want to cancel this appointment?')) {
            try {
                const response = await window.api.deleteAppointment(id);
                if (response) {
                    window.notifications.show('Appointment cancelled', 'success');
                    renderAppointments();
                    refreshStats();
                } else {
                    window.notifications.show('Failed to delete appointment', 'error');
                }
            } catch (err) {
                window.notifications.show('Error deleting appointment', 'error');
            }
        }
    };

    // --- Verification Table (Dashboard index.html) ---
    const verificationsTable = document.getElementById('recent-verifications-table');
    if (verificationsTable) {
        renderRecentVerifications();
    }

    async function renderRecentVerifications() {
        try {
            const properties = await window.api.getProperties();
            const pending = properties.filter(p => !p.verified).slice(0, 5); // Show last 5 pending

            if (pending.length === 0) {
                verificationsTable.innerHTML = '<tr><td colspan="5" style="text-align:center; padding: 20px; color: #888;">No pending verification requests.</td></tr>';
                return;
            }

            verificationsTable.innerHTML = pending.map(prop => `
                <tr>
                    <td>${prop.title}</td>
                    <td>Admin</td>
                    <td>${prop.location}</td>
                    <td><span class="status-badge status-pending">Pending</span></td>
                    <td>
                        <button class="action-icon-btn approve" onclick="approveProperty('${prop.id}')"><i class="ri-check-line"></i></button>
                        <button class="action-icon-btn delete" onclick="deleteProperty('${prop.id}')"><i class="ri-close-line"></i></button>
                    </td>
                </tr>
            `).join('');
        } catch (err) {
            console.error('Failed to load verifications:', err);
        }
    }

    window.approveProperty = async (id) => {
        try {
            const result = await window.api.verifyProperty(id);
            if (result) {
                window.notifications.show('Property verified successfully', 'success');
                renderRecentVerifications();
                refreshStats();
            }
        } catch (err) {
            window.notifications.show('Error approving property', 'error');
        }
    };
});

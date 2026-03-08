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
                tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding: 40px; color: #888;">No properties found in database.</td></tr>';
                return;
            }

            tbody.innerHTML = properties.map(prop => `
                <tr>
                    <td>
                        <div style="display: flex; align-items: center; gap: 15px;">
                            <img src="${prop.image}" alt="" style="width: 50px; height: 50px; border-radius: 8px; object-fit: cover;">
                            <div>
                                <strong style="display: block;">${prop.title}</strong>
                                <span style="font-size: 0.8rem; color: #888;">ID: #${prop.id?.toString().slice(-6)}</span>
                            </div>
                        </div>
                    </td>
                    <td>${prop.category}</td>
                    <td>₹ ${prop.price}</td>
                    <td>${prop.location}</td>
                    <td><span class="status-badge status-${prop.status === 'Ready to Move' ? 'active' : 'pending'}">${prop.status}</span></td>
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
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; color: red;">Error loading properties.</td></tr>';
        }
    }

    window.deleteProperty = async (id) => {
        if (confirm('Are you sure you want to delete this property?')) {
            try {
                const response = await window.api.deleteProperty(id);
                if (response) {
                    window.notifications.show('Property deleted successfully', 'success');
                    renderAdminProperties();
                    updateDashboardStats();
                } else {
                    window.notifications.show('Failed to delete property', 'error');
                }
            } catch (err) {
                window.notifications.show('Error deleting property', 'error');
            }
        }
    };

    // --- Dashboard Stats (for index.html) ---
    async function updateDashboardStats() {
        const totalPropEl = document.getElementById('stat-total-props');
        const pendingPropEl = document.getElementById('stat-pending-props');

        try {
            const properties = await window.api.getProperties();
            if (totalPropEl) totalPropEl.textContent = properties.length;
            if (pendingPropEl) {
                const pendingCount = properties.filter(p => !p.verified).length;
                pendingPropEl.textContent = pendingCount;
            }
        } catch (err) {
            console.error('Failed to update stats:', err);
        }
    }

    if (document.getElementById('stat-total-props')) {
        updateDashboardStats();
    }

    // --- Verification Table (Dashboard) ---
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
                updateDashboardStats();
            }
        } catch (err) {
            window.notifications.show('Error approving property', 'error');
        }
    };

    // --- Appointment Management (for appointments.html) ---
    const appointmentsTable = document.getElementById('appointments-table');
    if (appointmentsTable) {
        renderAppointments();
    }

    async function renderAppointments() {
        const tbody = appointmentsTable.querySelector('tbody');
        try {
            const appointments = await window.api.getAppointments();

            if (!appointments || appointments.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding: 40px; color: #888;">No appointment requests found.</td></tr>';
                return;
            }

            tbody.innerHTML = appointments.map(app => `
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
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; color: red;">Error loading appointments.</td></tr>';
        }
    }

    window.deleteAppointment = async (id) => {
        if (confirm('Are you sure you want to cancel this appointment?')) {
            try {
                const response = await window.api.deleteAppointment(id);
                if (response) {
                    window.notifications.show('Appointment cancelled', 'success');
                    renderAppointments();
                } else {
                    window.notifications.show('Failed to delete appointment', 'error');
                }
            } catch (err) {
                window.notifications.show('Error deleting appointment', 'error');
            }
        }
    };

    // --- Add/Edit Property Form (admin/add-property.html) ---
    const addPropertyForm = document.getElementById('add-property-form');
    if (addPropertyForm) {
        // Check if editing
        const urlParams = new URLSearchParams(window.location.search);
        const editId = urlParams.get('id');

        if (editId) {
            document.querySelector('.page-title h2').textContent = 'Edit Property';
            const prop = await window.api.getProperty(editId);
            if (prop) {
                document.getElementById('prop-title').value = prop.title || '';
                document.getElementById('prop-category').value = prop.category || 'Apartment';
                document.getElementById('prop-price').value = prop.price || '';
                document.getElementById('prop-location').value = prop.location || 'Raigad';
                document.getElementById('prop-type').value = prop.type || '';
                document.getElementById('prop-area').value = prop.area || '';
                document.getElementById('prop-status').value = prop.status || 'Ready to Move';
                document.getElementById('prop-desc').value = prop.description || '';
                if (document.getElementById('prop-possession')) document.getElementById('prop-possession').value = prop.possession || '';
                if (document.getElementById('prop-rera')) document.getElementById('prop-rera').value = prop.rera || '';
                if (document.getElementById('prop-floor')) document.getElementById('prop-floor').value = prop.floor || '';
                if (document.getElementById('prop-facing')) document.getElementById('prop-facing').value = prop.facing || 'East';
                if (document.getElementById('prop-furnishing')) document.getElementById('prop-furnishing').value = prop.furnishing || 'Unfurnished';
            }
        }

        addPropertyForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const submitBtn = addPropertyForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerText;
            submitBtn.innerText = 'Processing...';
            submitBtn.disabled = true;

            const formData = new FormData();
            formData.append('title', document.getElementById('prop-title').value);
            formData.append('category', document.getElementById('prop-category').value);
            formData.append('price', document.getElementById('prop-price').value);
            formData.append('location', document.getElementById('prop-location').value);
            formData.append('type', document.getElementById('prop-type').value);
            formData.append('area', document.getElementById('prop-area').value);
            formData.append('status', document.getElementById('prop-status').value);
            formData.append('description', document.getElementById('prop-desc').value);
            formData.append('verified', true);

            // Enhanced fields
            if (document.getElementById('prop-possession')) formData.append('possession', document.getElementById('prop-possession').value);
            if (document.getElementById('prop-rera')) formData.append('rera', document.getElementById('prop-rera').value);
            if (document.getElementById('prop-floor')) formData.append('floor', document.getElementById('prop-floor').value);
            if (document.getElementById('prop-facing')) formData.append('facing', document.getElementById('prop-facing').value);
            if (document.getElementById('prop-furnishing')) formData.append('furnishing', document.getElementById('prop-furnishing').value);

            // Default amenities
            formData.append('amenities', JSON.stringify(['Lift', 'Security', 'Parking', 'Water Supply']));

            const imageFile = document.getElementById('prop-image').files[0];
            if (imageFile) {
                formData.append('image', imageFile);
            }

            try {
                const response = editId
                    ? await window.api.updateProperty(editId, formData)
                    : await window.api.addProperty(formData);

                if (response && !response.msg) {
                    window.notifications.show(`Property ${editId ? 'updated' : 'published'} successfully!`, 'success');
                    setTimeout(() => window.location.href = 'properties.html', 1500);
                } else {
                    window.notifications.show(response.msg || 'Failed to save property', 'error');
                    submitBtn.innerText = originalText;
                    submitBtn.disabled = false;
                }
            } catch (err) {
                window.notifications.show('Error saving property', 'error');
                submitBtn.innerText = originalText;
                submitBtn.disabled = false;
            }
        });
    }
});

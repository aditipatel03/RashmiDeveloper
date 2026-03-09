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
        const newUsersEl = document.getElementById('stat-new-users');
        const blockedUsersEl = document.getElementById('stat-blocked-users');

        if (totalUsersListEl) totalUsersListEl.textContent = s.totalUsers;
        if (newUsersEl) newUsersEl.textContent = s.newUsersToday || 0;
        if (blockedUsersEl) blockedUsersEl.textContent = s.blockedUsers || 0;

        // Enquiry Stats
        const totalEnquiriesEl = document.getElementById('stat-total-enquiries');
        const totalVisitsEl = document.getElementById('stat-total-visits');

        if (totalEnquiriesEl) totalEnquiriesEl.textContent = s.totalEnquiries || 0;
        if (totalVisitsEl) totalVisitsEl.textContent = s.totalSiteVisits || 0;
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
                    <td><span class="status-badge status-${(prop.status || 'Active').toLowerCase()}" onclick="togglePropertyStatus('${prop.id}', '${prop.status || 'Active'}')">${prop.status || 'Active'}</span></td>
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

    window.togglePropertyStatus = async (id, currentStatus) => {
        const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
        try {
            const result = await window.api.updatePropertyStatus(id, newStatus);
            if (result) {
                window.notifications.show(`Property marked as ${newStatus}`, 'success');
                renderAdminProperties();
                refreshStats();
            }
        } catch (err) {
            window.notifications.show('Failed to update status', 'error');
        }
    };

    window.deleteProperty = async (id) => {
        window.notifications.confirm('Are you sure you want to delete this property? All associated enquiries will also be affected.', async () => {
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
        });
    };

    window.updateAppointmentStatus = async (id, status) => {
        try {
            const result = await window.api.updateAppointmentStatus(id, status);
            if (result) {
                window.notifications.show(`Entry marked as ${status}`, 'success');
                renderAppointmentsList();
            }
        } catch (err) {
            console.error('Update status error:', err);
            window.notifications.show('Failed to update status', 'error');
        }
    };

    window.deleteAppointment = async (id) => {
        window.notifications.confirm('Are you sure you want to remove this enquiry? This action cannot be undone.', async () => {
            try {
                await window.api.deleteAppointment(id);
                window.notifications.show('Enquiry removed successfully', 'success');
                renderAppointmentsList();
            } catch (err) {
                console.error('Delete error:', err);
                window.notifications.show('Error removing enquiry', 'error');
            }
        });
    };

    // --- Appointments/Enquiries Management (for appointments.html) ---
    const adminAppsTable = document.getElementById('admin-appointments-table');
    if (adminAppsTable) {
        renderAppointmentsList();
    }

    async function renderAppointmentsList() {
        try {
            const appointments = await window.api.getAppointments();
            if (!appointments || appointments.length === 0) {
                adminAppsTable.innerHTML = '<tr><td colspan="7" style="text-align:center; padding: 40px; color: #888;">No enquiry requests found.</td></tr>';
                return;
            }

            adminAppsTable.innerHTML = appointments.map(app => `
                <tr>
                    <td>
                        <div style="font-weight: 600;">${new Date(app.created_at).toLocaleDateString()}</div>
                        <div style="font-size: 0.8rem; color: #888;">${new Date(app.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                    </td>
                    <td>
                        <div style="font-weight: 600;">${app.name}</div>
                        <div style="font-size: 0.8rem; color: #888;">${app.phone}</div>
                        ${app.email ? `<div style="font-size: 0.75rem; color: #aaa;">${app.email}</div>` : ''}
                    </td>
                    <td>
                        <div style="font-weight: 500;">${app.property_id ? (app.property_id.title || 'Unknown Property') : '<span style="color: #666; font-style: italic;">General Website Enquiry</span>'}</div>
                        ${app.property_id ? `<div style="font-size: 0.8rem; color: var(--admin-gold);"><i class="ri-map-pin-line"></i> ${app.property_id.location || 'N/A'}</div>` : '<div style="font-size: 0.8rem; color: #888;">Contact Form Submission</div>'}
                    </td>
                    <td>
                        <span class="type-badge ${app.type === 'Site Visit' ? 'type-site' : 'type-enquiry'}">
                            ${app.type || 'Enquiry'}
                        </span>
                    </td>
                    <td style="max-width: 250px;">
                        ${app.subject ? `<div style="font-weight: 600; font-size: 0.85rem; margin-bottom: 4px; color: var(--primary-color);">${app.subject}</div>` : ''}
                        <div style="font-size: 0.9rem; color: #555; white-space: normal; line-height: 1.4;">${app.message || '-'}</div>
                    </td>
                    <td><span class="status-badge status-${(app.status || 'Pending').toLowerCase()}">${app.status || 'Pending'}</span></td>
                    <td>
                        <div style="display: flex; gap: 8px;">
                            <button class="action-icon-btn edit" onclick="updateAppointmentStatus('${app.id}', 'Confirmed')" title="Confirm Entry"><i class="ri-check-line"></i></button>
                            <button class="action-icon-btn delete" onclick="deleteAppointment('${app.id}')" title="Delete Entry"><i class="ri-delete-bin-line"></i></button>
                        </div>
                    </td>
                </tr>
            `).join('');
        } catch (err) {
            console.error('Failed to load appointments:', err);
            adminAppsTable.innerHTML = '<tr><td colspan="7" style="text-align:center; color: red; padding: 20px;">Error loading enquiries. Please ensure you are logged in as admin.</td></tr>';
        }
    }

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
        window.notifications.confirm('Are you sure you want to delete this user? This cannot be undone.', async () => {
            try {
                await window.api.deleteUser(id);
                window.notifications.show('User deleted successfully', 'success');
                renderUsersList();
                refreshStats();
            } catch (err) {
                window.notifications.show('Error deleting user', 'error');
            }
        });
    };

    // --- Property Form Handling (add-property.html) ---
    const addPropertyForm = document.getElementById('add-property-form');
    if (addPropertyForm) {
        const urlParams = new URLSearchParams(window.location.search);
        const editId = urlParams.get('id');
        const imageInput = document.getElementById('prop-image');
        const previewContainer = document.getElementById('image-previews');
        const uploadArea = document.getElementById('image-upload-area');

        let selectedFiles = [];
        let existingImages = [];
        let thumbnailIndex = 0;

        // If Editing, Load Data
        if (editId) {
            document.querySelector('.page-title h2').textContent = 'Edit Property';
            loadPropertyData(editId);
        }

        async function loadPropertyData(id) {
            try {
                const prop = await window.api.getProperty(id);
                document.getElementById('prop-title').value = prop.title;
                document.getElementById('prop-price').value = prop.price;
                document.getElementById('prop-location').value = prop.location;
                document.getElementById('prop-category').value = prop.category;
                document.getElementById('prop-desc').value = prop.description;
                document.getElementById('prop-type').value = prop.type;
                document.getElementById('prop-area').value = prop.area;
                document.getElementById('prop-availability').value = prop.availability || 'Ready to Move';
                document.getElementById('prop-floor').value = prop.floor;
                document.getElementById('prop-facing').value = prop.facing;
                document.getElementById('prop-furnishing').value = prop.furnishing;

                // Set Amenities
                const amenityChecks = document.querySelectorAll('input[name="amenity"]');
                const propAmenities = prop.amenities || [];
                amenityChecks.forEach(check => {
                    check.checked = propAmenities.includes(check.value);
                });

                existingImages = prop.images || (prop.image ? [prop.image] : []);
                thumbnailIndex = prop.thumbnail_index || 0;
                renderPreviews();
            } catch (err) {
                console.error('Failed to load property for edit:', err);
            }
        }

        imageInput.addEventListener('change', (e) => {
            const files = Array.from(e.target.files);
            if (selectedFiles.length + files.length > 10) {
                alert('Maximum 10 images allowed');
                return;
            }
            selectedFiles = [...selectedFiles, ...files];
            renderPreviews();
        });

        // Drag and Drop
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.style.borderColor = 'var(--admin-gold)';
            uploadArea.style.background = '#fcf8f2';
        });

        uploadArea.addEventListener('dragleave', () => {
            uploadArea.style.borderColor = '#ddd';
            uploadArea.style.background = 'transparent';
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.style.borderColor = '#ddd';
            uploadArea.style.background = 'transparent';
            const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
            if (selectedFiles.length + files.length > 10) {
                alert('Maximum 10 images allowed');
                return;
            }
            selectedFiles = [...selectedFiles, ...files];
            renderPreviews();
        });

        function renderPreviews() {
            previewContainer.innerHTML = '';

            // Combine existing and new for preview
            const allPreviews = [
                ...existingImages.map((src, idx) => ({ src, type: 'existing', index: idx })),
                ...selectedFiles.map((file, idx) => ({ src: URL.createObjectURL(file), type: 'new', index: idx }))
            ];

            allPreviews.forEach((item, idx) => {
                const div = document.createElement('div');
                div.className = `preview-card ${idx === thumbnailIndex ? 'is-thumbnail' : ''}`;
                div.style.cssText = `
                    position: relative;
                    border-radius: 8px;
                    overflow: hidden;
                    border: 2px solid ${idx === thumbnailIndex ? 'var(--admin-gold)' : '#eee'};
                    aspect-ratio: 1;
                    cursor: pointer;
                `;

                div.innerHTML = `
                    <img src="${item.src}" style="width: 100%; height: 100%; object-fit: cover;">
                    <div style="position: absolute; top: 5px; right: 5px; background: rgba(0,0,0,0.5); color: white; width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 10px;" onclick="removeImage(${idx}, '${item.type}', event)">
                        <i class="ri-close-line"></i>
                    </div>
                    ${idx === thumbnailIndex ? '<div style="position: absolute; bottom: 0; left: 0; right: 0; background: var(--admin-gold); color: white; font-size: 10px; text-align: center; padding: 2px;">Main</div>' : ''}
                `;

                div.onclick = () => {
                    thumbnailIndex = idx;
                    renderPreviews();
                };

                previewContainer.appendChild(div);
            });
        }

        window.removeImage = (idx, type, event) => {
            event.stopPropagation();
            if (type === 'existing') {
                existingImages.splice(idx, 1);
            } else {
                // Adjust index for new files
                const newFilesIdx = idx - existingImages.length;
                selectedFiles.splice(newFilesIdx, 1);
            }

            // Reset thumbnail if removed
            if (thumbnailIndex === idx) thumbnailIndex = 0;
            else if (thumbnailIndex > idx) thumbnailIndex--;

            renderPreviews();
        };

        addPropertyForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitBtn = e.target.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="ri-loader-4-line ri-spin"></i> Publishing...';

            const formData = new FormData();
            formData.append('title', document.getElementById('prop-title').value);
            formData.append('price', document.getElementById('prop-price').value);
            formData.append('location', document.getElementById('prop-location').value);
            formData.append('category', document.getElementById('prop-category').value);
            formData.append('description', document.getElementById('prop-desc').value);
            formData.append('type', document.getElementById('prop-type').value);
            formData.append('area', document.getElementById('prop-area').value);
            formData.append('availability', document.getElementById('prop-availability').value);
            formData.append('floor', document.getElementById('prop-floor').value);
            formData.append('facing', document.getElementById('prop-facing').value);
            formData.append('furnishing', document.getElementById('prop-furnishing').value);

            // Collect Amenities
            const selectedAmenities = Array.from(document.querySelectorAll('input[name="amenity"]:checked')).map(cb => cb.value);
            formData.append('amenities', JSON.stringify(selectedAmenities));

            formData.append('thumbnailIndex', thumbnailIndex);

            selectedFiles.forEach(file => formData.append('images', file));
            if (editId) {
                formData.append('existingImages', JSON.stringify(existingImages));
            }

            try {
                let result;
                if (editId) {
                    result = await window.api.updateProperty(editId, formData);
                } else {
                    result = await window.api.addProperty(formData);
                }

                if (result) {
                    window.notifications.show(`Property ${editId ? 'updated' : 'published'} successfully!`, 'success');
                    setTimeout(() => window.location.href = 'properties.html', 1500);
                }
            } catch (err) {
                window.notifications.show('Error saving property', 'error');
                submitBtn.disabled = false;
                submitBtn.textContent = editId ? 'Update Property' : 'Publish Property';
            }
        });
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

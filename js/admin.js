document.addEventListener('DOMContentLoaded', () => {

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

    function renderAdminProperties() {
        const tbody = adminPropsTable.querySelector('tbody');
        const customProps = JSON.parse(localStorage.getItem('rld_custom_properties')) || [];

        if (customProps.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding: 40px; color: #888;">No custom properties found. Submit one via the "Sell Property" page!</td></tr>';
            return;
        }

        tbody.innerHTML = customProps.map(prop => `
            <tr>
                <td>
                    <div style="display: flex; align-items: center; gap: 15px;">
                        <img src="${prop.image}" alt="" style="width: 50px; height: 50px; border-radius: 8px; object-fit: cover;">
                        <div>
                            <strong style="display: block;">${prop.title}</strong>
                            <span style="font-size: 0.8rem; color: #888;">ID: #${prop.id.toString().slice(-6)}</span>
                        </div>
                    </div>
                </td>
                <td>${prop.category}</td>
                <td>₹ ${prop.price}</td>
                <td>${prop.location}</td>
                <td><span class="status-badge status-${prop.status}">${prop.status.charAt(0).toUpperCase() + prop.status.slice(1)}</span></td>
                <td>
                    <div style="display: flex; gap: 5px;">
                        ${prop.status === 'pending' ? `
                            <button class="action-icon-btn approve" onclick="approveProperty(${prop.id})" title="Approve & Publish">
                                <i class="ri-checkbox-circle-line"></i>
                            </button>
                        ` : ''}
                        <button class="action-icon-btn edit" onclick="alert('Edit feature coming soon!')"><i class="ri-edit-line"></i></button>
                        <button class="action-icon-btn delete" onclick="deleteProperty(${prop.id})" title="Delete Listing">
                            <i class="ri-delete-bin-line"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    // Expose functions to window for onclick handlers
    window.approveProperty = (id) => {
        let customProps = JSON.parse(localStorage.getItem('rld_custom_properties')) || [];
        const index = customProps.findIndex(p => p.id === id);
        if (index !== -1) {
            customProps[index].status = 'active';
            customProps[index].verified = true;
            localStorage.setItem('rld_custom_properties', JSON.stringify(customProps));
            alert('Property approved and is now live!');
            renderAdminProperties();
            updateDashboardStats(); // If on index
        }
    };

    window.deleteProperty = (id) => {
        if (confirm('Are you sure you want to delete this property?')) {
            let customProps = JSON.parse(localStorage.getItem('rld_custom_properties')) || [];
            customProps = customProps.filter(p => p.id !== id);
            localStorage.setItem('rld_custom_properties', JSON.stringify(customProps));
            renderAdminProperties();
            updateDashboardStats(); // If on index
        }
    };

    // --- Dashboard Stats (for index.html) ---
    function updateDashboardStats() {
        const customProps = JSON.parse(localStorage.getItem('rld_custom_properties')) || [];

        // Count elements
        const totalPropEl = document.getElementById('stat-total-props');
        const pendingPropEl = document.getElementById('stat-pending-props');
        const activePropEl = document.getElementById('stat-active-props');

        if (totalPropEl) {
            // Base static properties (4) + custom
            totalPropEl.textContent = 4 + customProps.length;
        }
        if (pendingPropEl) {
            const pendingCount = customProps.filter(p => p.status === 'pending').length;
            pendingPropEl.textContent = pendingCount;
        }
    }

    if (document.getElementById('stat-total-props')) {
        updateDashboardStats();
    }

    // --- Add Property Form (admin/add-property.html) ---
    const addPropertyForm = document.getElementById('add-property-form');
    if (addPropertyForm) {
        addPropertyForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const submitBtn = addPropertyForm.querySelector('button[type="submit"]');
            submitBtn.innerText = 'Publishing...';
            submitBtn.disabled = true;

            const newProp = {
                id: Date.now(),
                title: document.getElementById('prop-title').value,
                category: document.getElementById('prop-category').value,
                price: document.getElementById('prop-price').value,
                location: document.getElementById('prop-location').value,
                status: 'active', // Direct admin posts are active
                verified: true,
                date: new Date().toLocaleDateString('en-IN'),
                image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80'
            };

            let customProps = JSON.parse(localStorage.getItem('rld_custom_properties')) || [];
            customProps.push(newProp);
            localStorage.setItem('rld_custom_properties', JSON.stringify(customProps));

            setTimeout(() => {
                alert('Property published successfully!');
                window.location.href = 'properties.html';
            }, 1000);
        });
    }
});

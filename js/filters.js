// properties is now global

document.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById('properties-grid');
    const countSpan = document.getElementById('count');
    const applyBtn = document.getElementById('apply-filters');

    // Function to render properties
    function renderProperties(data) {
        grid.innerHTML = data.map(prop => `
            <div class="project-card">
                <div class="project-img">
                    <span class="badge-verified">${prop.brokerage === 0 ? '0% Brokerage' : ''}</span>
                    <img src="${prop.image}" alt="${prop.title}">
                    <div class="price-tag">₹${prop.price}</div>
                </div>
                <div class="project-info">
                    <div class="badge-verified" style="display:inline-block; margin-bottom:10px;">Rashmi Verified</div>
                    <h3>${prop.title}</h3>
                    <p><i class="ri-map-pin-line"></i> ${prop.location}</p>
                    <div class="project-meta">
                        <span><i class="ri-layout-grid-line"></i> ${prop.type}</span>
                        <span><i class="ri-ruler-2-line"></i> ${prop.area}</span>
                    </div>
                    <div class="project-actions">
                        <a href="property-detail.html?id=${prop.id}" class="btn btn-outline">View Details <i class="ri-arrow-right-line"></i></a>
                        <button class="btn btn-primary"><i class="ri-whatsapp-line"></i> Chat</button>
                    </div>
                </div>
            </div>
        `).join('');
        countSpan.textContent = data.length;
    }

    // --- Dynamic Data Sync ---
    // Fetch custom properties from localStorage (only approved ones)
    const customProps = JSON.parse(localStorage.getItem('rld_custom_properties')) || [];
    const approvedProps = customProps.filter(p => p.status === 'active');

    // Merge with static properties from data.js
    const allProperties = [...properties, ...approvedProps];

    // Initial Render
    renderProperties(allProperties);

    // Sorting Logic
    const sortSelect = document.getElementById('sort-by');

    function sortProperties(data, criteria) {
        let sorted = [...data];
        if (criteria === 'price-low') {
            sorted.sort((a, b) => parseInt(a.price.replace(/,/g, '')) - parseInt(b.price.replace(/,/g, '')));
        } else if (criteria === 'price-high') {
            sorted.sort((a, b) => parseInt(b.price.replace(/,/g, '')) - parseInt(a.price.replace(/,/g, '')));
        } else if (criteria === 'newest') {
            sorted.sort((a, b) => b.id - a.id);
        }
        return sorted;
    }

    sortSelect.addEventListener('change', () => {
        applyFilters();
    });

    function applyFilters() {
        const selectedTypes = Array.from(document.querySelectorAll('input[name="type"]:checked')).map(cb => cb.value);
        const selectedLocation = document.getElementById('location-filter').value;
        const maxPrice = parseInt(priceSlider.value);
        const sortCriteria = sortSelect.value;

        let filtered = allProperties.filter(p => {
            const matchType = selectedTypes.length === 0 || selectedTypes.includes(p.category);
            const matchLoc = !selectedLocation || p.location.includes(selectedLocation);

            const priceNum = parseInt(p.price.toString().replace(/,/g, ''));
            const matchPrice = priceNum <= maxPrice;

            return matchType && matchLoc && matchPrice;
        });

        filtered = sortProperties(filtered, sortCriteria);
        renderProperties(filtered);
    }

    // Price Slider Logic
    const priceSlider = document.getElementById('price-slider');
    const priceReadout = document.getElementById('price-readout');

    function formatPrice(value) {
        if (value >= 10000000) {
            return `₹ ${(value / 10000000).toFixed(1)} Cr`;
        } else {
            return `₹ ${(value / 100000).toFixed(0)} L`;
        }
    }

    priceSlider.addEventListener('input', (e) => {
        priceReadout.textContent = formatPrice(e.target.value);
        applyFilters(); // Live filtering on drag
    });

    // Auto-apply filters when type or location changes
    document.querySelectorAll('input[name="type"]').forEach(input => {
        input.addEventListener('change', applyFilters);
    });
    document.getElementById('location-filter').addEventListener('change', applyFilters);

    // Initial Filter Apply
    applyFilters();

    // Filter Logic Button (Legacy support or explicit click)
    applyBtn.addEventListener('click', applyFilters);
});

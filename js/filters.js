document.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById('properties-grid');
    const countSpan = document.getElementById('count');
    const applyBtn = document.getElementById('apply-filters');
    const sortSelect = document.getElementById('sort-by');
    const priceSlider = document.getElementById('price-slider');
    const priceReadout = document.getElementById('price-readout');

    let allProperties = [];

    // Function to render properties
    function renderProperties(data) {
        if (!grid) return;

        if (!data || data.length === 0) {
            grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px;"><h3>No properties found matching your criteria.</h3></div>';
            countSpan.textContent = 0;
            return;
        }

        grid.innerHTML = data.map(prop => `
            <div class="project-card">
                <div class="project-img">
                    <span class="badge-verified">${prop.brokerage === 0 ? '0% Brokerage' : ''}</span>
                    <img src="${prop.image}" alt="${prop.title}">
                    <div class="price-tag">₹${prop.price}${prop.price.toString().includes('Cr') || prop.price.toString().includes('L') ? '' : ' L'}+</div>
                </div>
                <div class="project-info">
                    <div class="badge-verified" style="display:inline-block; margin-bottom:10px;">Rashmi Verified</div>
                    <h3>${prop.title}</h3>
                    <p><i class="ri-map-pin-line"></i> ${prop.location}</p>
                    <div class="project-meta">
                        <span><i class="ri-layout-grid-line"></i> ${prop.type.split(' ')[0]}</span>
                        <span><i class="ri-ruler-2-line"></i> ${prop.area}</span>
                    </div>
                    <div class="project-actions">
                        <a href="property-detail.html?id=${prop.id}" class="btn btn-outline">View Details <i class="ri-arrow-right-line"></i></a>
                        <button class="btn btn-primary" onclick="window.open('https://wa.me/917276271617?text=I am interested in ${prop.title}')"><i class="ri-whatsapp-line"></i> Chat</button>
                    </div>
                </div>
            </div>
        `).join('');
        countSpan.textContent = data.length;
    }

    // Handle data loaded event
    document.addEventListener('propertiesLoaded', (e) => {
        allProperties = e.detail;
        applyFilters();
    });

    // Sorting Logic
    function sortProperties(data, criteria) {
        let sorted = [...data];
        const getPriceValue = (p) => {
            let price = p.price.toString().toLowerCase().replace(/,/g, '');
            if (price.includes('cr')) return parseFloat(price) * 10000000;
            if (price.includes('l')) return parseFloat(price) * 100000;
            return parseFloat(price) || 0;
        };

        if (criteria === 'price-low') {
            sorted.sort((a, b) => getPriceValue(a) - getPriceValue(b));
        } else if (criteria === 'price-high') {
            sorted.sort((a, b) => getPriceValue(b) - getPriceValue(a));
        } else if (criteria === 'newest') {
            sorted.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        }
        return sorted;
    }

    sortSelect?.addEventListener('change', applyFilters);

    function applyFilters() {
        if (allProperties.length === 0) return;

        const selectedTypes = Array.from(document.querySelectorAll('input[name="type"]:checked')).map(cb => cb.value);
        const selectedLocation = document.getElementById('location-filter').value;
        const maxPrice = priceSlider ? parseInt(priceSlider.value) : Infinity;
        const sortCriteria = sortSelect ? sortSelect.value : 'newest';

        let filtered = allProperties.filter(p => {
            const matchType = selectedTypes.length === 0 || selectedTypes.includes(p.category);
            const matchLoc = !selectedLocation || p.location.includes(selectedLocation);

            const getPriceValue = (priceStr) => {
                let p = priceStr.toString().toLowerCase().replace(/,/g, '');
                if (p.includes('cr')) return parseFloat(p) * 10000000;
                if (p.includes('l')) return parseFloat(p) * 100000;
                return parseFloat(p) || 0;
            };

            const priceNum = getPriceValue(p.price);
            const matchPrice = priceNum <= maxPrice;

            return matchType && matchLoc && matchPrice;
        });

        filtered = sortProperties(filtered, sortCriteria);
        renderProperties(filtered);
    }

    // Price Slider Logic
    function formatPrice(value) {
        if (value >= 10000000) {
            return `₹ ${(value / 10000000).toFixed(1)} Cr`;
        } else {
            return `₹ ${(value / 100000).toFixed(0)} L`;
        }
    }

    priceSlider?.addEventListener('input', (e) => {
        if (priceReadout) priceReadout.textContent = formatPrice(e.target.value);
        applyFilters();
    });

    // Event listeners for filters
    document.querySelectorAll('input[name="type"]').forEach(input => {
        input.addEventListener('change', applyFilters);
    });
    document.getElementById('location-filter')?.addEventListener('change', applyFilters);
    applyBtn?.addEventListener('click', applyFilters);
});

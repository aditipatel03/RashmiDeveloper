// properties is now global

document.addEventListener('DOMContentLoaded', () => {
    const detailContainer = document.getElementById('property-details');

    // Get ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const id = parseInt(urlParams.get('id'));

    const prop = properties.find(p => p.id === id) || properties[0];

    // Build Detail Page
    detailContainer.innerHTML = `
        <div class="detail-main-content">
            <div class="gallery-section">
                <div class="main-gallery">
                    <button class="gallery-nav prev"><i class="ri-arrow-left-s-line"></i></button>
                    <img src="${prop.image}" class="main-img" id="main-gallery-img">
                    <button class="gallery-nav next"><i class="ri-arrow-right-s-line"></i></button>
                </div>
                <div class="thumbnails">
                    <img src="${prop.image}" class="active">
                    <img src="https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800">
                    <img src="https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=800">
                    <img src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800">
                </div>
            </div>

            <div class="property-essential-info">
                <div class="detail-badge">Rashmi Direct Exclusive • 0% Brokerage</div>
                <h1 class="premium-font">${prop.title}</h1>
                <p class="location-tag"><i class="ri-map-pin-line"></i> ${prop.location}</p>
                
                <div class="quick-pricing">
                    <span class="price-label">Agreement Value</span>
                    <span class="main-price">₹ ${prop.price}*</span>
                </div>
            </div>

            <div class="specs-section">
                <h3 class="section-title">Property Highlights</h3>
                <div class="specs-row">
                    <div class="spec-tile">
                        <i class="ri-ruler-2-line"></i>
                        <div class="spec-data">
                            <span>Carpet Area</span>
                            <strong>${prop.area}</strong>
                        </div>
                    </div>
                    <div class="spec-tile">
                        <i class="ri-building-4-line"></i>
                        <div class="spec-data">
                            <span>Structure</span>
                            <strong>${prop.floor || 'G+1'}</strong>
                        </div>
                    </div>
                    <div class="spec-tile">
                        <i class="ri-compass-3-line"></i>
                        <div class="spec-data">
                            <span>Facing</span>
                            <strong>${prop.facing || 'East'}</strong>
                        </div>
                    </div>
                    <div class="spec-tile">
                        <i class="ri-calendar-event-line"></i>
                        <div class="spec-data">
                            <span>Possession</span>
                            <strong>${prop.possession}</strong>
                        </div>
                    </div>
                </div>
            </div>

            <div class="description-box">
                <h3 class="section-title">About the Project</h3>
                <p class="long-desc">${prop.description}</p>
            </div>

            <div class="amenities-box">
                <h3 class="section-title">Modern Amenities</h3>
                <div class="amenities-badge-grid">
                    ${prop.amenities.map(a => `<div class="amenity-badge"><i class="ri-check-double-line"></i> ${a}</div>`).join('')}
                </div>
            </div>
        </div>

        <aside class="property-sidebar">
            <div class="sidebar-card contact-card">
                <h4>Interested?</h4>
                <p>Talk directly to the sales team for exclusive direct-buy offers.</p>
                
                <form class="enquiry-form">
                    <div class="input-wrap">
                        <i class="ri-user-line"></i>
                        <input type="text" placeholder="Your Name">
                    </div>
                    <div class="input-wrap">
                        <i class="ri-phone-line"></i>
                        <input type="tel" placeholder="Phone Number">
                    </div>
                    <button class="btn btn-primary w-100">Send Enquiry</button>
                </form>

                <div class="direct-actions">
                    <a href="https://wa.me/919876543210" class="btn btn-whatsapp w-100">
                        <i class="ri-whatsapp-line"></i> Chat on WhatsApp
                    </a>
                    <button class="btn btn-outline w-100"><i class="ri-calendar-check-line"></i> Book Site Visit</button>
                </div>
            </div>

            <div class="sidebar-card rera-card quick-pricing" style="width: 100%; display: flex; flex-direction: row; align-items: center; gap: 15px; margin-top: 20px;">
                <i class="ri-government-fill" style="font-size: 30px; color: var(--accent-color);"></i>
                <div>
                    <span class="price-label" style="font-size: 0.8rem; letter-spacing: 1px;">MAHARERA REGISTERED</span>
                    <span class="main-price" style="font-size: 1.2rem;">${prop.rera}</span>
                </div>
            </div>
            </div>
        </aside>
    `;

    // Thumbnail click logic
    const mainImg = document.getElementById('main-gallery-img');
    const thumbs = document.querySelectorAll('.thumbnails img');
    const prevBtn = document.querySelector('.gallery-nav.prev');
    const nextBtn = document.querySelector('.gallery-nav.next');
    let currentIndex = 0;

    const allImages = [prop.image,
        "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800",
        "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=800",
        "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800"
    ];

    function updateGallery(index) {
        currentIndex = index;
        mainImg.src = allImages[currentIndex];

        // Error handling for main image
        mainImg.onerror = function () {
            this.src = 'https://via.placeholder.com/800x500?text=Image+Not+Available';
        };

        thumbs.forEach((img, i) => {
            img.classList.toggle('active', i === currentIndex);
        });
    }

    // Initial Error Handling
    mainImg.onerror = function () {
        this.src = 'https://via.placeholder.com/800x500?text=Image+Not+Available';
    };

    thumbs.forEach((t, i) => {
        t.onerror = function () {
            this.src = 'https://via.placeholder.com/100x70?text=N/A';
        };
        t.addEventListener('click', () => updateGallery(i));
    });

    prevBtn.addEventListener('click', () => {
        let newIndex = (currentIndex - 1 + allImages.length) % allImages.length;
        updateGallery(newIndex);
    });

    nextBtn.addEventListener('click', () => {
        let newIndex = (currentIndex + 1) % allImages.length;
        updateGallery(newIndex);
    });
});

document.addEventListener('DOMContentLoaded', async () => {
    const detailContainer = document.getElementById('property-details');

    // Get ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');

    if (!id) {
        detailContainer.innerHTML = '<h2>Property not found</h2>';
        return;
    }

    try {
        const prop = await window.api.getProperty(id);

        if (!prop || prop.msg) {
            detailContainer.innerHTML = '<h2>Property not found</h2>';
            return;
        }

        const imageUrl = prop.image.startsWith('/') ? 'http://localhost:5000' + prop.image : prop.image;

        // Build Detail Page
        detailContainer.innerHTML = `
            <div class="detail-main-content">
                <div class="gallery-section">
                    <div class="main-gallery">
                        <button class="gallery-nav prev"><i class="ri-arrow-left-s-line"></i></button>
                        <img src="${imageUrl}" class="main-img" id="main-gallery-img">
                        <button class="gallery-nav next"><i class="ri-arrow-right-s-line"></i></button>
                    </div>
                    <div class="thumbnails">
                        <img src="${imageUrl}" class="active">
                        <img src="https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800">
                        <img src="https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=800">
                        <img src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800">
                    </div>
                </div>

                <div class="property-essential-info">
                    <div class="detail-badge">Rashmi Land Developers Exclusive • 0% Brokerage</div>
                    <h1 class="premium-font">${prop.title}</h1>
                    <p class="location-tag"><i class="ri-map-pin-line"></i> ${prop.location}</p>
                    
                    <div class="quick-pricing">
                        <span class="price-label">Agreement Value</span>
                        <span class="main-price">₹ ${prop.price}${prop.price.includes('Cr') || prop.price.includes('L') ? '' : ' L'}*</span>
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
                    
                    <form class="enquiry-form" id="enquiry-form">
                        <div class="input-wrap">
                            <i class="ri-user-line"></i>
                            <input type="text" id="enquiry-name" placeholder="Your Name" required>
                        </div>
                        <div class="input-wrap">
                            <i class="ri-phone-line"></i>
                            <input type="tel" id="enquiry-phone" placeholder="Phone Number" required>
                        </div>
                        <button type="submit" class="btn btn-primary w-100">Send Enquiry</button>
                    </form>

                    <div class="direct-actions">
                        <a href="https://wa.me/917262993832?text=I'm interested in ${prop.title}" class="btn btn-whatsapp w-100">
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
            </aside>
        `;

        // Handle form submission
        document.getElementById('enquiry-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const data = {
                name: document.getElementById('enquiry-name').value,
                phone: document.getElementById('enquiry-phone').value,
                email: 'direct-enquiry@rld.com', // Default placeholder
                propertyId: prop._id,
                message: `Enquiry for ${prop.title}`
            };

            try {
                await window.api.submitAppointment(data);
                window.notifications.show('Enquiry sent successfully! Our team will contact you soon.', 'success');
                e.target.reset();
            } catch (err) {
                window.notifications.show('Failed to send enquiry. Please try again.', 'error');
            }
        });

        // Gallery logic
        const mainImg = document.getElementById('main-gallery-img');
        const thumbs = document.querySelectorAll('.thumbnails img');
        const prevBtn = document.querySelector('.gallery-nav.prev');
        const nextBtn = document.querySelector('.gallery-nav.next');
        let currentIndex = 0;

        const allImages = [imageUrl,
            "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800",
            "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=800",
            "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800"
        ];

        function updateGallery(index) {
            currentIndex = index;
            mainImg.src = allImages[currentIndex];
            thumbs.forEach((img, i) => {
                img.classList.toggle('active', i === currentIndex);
            });
        }

        thumbs.forEach((t, i) => {
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

    } catch (err) {
        console.error('Error loading property details:', err);
        detailContainer.innerHTML = '<h2>Error loading property details</h2>';
    }
});

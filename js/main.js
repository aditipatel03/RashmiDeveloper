document.addEventListener('DOMContentLoaded', () => {
    // Analytics/Visit Tracking
    if (window.api && window.api.trackVisit) {
        window.api.trackVisit();
    }
    const header = document.querySelector('.main-header');
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.querySelector('.nav-links');

    // Sticky Header logic
    if (!header.classList.contains('always-scrolled')) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
    }

    // Mobile Hamburger Toggle
    if (hamburger) {
        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            const icon = hamburger.querySelector('i');
            if (navLinks.classList.contains('active')) {
                icon.classList.replace('ri-menu-3-line', 'ri-close-line');
            } else {
                icon.classList.replace('ri-close-line', 'ri-menu-3-line');
            }
        });
    }

    // Auto-close mobile menu on link click
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            if (hamburger) {
                hamburger.querySelector('i').classList.replace('ri-close-line', 'ri-menu-3-line');
            }
        });
    });

    // Testimonial Gallery Slider Logic
    const sliderContainer = document.getElementById('testimonial-container');
    const dotsContainer = document.querySelector('.slider-controls');
    const nextBtn = document.getElementById('slider-next');
    const prevBtn = document.getElementById('slider-prev');

    if (sliderContainer && dotsContainer) {
        let currentSlide = 0;
        const dots = dotsContainer.querySelectorAll('.dot');
        const totalSlides = dots.length;

        function showSlide(index) {
            if (index < 0) index = totalSlides - 1;
            if (index >= totalSlides) index = 0;

            sliderContainer.style.transform = `translateX(-${index * 100}%)`;
            dots.forEach(dot => dot.classList.remove('active'));
            if (dots[index]) dots[index].classList.add('active');
            currentSlide = index;
        }

        // Click handlers with verification
        if (nextBtn) {
            nextBtn.onclick = () => {
                showSlide(currentSlide + 1);
                resetAutoPlay();
            };
        }

        if (prevBtn) {
            prevBtn.onclick = () => {
                showSlide(currentSlide - 1);
                resetAutoPlay();
            };
        }

        dots.forEach((dot, index) => {
            dot.onclick = () => {
                showSlide(index);
                resetAutoPlay();
            };
        });

        // Autoplay
        let autoPlayInterval = setInterval(() => {
            showSlide(currentSlide + 1);
        }, 7000);

        function resetAutoPlay() {
            clearInterval(autoPlayInterval);
            autoPlayInterval = setInterval(() => {
                showSlide(currentSlide + 1);
            }, 7000);
        }
    }

    const steps = document.querySelectorAll('.form-step');
    const nextBtns = document.querySelectorAll('.next-btn');
    const prevBtns = document.querySelectorAll('.prev-btn');
    const progress = document.getElementById('progress');
    const progressSteps = document.querySelectorAll('.progress-step');
    const imageUploadZone = document.getElementById('image-upload-zone');
    const imageInput = document.getElementById('prop-images');
    const previewContainer = document.getElementById('image-previews');
    const limitMsg = document.getElementById('upload-limit-msg');

    let formStepNum = 0;
    let selectedFiles = []; // Array of { file, isMain }
    let thumbnailIndex = 0;

    if (steps.length > 0) {
        // Step Verification Helper
        function validateCurrentStep() {
            const currentStep = steps[formStepNum];
            const fields = currentStep.querySelectorAll('input[required], select[required], textarea[required]');
            let isValid = true;

            fields.forEach(field => {
                if (!field.value.trim()) {
                    field.classList.add('error-shake');
                    setTimeout(() => field.classList.remove('error-shake'), 500);
                    isValid = false;
                }
            });

            // Special check for Step 2 (Images)
            if (formStepNum === 1 && selectedFiles.length === 0) {
                if (window.notifications) {
                    window.notifications.show('Please upload at least one photo', 'warning');
                } else {
                    alert('Please upload at least one photo');
                }
                return false;
            }

            if (!isValid) {
                if (window.notifications) {
                    window.notifications.show('Please fill all mandatory fields marked with *', 'warning');
                } else {
                    alert('Please fill all mandatory fields marked with *');
                }
            }

            return isValid;
        }

        nextBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                if (validateCurrentStep()) {
                    formStepNum++;
                    updateFormSteps();
                    updateProgressBar();
                }
            });
        });

        prevBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                formStepNum--;
                updateFormSteps();
                updateProgressBar();
            });
        });
    }

    // Image Handling Logic
    if (imageInput && previewContainer) {
        imageInput.addEventListener('change', (e) => {
            const files = Array.from(e.target.files);
            const remaining = 10 - selectedFiles.length;

            if (files.length > remaining) {
                limitMsg.style.display = 'block';
            }

            files.slice(0, remaining).forEach(file => {
                selectedFiles.push({
                    file: file,
                    isMain: selectedFiles.length === 0 // First image is main by default
                });
            });

            renderPreviews();
            imageInput.value = ''; // Reset input
        });

        function renderPreviews() {
            previewContainer.innerHTML = '';
            limitMsg.style.display = selectedFiles.length >= 10 ? 'block' : 'none';

            selectedFiles.forEach((item, index) => {
                const reader = new FileReader();
                const div = document.createElement('div');
                div.className = `preview-item ${item.isMain ? 'main' : ''}`;

                reader.onload = (e) => {
                    div.innerHTML = `
                        <img src="${e.target.result}">
                        <div class="main-badge">MAIN</div>
                        <div class="preview-actions">
                            <button type="button" class="preview-btn set-main" title="Set as Main">
                                <i class="ri-star-${item.isMain ? 'fill' : 'line'}"></i>
                            </button>
                            <button type="button" class="preview-btn remove" title="Remove">
                                <i class="ri-delete-bin-line"></i>
                            </button>
                        </div>
                    `;

                    // Action Listeners
                    div.querySelector('.set-main').onclick = () => {
                        selectedFiles.forEach(f => f.isMain = false);
                        item.isMain = true;
                        thumbnailIndex = index;
                        renderPreviews();
                    };

                    div.querySelector('.remove').onclick = () => {
                        const wasMain = item.isMain;
                        selectedFiles.splice(index, 1);
                        if (wasMain && selectedFiles.length > 0) {
                            selectedFiles[0].isMain = true;
                            thumbnailIndex = 0;
                        }
                        renderPreviews();
                    };
                };
                reader.readAsDataURL(item.file);
                previewContainer.appendChild(div);
            });
        }
    }

    function updateFormSteps() {
        steps.forEach(step => {
            step.classList.contains('active') && step.classList.remove('active');
        });
        steps[formStepNum].classList.add('active');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function updateProgressBar() {
        if (!progress) return;
        progressSteps.forEach((step, idx) => {
            if (idx < formStepNum + 1) {
                step.classList.add('active');
            } else {
                step.classList.remove('active');
            }
        });
        const progressActive = document.querySelectorAll('.progress-step.active');
        progress.style.width = ((progressActive.length - 1) / (progressSteps.length - 1)) * 100 + '%';
    }

    // Sell Form Submission
    const sellForm = document.getElementById('sell-form');
    const successModal = document.getElementById('success-modal');
    if (sellForm && successModal) {
        sellForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Check Login Status
            if (!window.api.getToken()) {
                if (window.notifications) {
                    window.notifications.show('Please login to post your property', 'warning');
                } else {
                    alert('Please login to post your property');
                }
                setTimeout(() => window.location.href = '/login.html', 2000);
                return;
            }

            const btn = sellForm.querySelector('button[type="submit"]');
            btn.disabled = true;
            btn.innerHTML = '<i class="ri-loader-4-line ri-spin"></i> Uploading...';

            try {
                const formData = new FormData();
                formData.append('title', document.getElementById('prop-title').value);
                formData.append('type', 'Residential'); // Default or extract from category
                formData.append('category', document.getElementById('prop-type-select').value);
                formData.append('location', document.getElementById('prop-location').value);
                formData.append('price', document.getElementById('prop-price').value);
                formData.append('area', document.getElementById('prop-area').value);
                formData.append('description', document.getElementById('prop-description').value);
                formData.append('floor', document.getElementById('prop-floor').value);
                formData.append('availability', document.getElementById('prop-possession').value);
                formData.append('thumbnailIndex', thumbnailIndex);
                formData.append('status', 'Pending'); // Marked for admin review

                selectedFiles.forEach(item => {
                    formData.append('images', item.file);
                });

                const result = await window.api.addProperty(formData);
                if (result) {
                    successModal.classList.add('active');
                }
            } catch (err) {
                console.error('Submit error:', err);
                if (window.notifications) {
                    window.notifications.show(err.message || 'Error uploading property', 'error');
                } else {
                    alert(err.message || 'Error uploading property');
                }
            } finally {
                btn.disabled = false;
                btn.innerHTML = 'Submit Listing';
            }
        });
    }

    // Scroll Animation Observer
    const observerOptions = {
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('section').forEach(section => {
        observer.observe(section);
    });

    // Ripple/Click Feedback Effect
    document.addEventListener('click', (e) => {
        const target = e.target.closest('.btn');
        if (target) {
            const circle = document.createElement('span');
            const diameter = Math.max(target.clientWidth, target.clientHeight);
            const radius = diameter / 2;

            circle.style.width = circle.style.height = `${diameter}px`;
            circle.style.left = `${e.clientX - target.getBoundingClientRect().left - radius}px`;
            circle.style.top = `${e.clientY - target.getBoundingClientRect().top - radius}px`;
            circle.classList.add('ripple');

            const ripple = target.getElementsByClassName('ripple')[0];
            if (ripple) { ripple.remove(); }
            target.appendChild(circle);
        }
    });
    // Contact Form Handler
    const contactForm = document.querySelector('.elite-form');
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Fetch field values correctly
            const name = contactForm.querySelector('input[type="text"]').value;
            const emailInput = contactForm.querySelector('input[type="email"]');
            const email = emailInput ? emailInput.value : '';
            const phone = contactForm.querySelector('input[type="tel"]').value;
            const subject = contactForm.querySelector('select').value;
            const message = contactForm.querySelector('textarea').value;
            const btn = contactForm.querySelector('button');

            // Validations
            if (!/^[a-zA-Z\s]+$/.test(name)) {
                return window.notifications.show('Please enter a valid name (letters only)', 'warning');
            }

            if (phone.length !== 10 || !/^\d+$/.test(phone)) {
                return window.notifications.show('Please enter a valid 10-digit phone number', 'warning');
            }

            if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                return window.notifications.show('Please enter a valid email address', 'warning');
            }

            btn.disabled = true;
            btn.innerHTML = '<i class="ri-loader-4-line ri-spin"></i> Sending...';

            try {
                const data = {
                    name,
                    email,
                    phone,
                    type: 'Enquiry',
                    subject,
                    message: `[${subject}] ${message}`,
                    created_at: new Date().toISOString()
                };

                const result = await window.api.submitAppointment(data);
                if (result) {
                    window.notifications.show('Thank you! Your message has been sent.', 'success');
                    contactForm.reset();
                } else {
                    window.notifications.show('Failed to send message. Please try again.', 'error');
                }
            } catch (err) {
                console.error('Contact form error:', err);
                window.notifications.show('Error connecting to server', 'error');
            } finally {
                btn.disabled = false;
                btn.innerHTML = 'Deliver My Message <i class="ri-send-plane-fill"></i>';
            }
        });
    }
});

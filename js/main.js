document.addEventListener('DOMContentLoaded', () => {
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

    // Multi-step Form Logic (Sell Page)
    const steps = document.querySelectorAll('.form-step');
    const nextBtns = document.querySelectorAll('.next-btn');
    const prevBtns = document.querySelectorAll('.prev-btn');
    const progress = document.getElementById('progress');
    const progressSteps = document.querySelectorAll('.progress-step');

    let formStepNum = 0;

    if (steps.length > 0) {
        nextBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                formStepNum++;
                updateFormSteps();
                updateProgressBar();
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

    function updateFormSteps() {
        steps.forEach(step => {
            step.classList.contains('active') && step.classList.remove('active');
        });
        steps[formStepNum].classList.add('active');
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
        sellForm.addEventListener('submit', (e) => {
            e.preventDefault();

            // Capture Data
            const newProperty = {
                id: Date.now(), // Unique ID based on timestamp
                title: document.getElementById('prop-title').value,
                category: document.getElementById('prop-type-select').value,
                location: document.getElementById('prop-location').value,
                price: document.getElementById('prop-price').value,
                status: 'pending', // Explicitly marked as pending for admin review
                date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
                verified: false,
                image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80' // Default placeholder
            };

            // Save to LocalStorage
            let customProperties = JSON.parse(localStorage.getItem('rld_custom_properties')) || [];
            customProperties.push(newProperty);
            localStorage.setItem('rld_custom_properties', JSON.stringify(customProperties));

            successModal.classList.add('active');
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
});

document.addEventListener('DOMContentLoaded', () => {

    // Sidebar Navigation Highlighting
    const currentPage = window.location.pathname.split('/').pop();
    const navLinks = document.querySelectorAll('.nav-link');

    navLinks.forEach(link => {
        if (link.getAttribute('href') === currentPage) {
            link.classList.add('active');
        }
    });

    // Mock Interaction Logic for Buttons

    // Delete Button Mock
    document.querySelectorAll('.delete').forEach(btn => {
        btn.addEventListener('click', (e) => {
            if (confirm('Are you sure you want to delete this item?')) {
                const row = e.target.closest('tr');
                row.style.opacity = '0.5';
                setTimeout(() => {
                    row.remove();
                    // Update stats mock
                    alert('Item deleted successfully.');
                }, 500);
            }
        });
    });

    // Approve/Verify Button Mock
    document.querySelectorAll('.approve').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const row = e.target.closest('tr');
            const statusBadge = row.querySelector('.status-badge');

            if (statusBadge) {
                statusBadge.classList.remove('status-pending');
                statusBadge.classList.add('status-active');
                statusBadge.textContent = 'Active'; // or 'Confirmed' based on context

                // Remove approve button after approval
                e.target.closest('button').remove();
                alert('Request approved successfully!');
            }
        });
    });

    // Handle Add Property Form mock
    const addPropertyForm = document.getElementById('add-property-form');
    if (addPropertyForm) {
        addPropertyForm.addEventListener('submit', (e) => {
            e.preventDefault();
            // In a real app, gather FormData and POST to API
            const submitBtn = addPropertyForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerText;

            submitBtn.innerText = 'Publishing...';
            submitBtn.disabled = true;

            setTimeout(() => {
                alert('Property published successfully! It will now appear in the main listings.');
                window.location.href = 'properties.html';
            }, 1500);
        });
    }

});

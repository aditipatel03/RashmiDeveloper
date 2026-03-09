const notifications = {
    show(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;

        let icon = 'ri-checkbox-circle-line';
        if (type === 'error') icon = 'ri-error-warning-line';
        if (type === 'warning') icon = 'ri-alert-line';
        if (type === 'info') icon = 'ri-information-line';

        toast.innerHTML = `
            <i class="${icon}"></i>
            <span>${message}</span>
            <div class="toast-progress"></div>
        `;

        const container = document.getElementById('toast-container') || this.createContainer();
        container.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('fade-out');
            setTimeout(() => toast.remove(), 500);
        }, 3000);
    },

    confirm(message, onConfirm) {
        const modal = document.createElement('div');
        modal.className = 'custom-modal-overlay';
        modal.innerHTML = `
            <div class="custom-modal-card">
                <div class="modal-icon warning"><i class="ri-question-line"></i></div>
                <h3>Confirmation Required</h3>
                <p>${message}</p>
                <div class="modal-actions">
                    <button class="modal-btn cancel" id="modal-cancel">Cancel</button>
                    <button class="modal-btn confirm" id="modal-confirm">Confirm</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        // Block scrolling
        document.body.style.overflow = 'hidden';

        const closeModal = (confirmed) => {
            modal.classList.add('fade-out');
            document.body.style.overflow = '';
            setTimeout(() => {
                modal.remove();
                if (confirmed) onConfirm();
            }, 300);
        };

        modal.querySelector('#modal-cancel').onclick = () => closeModal(false);
        modal.querySelector('#modal-confirm').onclick = () => closeModal(true);
        modal.onclick = (e) => { if (e.target === modal) closeModal(false); };
    },

    login(message = 'Please login to continue with this action.') {
        const modal = document.createElement('div');
        modal.className = 'custom-modal-overlay';
        modal.innerHTML = `
            <div class="custom-modal-card">
                <div class="modal-icon info"><i class="ri-lock-line"></i></div>
                <h3>Login Required</h3>
                <p>${message}</p>
                <div class="modal-actions">
                    <button class="modal-btn cancel" id="modal-close">Close</button>
                    <button class="modal-btn confirm" id="modal-login">Login Now</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        document.body.style.overflow = 'hidden';

        const closeModal = () => {
            modal.classList.add('fade-out');
            document.body.style.overflow = '';
            setTimeout(() => modal.remove(), 300);
        };

        modal.querySelector('#modal-close').onclick = closeModal;
        modal.querySelector('#modal-login').onclick = () => {
            window.location.href = '/login.html';
        };
        modal.onclick = (e) => { if (e.target === modal) closeModal(); };
    },

    createContainer() {
        const container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
        return container;
    }
};

window.notifications = notifications;

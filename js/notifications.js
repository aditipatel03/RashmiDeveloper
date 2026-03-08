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

    createContainer() {
        const container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
        return container;
    }
};

window.notifications = notifications;

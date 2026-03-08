const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000/api'
    : '/api';

const api = {
    // Properties
    async getProperties() {
        const response = await fetch(`${API_URL}/properties`);
        return await response.json();
    },

    async getProperty(id) {
        const response = await fetch(`${API_URL}/properties/${id}`);
        return await response.json();
    },

    async addProperty(formData) {
        const response = await fetch(`${API_URL}/properties`, {
            method: 'POST',
            headers: { 'x-auth-token': this.getToken() },
            body: formData
        });
        return await response.json();
    },

    async updateProperty(id, formData) {
        const response = await fetch(`${API_URL}/properties/${id}`, {
            method: 'PUT',
            headers: { 'x-auth-token': this.getToken() },
            body: formData
        });
        return await response.json();
    },

    async deleteProperty(id) {
        const response = await fetch(`${API_URL}/properties/${id}`, {
            method: 'DELETE',
            headers: { 'x-auth-token': this.getToken() }
        });
        return await response.json();
    },

    async verifyProperty(id) {
        const response = await fetch(`${API_URL}/properties/${id}`, {
            method: 'PUT',
            headers: {
                'x-auth-token': this.getToken(),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ verified: true })
        });
        return await response.json();
    },

    // Appointments
    async getAppointments() {
        const response = await fetch(`${API_URL}/appointments`, {
            headers: { 'x-auth-token': this.getToken() }
        });
        return await response.json();
    },

    async submitAppointment(data) {
        const response = await fetch(`${API_URL}/appointments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return await response.json();
    },

    async deleteAppointment(id) {
        const response = await fetch(`${API_URL}/appointments/${id}`, {
            method: 'DELETE',
            headers: { 'x-auth-token': this.getToken() }
        });
        return await response.json();
    },

    // Auth
    async login(email, password) {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await response.json();
        if (data.token) {
            localStorage.setItem('rld_token', data.token);
            localStorage.setItem('rld_user', JSON.stringify(data.user));
        }
        return data;
    },

    async register(data) {
        const response = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return await response.json();
    },

    async forgotPassword(email) {
        const response = await fetch(`${API_URL}/forgot-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });
        return await response.json();
    },

    async resetPassword(password) {
        const response = await fetch(`${API_URL}/reset-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': this.getToken()
            },
            body: JSON.stringify({ password })
        });
        return await response.json();
    },

    async getDashboardStats() {
        const response = await fetch(`${API_URL}/stats`, {
            headers: { 'x-auth-token': this.getToken() }
        });
        return await response.json();
    },

    async getUsersList() {
        const response = await fetch(`${API_URL}/users`, {
            headers: { 'x-auth-token': this.getToken() }
        });
        return await response.json();
    },

    async trackVisit() {
        // Simple session-based tracking to avoid overcounting refreshes
        if (sessionStorage.getItem('rld_visit_tracked')) return;

        try {
            await fetch(`${API_URL}/track-visit`, { method: 'POST' });
            sessionStorage.setItem('rld_visit_tracked', 'true');
        } catch (err) {
            console.error('Visit tracking failed:', err);
        }
    },

    async deleteUser(id) {
        const response = await fetch(`${API_URL}/users/${id}`, {
            method: 'DELETE',
            headers: { 'x-auth-token': this.getToken() }
        });
        return await response.json();
    },

    getToken() {
        return localStorage.getItem('rld_token');
    },

    getUser() {
        return JSON.parse(localStorage.getItem('rld_user'));
    },

    logout() {
        localStorage.removeItem('rld_token');
        localStorage.removeItem('rld_user');
        window.location.href = '/login.html';
    }
};

window.api = api;

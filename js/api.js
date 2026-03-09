const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000/api'
    : '/api';

const api = {
    async handleResponse(response) {
        if (response.status === 401) {
            this.logout();
            throw new Error('Unauthorized');
        }
        return await response.json();
    },

    // Properties
    async getProperties() {
        const response = await fetch(`${API_URL}/properties`);
        return await response.json(); // Public
    },

    async getProperty(id) {
        const response = await fetch(`${API_URL}/properties/${id}`);
        return await response.json(); // Public
    },

    async addProperty(formData) {
        const response = await fetch(`${API_URL}/properties`, {
            method: 'POST',
            headers: { 'x-auth-token': this.getToken() },
            body: formData
        });
        return await this.handleResponse(response);
    },

    async updateProperty(id, formData) {
        const response = await fetch(`${API_URL}/properties/${id}`, {
            method: 'PUT',
            headers: { 'x-auth-token': this.getToken() },
            body: formData
        });
        return await this.handleResponse(response);
    },

    async updatePropertyStatus(id, status) {
        const response = await fetch(`${API_URL}/properties/${id}/status`, {
            method: 'PATCH',
            headers: {
                'x-auth-token': this.getToken(),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status })
        });
        return await this.handleResponse(response);
    },

    async deleteProperty(id) {
        const response = await fetch(`${API_URL}/properties/${id}`, {
            method: 'DELETE',
            headers: { 'x-auth-token': this.getToken() }
        });
        return await this.handleResponse(response);
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
        return await this.handleResponse(response);
    },

    // Appointments
    async getAppointments() {
        const response = await fetch(`${API_URL}/appointments`, {
            headers: { 'x-auth-token': this.getToken() }
        });
        return await this.handleResponse(response);
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
        return await this.handleResponse(response);
    },

    async updateAppointmentStatus(id, status) {
        const response = await fetch(`${API_URL}/appointments/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': this.getToken()
            },
            body: JSON.stringify({ status })
        });
        return await this.handleResponse(response);
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
        return await this.handleResponse(response);
    },

    async updateProfile(data) {
        const response = await fetch(`${API_URL}/update-profile`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': this.getToken()
            },
            body: JSON.stringify(data)
        });
        const result = await this.handleResponse(response);
        if (result.user) {
            localStorage.setItem('rld_user', JSON.stringify(result.user));
        }
        return result;
    },

    async getDashboardStats() {
        const response = await fetch(`${API_URL}/stats`, {
            headers: { 'x-auth-token': this.getToken() }
        });
        return await this.handleResponse(response);
    },

    async getUsersList() {
        const response = await fetch(`${API_URL}/users`, {
            headers: { 'x-auth-token': this.getToken() }
        });
        return await this.handleResponse(response);
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
        return await this.handleResponse(response);
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

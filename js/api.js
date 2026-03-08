const API_URL = 'http://localhost:5000/api';

const api = {
    async getProperties() {
        const response = await fetch(`${API_URL}/properties`);
        return await response.json();
    },

    async getProperty(id) {
        const response = await fetch(`${API_URL}/properties/${id}`);
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

    async login(username, password) {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await response.json();
        if (data.token) {
            localStorage.setItem('rld_token', data.token);
        }
        return data;
    },

    getToken() {
        return localStorage.getItem('rld_token');
    },

    logout() {
        localStorage.removeItem('rld_token');
    }
};

window.api = api;

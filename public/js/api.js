// API Helper Functions

const api = {
    // Auth Endpoints
    register: async (userData) => {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });
        return response.json();
    },

    login: async (email, password) => {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        return response.json();
    },

    getMenu: async (category = null) => {
        const url = category ? `${API_BASE_URL}/menu?category=${category}` : `${API_BASE_URL}/menu`;
        const response = await fetch(url);
        return response.json();
    },

    createOrder: async (orderData, token) => {
        const response = await fetch(`${API_BASE_URL}/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(orderData)
        });
        return response.json();
    },

    createPayment: async (orderId, amount, token) => {
        const response = await fetch(`${API_BASE_URL}/payments/create-order`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ orderId, amount })
        });
        return response.json();
    },

    verifyPayment: async (paymentData, token) => {
        const response = await fetch(`${API_BASE_URL}/payments/verify`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(paymentData)
        });
        return response.json();
    },

    getOrders: async (token) => {
        const response = await fetch(`${API_BASE_URL}/orders`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return response.json();
    },

    getOrder: async (orderId, token) => {
        const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return response.json();
    }
};

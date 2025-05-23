const API_BASE_URL = 'https://a-k-analytics-backend.onrender.com';

// Sanitize input to prevent XSS
function sanitizeInput(input) {
    if (typeof input !== 'string') return '';
    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML;
}

// Get token from localStorage
function getToken() {
    return localStorage.getItem('token');
}
export function getToken() {
    return localStorage.getItem('token');
}

export function setToken(token) {
    localStorage.setItem('token', token);
}

export function removeToken() {
    localStorage.removeItem('token');
}

export async function fetchUserProfile(token) {
    const response = await fetch('https://a-k-analytics-backend.onrender.com/api/users/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to fetch profile');
    return response.json();
}

export function isAdmin(user) {
    return user.role === 'admin' || user.email === 'kevinakhondo9@gmail.com';
}

export function sanitizeInput(input) {
    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML;
}

export function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

export function validatePassword(password) {
    const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    return re.test(password);
}

// Store token in localStorage
function setToken(token) {
    localStorage.setItem('token', token);
}

// Remove token
function removeToken() {
    localStorage.removeItem('token');
}

// Fetch user profile
async function fetchUserProfile(token) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/users/profile`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });
        if (!response.ok) {
            throw new Error('Failed to fetch user profile');
        }
        return await response.json();
    } catch (err) {
        throw err;
    }
}

// Check if user is admin (role-based check)
function isAdmin(user) {
    return user.role === 'admin';
}

// Login function
async function login(email, password) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/users/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: sanitizeInput(email), password }),
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || 'Login failed');
        }
        return data.token;
    } catch (err) {
        throw err;
    }
}

// Validate email
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
function validateEmail(email) {
    return emailRegex.test(email);
}

// Validate password
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
function validatePassword(password) {
    return passwordRegex.test(password);
}

export { 
    sanitizeInput, 
    getToken, 
    setToken, 
    removeToken, 
    fetchUserProfile, 
    isAdmin, 
    login, 
    validateEmail, 
    validatePassword 
};
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

// Store token in localStorage
function setToken(token) {
    localStorage.setItem('token', token);
}

// Remove token from localStorage
function removeToken() {
    localStorage.removeItem('token');
}

// Fetch user profile
async function fetchUserProfile(token) {
    try {
        const response = await axios.get(`${API_BASE_URL}/api/users/profile`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });
        return response.data;
    } catch (err) {
        throw new Error(err.response?.data?.error || 'Failed to fetch user profile');
    }
}

// Check if user is admin
function isAdmin(user) {
    return user.role === 'admin' || user.email === 'kevinakhondo9@gmail.com';
}

// Login function
async function login(email, password) {
    try {
        const response = await axios.post(`${API_BASE_URL}/api/users/login`, {
            email: sanitizeInput(email),
            password,
        }, {
            headers: { 'Content-Type': 'application/json' },
        });
        return response.data.token;
    } catch (err) {
        throw new Error(err.response?.data?.error || 'Login failed');
    }
}

// Validate email
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Validate password
function validatePassword(password) {
    const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    return re.test(password);
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
    validatePassword,
};
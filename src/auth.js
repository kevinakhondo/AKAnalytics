import DOMPurify from 'dompurify';
import axios from 'axios';

const API_BASE_URL = 'https://a-k-analytics-backend.onrender.com';

function sanitizeInput(input) {
  if (typeof input !== 'string') return '';
  return DOMPurify.sanitize(input);
}

function getToken() {
  return localStorage.getItem('token');
}

function setToken(token) {
  localStorage.setItem('token', token);
}

function removeToken() {
  localStorage.removeItem('token');
}

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

function isAdmin(user) {
  return user.role === 'admin' || user.email === 'kevinakhondo9@gmail.com';
}

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

function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

function validatePassword(password) {
  const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return re.test(password);
}

async function fetchAllUsers(token) {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/admin/users`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (err) {
    throw new Error(err.response?.data?.error || 'Failed to fetch users');
  }
}

async function updateUserRole(token, userId, role) {
  try {
    const response = await axios.patch(`${API_BASE_URL}/api/admin/users/${userId}`, { role }, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (err) {
    throw new Error(err.response?.data?.error || 'Failed to update user role');
  }
}

async function fetchAllBookings(token) {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/admin/bookings`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (err) {
    throw new Error(err.response?.data?.error || 'Failed to fetch bookings');
  }
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
  fetchAllUsers,
  updateUserRole,
  fetchAllBookings,
};
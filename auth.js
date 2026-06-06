/**
 * Browser-compatible auth module for static HTML pages.
 * Uses axios and DOMPurify loaded from CDN (window globals).
 */

const API_BASE_URL = 'https://a-k-analytics-backend.onrender.com';

function sanitizeInput(input) {
  if (typeof input !== 'string') return '';
  if (typeof window.DOMPurify !== 'undefined') return window.DOMPurify.sanitize(input);
  return input.replace(/[<>"'&]/g, c => ({ '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;', '&': '&amp;' }[c]));
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
  const response = await window.axios.get(`${API_BASE_URL}/api/users/profile`, {
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
  });
  return response.data;
}

function isAdmin(user) {
  return user.role === 'admin';
}

async function login(email, password) {
  const response = await window.axios.post(`${API_BASE_URL}/api/users/login`, {
    email: sanitizeInput(email),
    password,
  }, { headers: { 'Content-Type': 'application/json' } });
  return response.data.token;
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePassword(password) {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(password);
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

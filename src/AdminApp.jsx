import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  sanitizeInput,
  getToken,
  removeToken,
  fetchUserProfile,
  isAdmin,
  fetchAllUsers,
  updateUserRole,
  fetchAllBookings,
} from './auth.js';

function ErrorBoundary({ children }) {
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const handleError = (error) => {
      console.error('ErrorBoundary caught an error:', error.message);
      setHasError(true);
      setErrorMessage(error.message);
    };
    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  if (hasError) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold text-red-600">Something went wrong</h1>
        <p>{errorMessage}</p>
        <p>Please try refreshing the page or <a href="login.html" className="text-blue-600">log in again</a>.</p>
      </div>
    );
  }
  return children;
}

function AdminPortal() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    console.log('AdminPortal useEffect triggered');
    const token = getToken();
    if (!token) {
      console.error('No token found, redirecting to login');
      window.location.href = 'login.html';
      return;
    }
    fetchProfile(token);
  }, []);

  const fetchProfile = async (token) => {
    try {
      const userData = await fetchUserProfile(token);
      if (!isAdmin(userData)) {
        console.error('User is not an admin, redirecting to login');
        setError('Access denied. Admins only.');
        removeToken();
        localStorage.removeItem('userId');
        localStorage.removeItem('email');
        setTimeout(() => {
          window.location.href = 'login.html';
        }, 2000);
        return;
      }
      setUser(userData);
      localStorage.setItem('userId', userData._id);
      localStorage.setItem('email', userData.email);
    } catch (err) {
      console.error('Profile fetch error:', err.message);
      setError('Session expired. Please log in again.');
      removeToken();
      localStorage.removeItem('userId');
      localStorage.removeItem('email');
      setTimeout(() => {
        window.location.href = 'login.html';
      }, 2000);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    console.log('Logging out admin');
    removeToken();
    localStorage.removeItem('userId');
    localStorage.removeItem('email');
    window.location.href = 'login.html';
  };

  if (loading) {
    return (
      <div className="text-center p-4">
        <p>Loading...</p>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold text-red-600">Authentication Error</h1>
        <p>{error || 'No user data loaded.'}</p>
        <p>Please <a href="login.html" className="text-blue-600">log in again</a>.</p>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div>
        <section className="hero-section">
          <header className="container mx-auto flex justify-between items-center">
            <div className="logo">
              A & K Analytics
              <span>Admin Portal</span>
            </div>
            <nav>
              <ul className="flex space-x-4">
                <li><a href="index.html" className="nav-link">Home</a></li>
                <li><a href="#" onClick={logout} className="nav-link">Logout</a></li>
              </ul>
            </nav>
          </header>
        </section>
        <div className="container mx-auto p-6">
          <h1 className="text-3xl font-bold mb-6">
            Welcome, Admin {user?.name || 'User'}!
          </h1>
          {error && <div className="error block">{error}</div>}
          {success && <div className="success block">{success}</div>}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <UserManagement setSuccess={setSuccess} setError={setError} />
            <BookingManagement setSuccess={setSuccess} setError={setError} />
          </div>
        </div>
        <footer className="footer-section">
          <div className="footer-content container mx-auto">
            <div className="footer-logo">
              A & K Analytics
              <span>Admin Portal</span>
            </div>
            <nav className="footer-nav">
              <ul className="flex flex-wrap">
                <li><a href="about.html">About</a></li>
                <li><a href="industries.html">Industries</a></li>
                <li><a href="insights.html">Insights</a></li>
                <li><a href="index.html#contact">Contact</a></li>
              </ul>
            </nav>
            <div className="footer-copyright">
              <p>© 2025 A & K Analytics. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </ErrorBoundary>
  );
}

function UserManagement({ setSuccess, setError }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('UserManagement useEffect triggered');
    const token = getToken();
    fetchAllUsers(token)
      .then(data => setUsers(data))
      .catch(err => {
        console.error('Users fetch error:', err.message);
        setError('Failed to load users.');
      })
      .finally(() => setLoading(false));
  }, [setError]);

  const handleRoleChange = async (userId, newRole) => {
    try {
      const token = getToken();
      await updateUserRole(token, userId, newRole);
      setUsers(users.map(u => u._id === userId ? { ...u, role: newRole } : u));
      setSuccess('User role updated successfully.');
      setError('');
    } catch (err) {
      console.error('Role update error:', err.message);
      setError('Failed to update user role.');
    }
  };

  if (loading) return <div className="card"><p>Loading users...</p></div>;

  return (
    <div className="card">
      <h2 className="text-2xl font-bold mb-4">User Management</h2>
      {users.length ? (
        <ul className="space-y-2">
          {users.map(user => (
            <li key={user._id} className="border-b py-2 flex justify-between items-center">
              <p>{sanitizeInput(user.email)} - {sanitizeInput(user.name)}</p>
              <select
                value={user.role}
                onChange={(e) => handleRoleChange(user._id, e.target.value)}
                className="p-2 border rounded"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </li>
          ))}
        </ul>
      ) : (
        <p>No users found.</p>
      )}
    </div>
  );
}

function BookingManagement({ setSuccess, setError }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('BookingManagement useEffect triggered');
    const token = getToken();
    fetchAllBookings(token)
      .then(data => setBookings(data))
      .catch(err => {
        console.error('Bookings fetch error:', err.message);
        setError('Failed to load bookings.');
      })
      .finally(() => setLoading(false));
  }, [setError]);

  const cancelBooking = async (id) => {
    if (window.confirm('Cancel this booking?')) {
      try {
        const token = getToken();
        await axios.delete(`https://a-k-analytics-backend.onrender.com/api/admin/bookings/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setBookings(bookings.filter(b => b._id !== id));
        setSuccess('Booking cancelled.');
        setError('');
      } catch (err) {
        console.error('Cancel booking error:', err.response?.data || err.message);
        setError('Failed to cancel booking.');
      }
    }
  };

  if (loading) return <div className="card"><p>Loading bookings...</p></div>;

  return (
    <div className="card">
      <h2 className="text-2xl font-bold mb-4">Booking Management</h2>
      {bookings.length ? (
        <ul className="space-y-2">
          {bookings.map(b => (
            <li key={b._id} className="border-b py-2 flex justify-between items-center">
              <p>{sanitizeInput(b.service)} - {sanitizeInput(b.userEmail)} - {new Date(b.callTime).toLocaleString()}</p>
              <button onClick={() => cancelBooking(b._id)} className="action-btn cancel-btn">Cancel</button>
            </li>
          ))}
        </ul>
      ) : (
        <p>No bookings found.</p>
      )}
    </div>
  );
}

export default AdminPortal;
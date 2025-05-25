import { useState, useEffect } from 'react';
import io from 'socket.io-client';
import {
    sanitizeInput,
    getToken,
    setToken,
    removeToken,
    fetchUserProfile,
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

function CustomerPortal() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        console.log('CustomerPortal useEffect triggered');
        const token = getToken();
        console.log('Token retrieved:', token);
        if (!token) {
            console.error('No token found, redirecting to login');
            window.location.href = 'login.html';
            return;
        }
        fetchProfile(token);
    }, []);

    const fetchProfile = async (token) => {
        try {
            console.log('Fetching user profile with token:', token);
            const userData = await fetchUserProfile(token);
            console.log('Profile data received:', userData);
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
                console.log('Redirecting to login.html due to profile fetch error');
                window.location.href = 'login.html';
            }, 2000);
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        console.log('Logging out user');
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
                            <span>Data Solutions</span>
                        </div>
                        <nav>
                            <ul className="flex space-x-4">
                                <li><a href="index.html" className="nav-link">Home</a></li>
                                <li><a href="book-online.html" className="nav-link">Book Services</a></li>
                                <li><a href="#" onClick={logout} className="nav-link">Logout</a></li>
                            </ul>
                        </nav>
                    </header>
                </section>
                <div className="container mx-auto p-6">
                    <h1 className="text-3xl font-bold mb-6">
                        Welcome, {user?.name || 'Customer'}!
                    </h1>
                    {error && <div className="error block">{error}</div>}
                    {success && <div className="success block">{success}</div>}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Dashboard setError={setError} />
                        <ServiceBooking setSuccess={setSuccess} setError={setError} />
                        <ScheduleCall />
                        <LiveChat setError={setError} />
                        <DataUpload setSuccess={setSuccess} setError={setError} />
                        <DatabaseConnection setSuccess={setSuccess} setError={setError} />
                    </div>
                </div>
                <footer className="footer-section">
                    <div className="footer-content container mx-auto">
                        <div className="footer-logo">
                            A & K Analytics
                            <span>Data Solutions</span>
                        </div>
                        <nav className="footer-nav">
                            <ul className="flex flex-wrap">
                                <li><a href="about.html">About</a></li>
                                <li><a href="industries.html">Industries</a></li>
                                <li><a href="insights.html">Insights</a></li>
                                <li><a href="index.html#contact">Contact</a></li>
                                <li><a href="blog.html">Blog</a></li>
                                <li><a href="book-online.html">Book Online</a></li>
                            </ul>
                        </nav>
                        <div className="footer-social">
                            <a href="https://facebook.com/akanalytics" className="social-icon" aria-label="Facebook"><i className="fab fa-facebook-f"></i></a>
                            <a href="https://twitter.com/akanalytics" className="social-icon" aria-label="Twitter"><i className="fab fa-twitter"></i></a>
                            <a href="https://linkedin.com/company/akanalytics" className="social-icon" aria-label="LinkedIn"><i className="fab fa-linkedin-in"></i></a>
                            <a href="https://instagram.com/akanalytics" className="social-icon" aria-label="Instagram"><i className="fab fa-instagram"></i></a>
                        </div>
                        <div className="footer-copyright">
                            <p>© 2025 A & K Analytics. All rights reserved.</p>
                        </div>
                    </div>
                </footer>
            </div>
        </ErrorBoundary>
    );
}

function Dashboard({ setError }) {
    const [dashboardUrl, setDashboardUrl] = useState('');
    const [analytics, setAnalytics] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        console.log('Dashboard useEffect triggered');
        const token = getToken();
        console.log('Dashboard fetching with token:', token);
        Promise.all([
            axios.get('https://a-k-analytics-backend.onrender.com/api/customer/dashboard', {
                headers: { Authorization: `Bearer ${token}` }
            }).then(res => {
                console.log('Dashboard response:', res.data);
                setDashboardUrl(res.data.dashboardUrl || '');
            }).catch(err => {
                console.error('Dashboard fetch error:', err.response?.data || err.message);
                setError('Failed to load dashboard.');
            }),
            axios.get('https://a-k-analytics-backend.onrender.com/api/customer/analytics', {
                headers: { Authorization: `Bearer ${token}` }
            }).then(res => {
                console.log('Analytics response:', res.data);
                setAnalytics(res.data || []);
            }).catch(err => {
                console.error('Analytics fetch error:', err.response?.data || err.message);
                setError('Failed to load analytics reports.');
            })
        ]).finally(() => setLoading(false));
    }, [setError]);

    if (loading) return <div className="card col-span-2"><p>Loading dashboard...</p></div>;

    return (
        <div className="card col-span-2">
            <h2 className="text-2xl font-bold mb-4">Personalized Dashboard</h2>
            {dashboardUrl ? (
                <iframe src={dashboardUrl} width="100%" height="600px" className="border rounded" title="Customer Dashboard"></iframe>
            ) : (
                <p>No dashboard available. Contact support for setup.</p>
            )}
            <h3 className="text-xl font-bold mt-4 mb-2">Analytics Reports</h3>
            {analytics.length ? (
                <ul className="space-y-2">
                    {analytics.map(report => (
                        <li key={report._id} className="border-b py-2">
                            <p><strong>{sanitizeInput(report.title)}</strong> - {sanitizeInput(report.status)}</p>
                            {report.resultsUrl && (
                                <a href={report.resultsUrl} target="_blank" rel="noopener noreferrer" className="action-btn">View Report</a>
                            )}
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No analytics reports available.</p>
            )}
        </div>
    );
}

function ServiceBooking({ setSuccess, setError }) {
    const [bookings, setBookings] = useState([]);
    const [service, setService] = useState('');
    const [loading, setLoading] = useState(true);
    const services = [
        { value: 'basic_report', label: 'Basic Report (KES 15,000 / USD 115)' },
        { value: 'advanced_forecasting', label: 'Advanced Forecasting (KES 50,000 / USD 385)' },
        { value: 'ml_model', label: 'Machine Learning Model (KES 100,000 / USD 770)' }
    ];

    useEffect(() => {
        console.log('ServiceBooking useEffect triggered');
        const token = getToken();
        console.log('Fetching bookings with token:', token);
        axios.get('https://a-k-analytics-backend.onrender.com/api/customer/bookings', {
            headers: { Authorization: `Bearer ${token}` }
        }).then(res => {
            console.log('Bookings response:', res.data);
            setBookings(res.data || []);
        }).catch(err => {
            console.error('Bookings fetch error:', err.response?.data || err.message);
            setError('Failed to load bookings.');
        }).finally(() => setLoading(false));
    }, [setError]);

    const handleBooking = async (e) => {
        e.preventDefault();
        if (!service) {
            setError('Please select a service.');
            return;
        }
        try {
            const token = getToken();
            console.log('Posting booking:', { service });
            const response = await axios.post('https://a-k-analytics-backend.onrender.com/api/customer/bookings', {
                service
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log('Booking response:', response.data);
            setBookings([...bookings, response.data]);
            setSuccess('Service booked successfully!');
            setError('');
            setService('');
        } catch (err) {
            console.error('Booking error:', err.response?.data || err.message);
            setError('Failed to book service.');
        }
    };

    const cancelBooking = async (id) => {
        if (window.confirm('Cancel this booking?')) {
            try {
                const token = getToken();
                console.log('Canceling booking:', id);
                await axios.delete(`https://a-k-analytics-backend.onrender.com/api/customer/bookings/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                console.log('Booking cancelled:', id);
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
            <h2 className="text-2xl font-bold mb-4">Book Our Services</h2>
            <form onSubmit={handleBooking} className="space-y-4">
                <div>
                    <label htmlFor="service" className="block text-gray-700">Select Service</label>
                    <select
                        id="service"
                        value={service}
                        onChange={(e) => setService(e.target.value)}
                        className="w-full p-2 border rounded"
                        required
                    >
                        <option value="">Choose a service</option>
                        {services.map(s => (
                            <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                    </select>
                </div>
                <button type="submit" className="submit-btn">Book Service</button>
            </form>
            <h3 className="text-xl font-bold mt-4 mb-2">My Bookings</h3>
            {bookings.length ? (
                <ul className="space-y-2">
                    {bookings.map(b => (
                        <li key={b._id} className="border-b py-2 flex justify-between items-center">
                            <p>{sanitizeInput(b.service)} - {new Date(b.callTime).toLocaleString()}</p>
                            <button onClick={() => cancelBooking(b._id)} className="action-btn cancel-btn">Cancel</button>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No bookings yet.</p>
            )}
        </div>
    );
}

function ScheduleCall() {
    useEffect(() => {
        console.log('ScheduleCall useEffect triggered');
        try {
            console.log('Initializing Calendly');
            Calendly.initInlineWidget({
                url: 'https://calendly.com/akanalytics/consultation',
                parentElement: document.getElementById('calendly-widget'),
                prefill: { email: localStorage.getItem('email') || '' }
            });
        } catch (err) {
            console.error('Calendly initialization error:', err);
        }
    }, []);

    return (
        <div className="card">
            <h2 className="text-2xl font-bold mb-4">Schedule a Call</h2>
            <div id="calendly-widget" className="h-96">
                <p>Loading Calendly widget...</p>
            </div>
        </div>
    );
}

function LiveChat({ setError }) {
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState('');
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        console.log('LiveChat useEffect triggered');
        const newSocket = io('https://a-k-analytics-backend.onrender.com', { transports: ['websocket'] });
        newSocket.on('connect', () => {
            console.log('Socket connected');
            newSocket.emit('join', { userId: localStorage.getItem('userId'), role: 'customer' });
        });
        newSocket.on('connect_error', (err) => {
            console.error('Socket connection error:', err.message);
            setError('Failed to connect to live chat.');
        });
        newSocket.on('message', (data) => {
            setMessages(prev => [...prev, { sender: data.sender, text: data.text }]);
            const chatMessages = document.getElementById('chat-messages');
            if (chatMessages) chatMessages.scrollTop = chatMessages.scrollHeight;
        });
        setSocket(newSocket);
        return () => newSocket.disconnect();
    }, [setError]);

    const sendMessage = () => {
        if (message.trim() && socket) {
            socket.emit('message', { text: message, sender: 'Customer' });
            setMessages(prev => [...prev, { sender: 'Customer', text: message }]);
            setMessage('');
            const chatMessages = document.getElementById('chat-messages');
            if (chatMessages) chatMessages.scrollTop = chatMessages.scrollHeight;
        }
    };

    return (
        <div className="card">
            <h2 className="text-2xl font-bold mb-4">Talk to an Analyst</h2>
            <div id="chat-messages" className="h-64 overflow-y-scroll bg-gray-50 p-4 rounded">
                {messages.length ? (
                    messages.map((msg, i) => (
                        <p key={i}><strong>{sanitizeInput(msg.sender)}:</strong> {sanitizeInput(msg.text)}</p>
                    ))
                ) : (
                    <p>No messages yet.</p>
                )}
            </div>
            <div className="flex mt-2">
                <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full p-2 border rounded"
                    placeholder="Message analyst..."
                    aria-label="Chat message"
                />
                <button onClick={sendMessage} className="submit-btn ml-2">Send</button>
            </div>
        </div>
    );
}

function DataUpload({ setSuccess, setError }) {
    const handleUpload = async (e) => {
        e.preventDefault();
        const file = e.target.querySelector('#data-file').files[0];
        if (!file) {
            setError('Please select a file.');
            return;
        }
        const formData = new FormData();
        formData.append('data', file);
        try {
            const token = getToken();
            console.log('Uploading file:', file.name);
            await axios.post('https://a-k-analytics-backend.onrender.com/api/customer/upload', formData, {
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
            });
            setSuccess('Data uploaded successfully! Analysis in progress.');
            setError('');
            e.target.reset();
        } catch (err) {
            console.error('Upload error:', err.response?.data || err.message);
            setError('Data upload failed.');
        }
    };

    return (
        <div className="card">
            <h2 className="text-2xl font-bold mb-4">Upload Dataset</h2>
            <form onSubmit={handleUpload} encType="multipart/form-data">
                <input
                    type="file"
                    id="data-file"
                    accept=".csv,.xlsx"
                    className="mb-2"
                    aria-label="Upload data file"
                />
                <button type="submit" className="submit-btn">Upload</button>
            </form>
        </div>
    );
}

function DatabaseConnection({ setSuccess, setError }) {
    const [dbType, setDbType] = useState('');
    const [host, setHost] = useState('');
    const [port, setPort] = useState('');
    const [database, setDatabase] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleConnect = async (e) => {
        e.preventDefault();
        if (!dbType || !host || !port || !database || !username || !password) {
            setError('Please fill all fields.');
            return;
        }
        try {
            const token = getToken();
            console.log('Connecting database:', { dbType, host, port, database });
            await axios.post('https://a-k-analytics-backend.onrender.com/api/customer/db-connect', {
                dbType,
                host,
                port,
                database,
                username,
                password
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSuccess('Database connected successfully! Analysis in progress.');
            setError('');
            setDbType('');
            setHost('');
            setPort('');
            setDatabase('');
            setUsername('');
            setPassword('');
        } catch (err) {
            console.error('Database connection error:', err.response?.data || err.message);
            setError('Database connection failed.');
        }
    };

    return (
        <div className="card">
            <h2 className="text-2xl font-bold mb-4">Connect Database</h2>
            <form onSubmit={handleConnect} className="space-y-4">
                <div>
                    <label htmlFor="db-type" className="block text-gray-700">Database Type</label>
                    <select
                        id="db-type"
                        value={dbType}
                        onChange={(e) => setDbType(e.target.value)}
                        className="w-full p-2 border rounded"
                        required
                    >
                        <option value="">Select type</option>
                        <option value="postgresql">PostgreSQL</option>
                        <option value="mysql">MySQL</option>
                        <option value="mongodb">MongoDB</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="host" className="block text-gray-700">Host</label>
                    <input
                        type="text"
                        id="host"
                        value={host}
                        onChange={(e) => setHost(e.target.value)}
                        className="w-full p-2 border rounded"
                        placeholder="e.g., localhost"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="port" className="block text-gray-700">Port</label>
                    <input
                        type="number"
                        id="port"
                        value={port}
                        onChange={(e) => setPort(e.target.value)}
                        className="w-full p-2 border rounded"
                        placeholder="e.g., 5432"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="database" className="block text-gray-700">Database Name</label>
                    <input
                        type="text"
                        id="database"
                        value={database}
                        onChange={(e) => setDatabase(e.target.value)}
                        className="w-full p-2 border rounded"
                        placeholder="e.g., mydb"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="username" className="block text-gray-700">Username</label>
                    <input
                        type="text"
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full p-2 border rounded"
                        placeholder="e.g., admin"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="password" className="block text-gray-700">Password</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full p-2 border rounded"
                        required
                    />
                </div>
                <button type="submit" className="submit-btn">Connect</button>
            </form>
        </div>
    );
}

export default CustomerPortal;
import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import './Header.css';

const Header = () => {
  const { user, logout } = useContext(AuthContext);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data);
    } catch (err) {
      console.error("Failed to fetch notifications");
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      // Poll for notifications every 30 seconds
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    setNotifications([]);
    navigate('/');
  };

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: 1 } : n));
    } catch (err) {
      console.error("Failed to mark notification as read");
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;
  const isProfessional = user && (user.role === 'employer' || user.role === 'admin');
  const isAdmin = user && user.role === 'admin';

  return (
    <header className="header glass">
      <div className="container header-content">
        <Link to="/" className="logo" onClick={closeMenu}>
          Jobszzy<span className="logo-dot">.</span>
        </Link>

        <button className={`menu-toggle ${isMenuOpen ? 'active' : ''}`} onClick={toggleMenu} aria-label="Toggle menu">
          <span className="hamburger"></span>
        </button>

        <div className={`nav-container ${isMenuOpen ? 'open' : ''}`}>
          <nav className="nav-links">
            <Link to="/browse-jobs" onClick={closeMenu}>Find Jobs</Link>
            <Link to="/companies" onClick={closeMenu}>Companies</Link>
            {isProfessional && (
              <Link to="/job-seekers" onClick={closeMenu}>Talent Pool</Link>
            )}
            <Link to="/pricing" onClick={closeMenu}>Pricing</Link>
          </nav>
          <div className="auth-buttons">
            {user ? (
              <>
                {/* Notifications Bell */}
                <div className="notifications-wrapper" style={{ position: 'relative', marginRight: '1rem' }}>
                  <button
                    className="notification-bell"
                    onClick={() => setShowNotifications(!showNotifications)}
                    style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', position: 'relative', padding: '0.5rem' }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
                    {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
                  </button>

                  {showNotifications && (
                    <div className="notifications-dropdown glass animate-fade-in" style={{
                      position: 'absolute', top: '100%', right: '0', width: '300px',
                      maxHeight: '400px', overflowY: 'auto', zIndex: '1000',
                      marginTop: '1rem', padding: '1rem', borderRadius: 'var(--radius-lg)'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>
                        <h4 style={{ margin: 0 }}>Notifications</h4>
                        {unreadCount > 0 && (
                          <button
                            onClick={async () => {
                              await api.put('/notifications/read-all');
                              setNotifications(notifications.map(n => ({ ...n, is_read: 1 })));
                            }}
                            style={{ background: 'none', border: 'none', color: 'var(--accent)', fontSize: '0.8rem', cursor: 'pointer' }}
                          >
                            Mark all read
                          </button>
                        )}
                      </div>
                      {notifications.length === 0 ? (
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textAlign: 'center' }}>No notifications</p>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          {notifications.map(n => (
                            <div
                              key={n.id}
                              onClick={() => markAsRead(n.id)}
                              style={{
                                padding: '0.75rem', borderRadius: 'var(--radius-md)',
                                background: n.is_read ? 'transparent' : 'rgba(255,255,255,0.05)',
                                cursor: 'pointer', border: '1px solid rgba(255,255,255,0.05)'
                              }}
                            >
                              <p style={{ margin: 0, fontSize: '0.85rem', color: n.is_read ? 'var(--text-secondary)' : 'white' }}>{n.message}</p>
                              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{new Date(n.created_at).toLocaleString()}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {isAdmin && (
                  <Link to="/admin" className="btn-secondary" onClick={() => { closeMenu(); setShowNotifications(false); }}>Admin Panel</Link>
                )}
                {isProfessional && (
                  <Link to="/employer/dashboard" className="btn-secondary" onClick={() => { closeMenu(); setShowNotifications(false); }}>Employer Dashboard</Link>
                )}
                {user.role === 'seeker' && (
                  <Link to="/seeker/dashboard" className="btn-secondary" onClick={() => { closeMenu(); setShowNotifications(false); }}>My Dashboard</Link>
                )}
                <button onClick={() => { handleLogout(); closeMenu(); setShowNotifications(false); }} className="btn-primary">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-secondary" onClick={closeMenu}>Log In</Link>
                <Link to="/register" className="btn-primary" onClick={closeMenu}>Sign Up</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

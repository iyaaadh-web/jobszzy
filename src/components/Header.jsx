import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Header.css';

const Header = () => {
  const { user, logout } = useContext(AuthContext);
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const navigate = useNavigate();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

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
            {user && <Link to="/job-seekers" onClick={closeMenu}>Job Seekers</Link>}
          </nav>
          <div className="auth-buttons">
            {user ? (
              <>
                {user.role === 'admin' ? (
                  <Link to="/admin" className="btn-secondary" onClick={closeMenu}>Admin Panel</Link>
                ) : user.role === 'employer' ? (
                  <Link to="/employer/dashboard" className="btn-secondary" onClick={closeMenu}>Dashboard</Link>
                ) : (
                  <Link to="/seeker/dashboard" className="btn-secondary" onClick={closeMenu}>My Profile</Link>
                )}
                <button onClick={() => { handleLogout(); closeMenu(); }} className="btn-primary">Logout</button>
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

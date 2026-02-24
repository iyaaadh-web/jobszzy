import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Header.css';

const Header = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="header glass">
      <div className="container header-content">
        <Link to="/" className="logo">
          Jobszzy<span className="logo-dot">.</span>
        </Link>
        <nav className="nav-links">
          <Link to="/browse-jobs">Find Jobs</Link>
          <Link to="/companies">Companies</Link>
          {user && <Link to="/job-seekers">Job Seekers</Link>}
        </nav>
        <div className="auth-buttons">
          {user ? (
            <>
              {user.role === 'admin' ? (
                <Link to="/admin" className="btn-secondary">Admin Panel</Link>
              ) : user.role === 'employer' ? (
                <Link to="/employer/dashboard" className="btn-secondary">Dashboard</Link>
              ) : (
                <Link to="/seeker/dashboard" className="btn-secondary">My Profile</Link>
              )}
              <button onClick={handleLogout} className="btn-primary">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-secondary">Log In</Link>
              <Link to="/register" className="btn-primary">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;

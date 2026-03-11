import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../utils/api';
import './Auth.css';

const ForgotPassword = () => {
    const location = useLocation();
    const [step, setStep] = useState(location.state?.fromLogin ? 2 : 1);
    const [email, setEmail] = useState(location.state?.email || '');
    const [token, setToken] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleRequestToken = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        setLoading(true);

        try {
            const res = await api.post('/auth/forgot-password', { email });
            setMessage(res.data.message);
            setStep(2);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to send token');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        setLoading(true);

        try {
            const res = await api.post('/auth/reset-password', { email, token, newPassword });
            setMessage(res.data.message + '. Redirecting to login...');
            setTimeout(() => {
                localStorage.removeItem('jobszzy_token');
                navigate('/login');
            }, 3000);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to reset password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container container">
            <div className="auth-card glass animate-fade-in">
                <h2 className="auth-title">Reset Password</h2>
                <p className="auth-subtitle">
                    {step === 1 ? 'Enter your email to receive a password reset token' : 'Enter your email, token, and a new password'}
                </p>

                {location.state?.tempPasswordAlert && (
                    <div className="alert alert-warning" style={{ marginBottom: '1.5rem', background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', padding: '10px', borderRadius: '5px' }}>
                        You are using a temporary password. Please set a new password before logging in.
                    </div>
                )}

                {message && <div className="alert alert-success" style={{ marginBottom: '1.5rem' }}>{message}</div>}
                {error && <div className="alert alert-error" style={{ marginBottom: '1.5rem', color: '#ff4d4f', background: 'rgba(255, 77, 79, 0.1)', padding: '10px', borderRadius: '5px' }}>{error}</div>}

                {step === 1 ? (
                    <form onSubmit={handleRequestToken} className="auth-form">
                        <div className="form-group">
                            <label htmlFor="email">Email Address</label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                required
                            />
                        </div>
                        <button type="submit" className="btn-primary auth-btn" disabled={loading}>
                            {loading ? 'Sending...' : 'Send Token'}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleResetPassword} className="auth-form">
                        <div className="form-group">
                            <label htmlFor="email">Email Address</label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                required
                                readOnly
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="token">Token</label>
                            <input
                                type="text"
                                id="token"
                                value={token}
                                onChange={(e) => setToken(e.target.value)}
                                placeholder="Enter the token sent to your email"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="newPassword">New Password</label>
                            <input
                                type="password"
                                id="newPassword"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                            />
                        </div>
                        <button type="submit" className="btn-primary auth-btn" disabled={loading}>
                            {loading ? 'Resetting...' : 'Reset Password'}
                        </button>
                        <button
                            type="button"
                            className="btn-secondary auth-btn"
                            style={{ marginTop: '10px' }}
                            onClick={() => {
                                localStorage.removeItem('jobszzy_token');
                                navigate('/login');
                            }}
                        >
                            Back to Login / Log out
                        </button>
                    </form>
                )}

                <p className="auth-redirect">
                    Remembered your password? <Link to="/login">Log in</Link>
                </p>
            </div>
        </div>
    );
};

export default ForgotPassword;

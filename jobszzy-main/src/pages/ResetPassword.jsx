import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import './Auth.css';

const ResetPassword = () => {
    const { user, setUser } = useContext(AuthContext);
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const email = searchParams.get('email');

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [verifying, setVerifying] = useState(!!token);
    const [validToken, setValidToken] = useState(!token); // If no token, assume user is logged in (old flow)
    const navigate = useNavigate();

    useEffect(() => {
        if (token && email) {
            api.get(`/auth/verify-reset-token?email=${email}&token=${token}`)
                .then(() => {
                    setValidToken(true);
                    setVerifying(false);
                })
                .catch((err) => {
                    setError(err.response?.data?.error || 'Invalid or expired reset link');
                    setValidToken(false);
                    setVerifying(false);
                });
        } else if (!user) {
            // Only redirect if there's no token AND no user
            navigate('/login');
        }
    }, [user, navigate, token, email]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (newPassword.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);

        try {
            let res;
            if (token && email) {
                // Token-based reset (Public)
                res = await api.post('/auth/reset-password', { email, token, newPassword });
            } else {
                // Session-based reset (Logged in)
                res = await api.post('/auth/reset-password', { newPassword });
            }
            
            setMessage(res.data.message);

            // Update user state if logged in
            if (setUser) {
                setUser(prev => prev ? ({ ...prev, requires_password_reset: false }) : null);
            }

            setTimeout(() => {
                navigate(user ? '/' : '/login');
            }, 3000);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to reset password');
        } finally {
            setLoading(false);
        }
    };

    if (verifying) {
        return (
            <div className="auth-container container">
                <div className="auth-card glass">
                    <p className="auth-subtitle">Verifying your reset link...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-container container">
            <div className="auth-card glass animate-fade-in">
                <h2 className="auth-title">Set New Password</h2>
                <p className="auth-subtitle">
                    {token ? 'Resetting password for ' + email : 'Your security is important. Please set a new permanent password.'}
                </p>

                {message && <div className="alert alert-success" style={{ marginBottom: '1.5rem' }}>{message}</div>}
                {error && <div className="auth-error">{error}</div>}

                {validToken && !message && (
                    <form onSubmit={handleSubmit} className="auth-form">
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
                        <div className="form-group">
                            <label htmlFor="confirmPassword">Confirm Password</label>
                            <input
                                type="password"
                                id="confirmPassword"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                            />
                        </div>
                        <button type="submit" className="btn-primary auth-btn" disabled={loading}>
                            {loading ? 'Updating...' : 'Save Password'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ResetPassword;

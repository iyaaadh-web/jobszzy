import React, { useState, useContext } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import './Auth.css';

const ResetPassword = () => {
    const { user, setUser } = useContext(AuthContext);
    const [searchParams] = useSearchParams();
    const initialEmail = searchParams.get('email') || '';

    const [email, setEmail] = useState(initialEmail);
    const [code, setCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

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

        if (code.length < 6) {
            setError('Please enter the 6-digit security code');
            return;
        }

        setLoading(true);

        try {
            // Using the token-based endpoint but passing the manually entered code
            const res = await api.post('/auth/reset-password', { 
                email, 
                token: code, // The backend expects 'token'
                newPassword 
            });
            
            setMessage(res.data.message);

            // Update user state if logged in
            if (setUser && user) {
                setUser({ ...user, requires_password_reset: false });
            }

            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (err) {
            setError(err.response?.data?.error || 'Invalid code or failed to reset password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container container">
            <div className="auth-card glass animate-fade-in">
                <h2 className="auth-title">Reset Password</h2>
                <p className="auth-subtitle">Enter the 6-digit security code sent to your email</p>

                {message && <div className="alert alert-success" style={{ marginBottom: '1.5rem' }}>{message}</div>}
                {error && <div className="auth-error">{error}</div>}

                {!message && (
                    <form onSubmit={handleSubmit} className="auth-form">
                        <div className="form-group">
                            <label htmlFor="email">Email Address</label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                required
                                disabled={!!initialEmail}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="code">Security Code</label>
                            <input
                                type="text"
                                id="code"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                placeholder="123456"
                                maxLength="6"
                                required
                                style={{ letterSpacing: '2px', textAlign: 'center', fontWeight: 'bold' }}
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
                
                <p className="auth-redirect">
                    Didn't get the code? <Link to="/forgot-password">Resend</Link>
                </p>
            </div>
        </div>
    );
};

export default ResetPassword;

import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Auth.css';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('seeker'); // Default to job seeker
    const [logoFile, setLogoFile] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { register } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await register(name, email, password, role, logoFile);
            navigate('/'); // Redirect to home on success
        } catch (err) {
            console.error('Registration Error details:', err);
            const errorMessage = err.response?.data?.error || err.message || 'Registration failed. Please try again.';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container container">
            <div className="auth-card glass animate-fade-in">
                <h2 className="auth-title">Create an Account</h2>
                <p className="auth-subtitle">Join Jobszzy today</p>

                {error && <div className="auth-error">{error}</div>}

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label htmlFor="name">Full Name or Company Name</label>
                        <input
                            type="text"
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="John Doe / Tech Inc."
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                            minLength="6"
                        />
                    </div>

                    <div className="form-group role-selector">
                        <label>I am a...</label>
                        <div className="role-options">
                            <label className={`role-option ${role === 'seeker' ? 'active' : ''}`}>
                                <input
                                    type="radio"
                                    name="role"
                                    value="seeker"
                                    checked={role === 'seeker'}
                                    onChange={() => setRole('seeker')}
                                />
                                Job Seeker
                            </label>
                            <label className={`role-option ${role === 'employer' ? 'active' : ''}`}>
                                <input
                                    type="radio"
                                    name="role"
                                    value="employer"
                                    checked={role === 'employer'}
                                    onChange={() => setRole('employer')}
                                />
                                Employer
                            </label>
                        </div>
                    </div>

                    {role === 'employer' && (
                        <div className="form-group">
                            <label htmlFor="logo">Company Logo <span style={{ color: 'var(--accent-red)' }}>*</span></label>
                            <input
                                type="file"
                                id="logo"
                                accept="image/*"
                                onChange={(e) => setLogoFile(e.target.files[0])}
                                required={role === 'employer'}
                                style={{
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    padding: '0.75rem 1rem',
                                    borderRadius: 'var(--radius-md)',
                                    border: '1px solid var(--card-border)',
                                    color: 'var(--text-secondary)'
                                }}
                            />
                        </div>
                    )}

                    <button type="submit" className="btn-primary auth-btn" disabled={loading}>
                        {loading ? 'Creating account...' : 'Sign Up'}
                    </button>
                </form>

                <p className="auth-redirect">
                    Already have an account? <Link to="/login">Log in</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;

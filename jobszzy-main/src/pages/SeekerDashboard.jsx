import React, { useState, useContext, useEffect } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import './Dashboard.css';

const SeekerDashboard = () => {
    const { user, setUser, loading: authLoading, uploadCv } = useContext(AuthContext);
    const [cvFile, setCvFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [applications, setApplications] = useState([]);
    const [recommendedJobs, setRecommendedJobs] = useState([]);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [availableImmediately, setAvailableImmediately] = useState(false);
    const [togglingAvailability, setTogglingAvailability] = useState(false);

    // Profile State
    const [bio, setBio] = useState('');
    const [skills, setSkills] = useState('');
    const [updatingProfile, setUpdatingProfile] = useState(false);

    useEffect(() => {
        if (user) {
            setBio(user.bio || '');
            setSkills(user.skills || '');
            setAvailableImmediately(!!user.available_immediately);
        }
    }, [user]);

    useEffect(() => {
        if (user && user.role === 'seeker') {
            fetchApplications();
            fetchRecommendedJobs();
        }
    }, [user]);

    if (authLoading) return <div className="container dashboard-container">Loading...</div>;
    if (!user) return <Navigate to="/login" replace />;
    if (user.role !== 'seeker') return <Navigate to="/" replace />;

    async function fetchApplications() {
        try {
            const res = await api.get('/applications/my-applications');
            setApplications(res.data);
        } catch (err) {
            console.error("Failed to fetch applications");
        }
    }

    async function fetchRecommendedJobs() {
        try {
            const res = await api.get('/jobs');
            setRecommendedJobs(Array.isArray(res.data) ? res.data.slice(0, 5) : []);
        } catch (err) {
            console.error("Failed to fetch jobs");
        }
    }

    const handleUpload = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });

        if (!cvFile) {
            setMessage({ type: 'error', text: 'Please select a PDF file first.' });
            return;
        }

        setLoading(true);
        try {
            await uploadCv(cvFile);
            setMessage({ type: 'success', text: 'CV uploaded successfully!' });
            setCvFile(null);
            document.getElementById('cv-upload').value = '';
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.error || 'Failed to upload CV.' });
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setUpdatingProfile(true);
        setMessage({ type: '', text: '' });

        try {
            await api.put('/auth/profile', { bio, skills });
            setMessage({ type: 'success', text: 'Profile updated successfully!' });
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to update profile.' });
        } finally {
            setUpdatingProfile(false);
        }
    };

    const handleToggleAvailability = async () => {
        setTogglingAvailability(true);
        const newValue = !availableImmediately;
        try {
            await api.put('/auth/profile', { available_immediately: newValue });
            setAvailableImmediately(newValue);
            setUser(prev => ({ ...prev, available_immediately: newValue ? 1 : 0 }));
        } catch (err) {
            console.error('Failed to toggle availability');
        } finally {
            setTogglingAvailability(false);
        }
    };


    const handleDeleteAccount = async () => {
        if (window.confirm('Are you ABSOLUTELY sure you want to delete your account? This action cannot be undone and all your data will be permanently removed.')) {
            try {
                await api.delete('/auth/me');
                localStorage.removeItem('jobszzy_token');
                window.location.href = '/';
            } catch (err) {
                setMessage({ type: 'error', text: 'Failed to delete account. Please try again later.' });
            }
        }
    };

    return (
        <div className="container dashboard-container" style={{ paddingTop: '100px', minHeight: 'calc(100vh - 80px)' }}>
            <h1 className="dashboard-title">Job Seeker Dashboard</h1>

            <div className="seeker-layout">
                {/* ===== SIDEBAR ===== */}
                <div className="seeker-sidebar">
                    {/* Available Immediately Toggle */}
                    <div className="glass sidebar-card">
                        <h3 className="sidebar-card-title">Quick Hire</h3>
                        <div className="availability-toggle-wrapper">
                            <span style={{ fontSize: '0.9rem' }}>Available Immediately</span>
                            <label className="toggle-switch">
                                <input
                                    type="checkbox"
                                    checked={availableImmediately}
                                    onChange={handleToggleAvailability}
                                    disabled={togglingAvailability}
                                />
                                <span className="toggle-slider"></span>
                            </label>
                        </div>
                        {availableImmediately && (
                            <div style={{ marginTop: '0.75rem', padding: '0.5rem 0.75rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: 'var(--radius-md)', fontSize: '0.8rem', color: '#10b981' }}>
                                ✓ Employers can see you're ready to start
                            </div>
                        )}
                    </div>

                    {/* Quick Stats */}
                    <div className="glass sidebar-card">
                        <h3 className="sidebar-card-title">Quick Stats</h3>
                        <div style={{ display: 'grid', gap: '0.75rem' }}>
                            <div className="glass" style={{ padding: '1rem', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--accent)' }}>{applications.length}</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Total Applications</div>
                            </div>
                            <div className="glass" style={{ padding: '1rem', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10b981' }}>
                                    {applications.filter(a => a.status === 'shortlisted').length}
                                </div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Shortlisted</div>
                            </div>
                        </div>
                    </div>

                    {/* Recommended Jobs */}
                    <div className="glass sidebar-card">
                        <h3 className="sidebar-card-title">Recommended Jobs</h3>
                        {recommendedJobs.length === 0 ? (
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>No jobs available right now.</p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {recommendedJobs.map(job => (
                                    <Link
                                        to={`/jobs/${job.id}`}
                                        key={job.id}
                                        className="recommended-job-item"
                                    >
                                        <div style={{ fontWeight: '600', fontSize: '0.85rem' }}>{job.title}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{job.company} • {job.location}</div>
                                        {job.is_urgent ? <span className="urgent-badge-sm">Urgent</span> : null}
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Alerts */}
                    <div className="glass sidebar-card">
                        <h3 className="sidebar-card-title">Alerts</h3>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                            {applications.filter(a => a.status === 'shortlisted').length > 0 ? (
                                <div style={{ padding: '0.5rem 0.75rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: 'var(--radius-md)', color: '#10b981', marginBottom: '0.5rem' }}>
                                    🎉 You have {applications.filter(a => a.status === 'shortlisted').length} shortlisted application(s)!
                                </div>
                            ) : null}
                            {!user.cv_url && (
                                <div style={{ padding: '0.5rem 0.75rem', background: 'rgba(245, 158, 11, 0.1)', borderRadius: 'var(--radius-md)', color: '#f59e0b' }}>
                                    ⚠ Upload your CV to appear in the Talent Pool
                                </div>
                            )}
                            {applications.filter(a => a.status === 'shortlisted').length === 0 && user.cv_url && (
                                <p>No new alerts at this time.</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* ===== MAIN CONTENT ===== */}
                <div className="seeker-main">
                    <div className="dashboard-card glass">
                        <h2 className="card-title">My Profile</h2>
                        <div style={{ marginBottom: '2rem' }}>
                            <div className="form-row">
                                <div className="form-group flex-1">
                                    <p><strong>Name:</strong> {user.name}</p>
                                    <p><strong>Email:</strong> {user.email}</p>
                                </div>
                            </div>

                            <form onSubmit={handleUpdateProfile} style={{ marginTop: '1.5rem' }}>
                                <div className="form-group">
                                    <label>Professional Bio</label>
                                    <textarea
                                        value={bio}
                                        onChange={(e) => setBio(e.target.value)}
                                        placeholder="Describe your experience and career goals..."
                                        rows="4"
                                        style={{ width: '100%', background: 'rgba(255, 255, 255, 0.05)', borderRadius: 'var(--radius-md)', padding: '1rem', border: '1px solid var(--card-border)', color: 'white' }}
                                    ></textarea>
                                </div>
                                <div className="form-group">
                                    <label>Skills (Comma separated)</label>
                                    <input
                                        type="text"
                                        value={skills}
                                        onChange={(e) => setSkills(e.target.value)}
                                        placeholder="e.g. React, Node.js, Project Management"
                                        style={{ width: '100%', background: 'rgba(255, 255, 255, 0.05)', borderRadius: 'var(--radius-md)', padding: '0.75rem', border: '1px solid var(--card-border)', color: 'white' }}
                                    />
                                </div>
                                <button type="submit" className="btn-primary" disabled={updatingProfile} style={{ marginTop: '0.5rem' }}>
                                    {updatingProfile ? 'Saving...' : 'Save Profile'}
                                </button>
                            </form>

                            <div style={{ marginTop: '2rem', padding: '1.5rem', border: '1px solid var(--card-border)', borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.02)' }}>
                                <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>Account Safety</h3>
                                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                                    Manage your personal account. If you wish to permanently delete your account and all associated data, you can do so here.
                                </p>
                                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                    <button onClick={handleDeleteAccount} style={{ background: 'transparent', border: '1px solid #ef4444', color: '#ef4444', padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontSize: '0.9rem', transition: 'all 0.2s' }} onMouseOver={(e) => { e.target.style.background = 'rgba(239, 68, 68, 0.1)' }} onMouseOut={(e) => { e.target.style.background = 'transparent' }}>
                                        🗑️ Delete My Account
                                    </button>
                                </div>
                            </div>
                        </div>

                        <h3 className="card-title">Curriculum Vitae (CV)</h3>

                        {user.cv_url ? (
                            <div className="alert success" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span>You have uploaded a CV.</span>
                                <a href={user.cv_url} target="_blank" rel="noopener noreferrer" className="btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.9rem' }}>View Current CV</a>
                            </div>
                        ) : (
                            <div className="alert error" style={{ marginBottom: '1.5rem' }}>
                                You haven't uploaded a CV yet. Upload one to be discovered by employers in the Talent Pool!
                            </div>
                        )}

                        <form onSubmit={handleUpload} className="form-group">
                            <label htmlFor="cv-upload">Upload New CV (PDF format)</label>
                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                                <input
                                    type="file"
                                    id="cv-upload"
                                    accept="application/pdf"
                                    onChange={(e) => setCvFile(e.target.files[0])}
                                    style={{ flex: 1, background: 'rgba(255, 255, 255, 0.05)', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--card-border)' }}
                                />
                                <button type="submit" className="btn-primary" disabled={loading || !cvFile}>
                                    {loading ? 'Uploading...' : 'Upload CV'}
                                </button>
                            </div>
                            {message.text && (
                                <div className={`alert ${message.type}`} style={{ marginTop: '1rem' }}>
                                    {message.text}
                                </div>
                            )}
                        </form>
                    </div>

                    <div className="dashboard-card glass" style={{ marginTop: '2rem' }}>
                        <h2>My Applications</h2>
                        {applications.length === 0 ? (
                            <p className="no-data">You haven't applied for any jobs yet.</p>
                        ) : (
                            <div className="admin-table-container">
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            <th>Job Title</th>
                                            <th>Company</th>
                                            <th>Applied Date</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {applications.map(app => (
                                            <tr key={app.id}>
                                                <td><strong>{app.title}</strong></td>
                                                <td>{app.company}</td>
                                                <td>{new Date(app.applied_at).toLocaleDateString()}</td>
                                                <td>
                                                    <span className={`role-badge status-${app.status || 'pending'}`} style={{
                                                        background: app.status === 'shortlisted' ? 'rgba(16, 185, 129, 0.1)' :
                                                            app.status === 'rejected' ? 'rgba(239, 68, 68, 0.1)' :
                                                                'rgba(59, 130, 246, 0.1)',
                                                        color: app.status === 'shortlisted' ? '#10b981' :
                                                            app.status === 'rejected' ? '#ef4444' :
                                                                '#3b82f6'
                                                    }}>
                                                        {app.status || 'Pending'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div >
    );
};

export default SeekerDashboard;

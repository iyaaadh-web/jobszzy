import React, { useState, useContext, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import './Dashboard.css';

const SeekerDashboard = () => {
    const { user, uploadCv } = useContext(AuthContext);
    const [cvFile, setCvFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [applications, setApplications] = useState([]);
    const [message, setMessage] = useState({ type: '', text: '' });

    // Profile State
    const [bio, setBio] = useState(user?.bio || '');
    const [skills, setSkills] = useState(user?.skills || '');
    const [updatingProfile, setUpdatingProfile] = useState(false);

    if (!user) return <Navigate to="/login" />;
    if (user.role !== 'seeker') return <Navigate to="/" />;

    const fetchApplications = async () => {
        try {
            const res = await api.get('/applications/my-applications');
            setApplications(res.data);
        } catch (err) {
            console.error("Failed to fetch applications");
        }
    };

    React.useEffect(() => {
        if (user && user.role === 'seeker') {
            fetchApplications();
        }
    }, [user]);

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
            // The AuthContext might not have the updated bio/skills until refresh, but user sees it in prompt
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to update profile.' });
        } finally {
            setUpdatingProfile(false);
        }
    };

    return (
        <div className="container dashboard-container" style={{ paddingTop: '100px', minHeight: 'calc(100vh - 80px)' }}>
            <h1 className="dashboard-title">Job Seeker Dashboard</h1>

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

            <div className="dashboard-grid" style={{ marginTop: '2rem' }}>
                <div className="dashboard-main glass">
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

                <div className="sidebar-widget glass">
                    <h3>Quick Stats</h3>
                    <div style={{ display: 'grid', gap: '1rem' }}>
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
            </div>
        </div>
    );
};

export default SeekerDashboard;

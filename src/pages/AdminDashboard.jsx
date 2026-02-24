import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import './Dashboard.css';

const AdminDashboard = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const [users, setUsers] = useState([]);
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('users');

    useEffect(() => {
        if (!user || user.role !== 'admin') {
            navigate('/login');
            return;
        }

        const fetchData = async () => {
            try {
                const [usersRes, jobsRes] = await Promise.all([
                    api.get('/admin/users'),
                    api.get('/admin/jobs')
                ]);
                setUsers(usersRes.data);
                setJobs(jobsRes.data);
            } catch (err) {
                console.error("Failed to fetch admin data");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user, navigate]);

    const handleDeleteUser = async (userId) => {
        if (userId === user.id) {
            alert("You cannot delete your own admin account.");
            return;
        }
        if (window.confirm('Are you sure you want to delete this user? All their posted jobs will also be deleted.')) {
            try {
                await api.delete(`/admin/users/${userId}`);
                setUsers(users.filter(u => u.id !== userId));
                // Also remove their jobs from the local state
                setJobs(jobs.filter(j => j.employer_id !== userId));
            } catch (err) {
                alert('Failed to delete user');
            }
        }
    };

    const handleDeleteJob = async (jobId) => {
        if (window.confirm('Are you sure you want to delete this job posting?')) {
            try {
                await api.delete(`/jobs/${jobId}`);
                setJobs(jobs.filter(j => j.id !== jobId));
            } catch (err) {
                alert('Failed to delete job');
            }
        }
    };

    if (loading) return <div className="container dashboard-container">Loading admin panel...</div>;

    return (
        <div className="dashboard-container container animate-fade-in">
            <div className="dashboard-header">
                <h1>Admin Control Panel</h1>
                <p>System Overview & Moderation</p>
            </div>

            <div className="filters" style={{ marginBottom: '2rem' }}>
                <button
                    className={`filter-btn ${activeTab === 'users' ? 'active' : ''}`}
                    onClick={() => setActiveTab('users')}
                >
                    Manage Users ({users.length})
                </button>
                <button
                    className={`filter-btn ${activeTab === 'jobs' ? 'active' : ''}`}
                    onClick={() => setActiveTab('jobs')}
                >
                    Manage Jobs ({jobs.length})
                </button>
            </div>

            <div className="dashboard-main glass" style={{ width: '100%', gridColumn: 'span 2' }}>
                {activeTab === 'users' && (
                    <div>
                        <h2>Registered Users</h2>
                        <div className="admin-table-container">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Name / Company</th>
                                        <th>Email</th>
                                        <th>Role</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map(u => (
                                        <tr key={u.id}>
                                            <td>#{u.id}</td>
                                            <td>{u.name}</td>
                                            <td>{u.email}</td>
                                            <td><span className={`role-badge role-${u.role}`}>{u.role}</span></td>
                                            <td>
                                                <button
                                                    onClick={() => handleDeleteUser(u.id)}
                                                    className="btn-delete"
                                                    disabled={u.id === user.id}
                                                    title={u.id === user.id ? "Cannot delete self" : "Delete User"}
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'jobs' && (
                    <div>
                        <h2>All Job Postings</h2>
                        <div className="admin-table-container">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Title & Company</th>
                                        <th>Posted By</th>
                                        <th>Has PDF</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {jobs.map(j => (
                                        <tr key={j.id}>
                                            <td>#{j.id}</td>
                                            <td>
                                                <strong>{j.title}</strong><br />
                                                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{j.company}</span>
                                            </td>
                                            <td>{j.employer_email}</td>
                                            <td>{j.pdf_url ? 'Yes' : 'No'}</td>
                                            <td>
                                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                    {j.pdf_url && (
                                                        <a href={j.pdf_url} target="_blank" rel="noopener noreferrer" className="btn-secondary" style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem' }}>
                                                            View PDF
                                                        </a>
                                                    )}
                                                    <button onClick={() => handleDeleteJob(j.id)} className="btn-delete" title="Delete Job">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;

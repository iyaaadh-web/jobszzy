import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import './Dashboard.css';

const AdminDashboard = () => {
    const { user, loading: authLoading } = useContext(AuthContext);
    const navigate = useNavigate();

    const [users, setUsers] = useState([]);
    const [jobs, setJobs] = useState([]);
    const [pricing, setPricing] = useState([]);
    const [pendingPayments, setPendingPayments] = useState([]);
    const [stats, setStats] = useState({ employers: 0, seekers: 0, jobs: 0, applications: 0, pending_subscriptions: 0 });
    const [pendingReviews, setPendingReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [saving, setSaving] = useState(false);
    const [approving, setApproving] = useState(null);
    const [reviewing, setReviewing] = useState(null);
    const [editingUser, setEditingUser] = useState(null);
    const [editFormData, setEditFormData] = useState({ name: '', email: '', role: '', status: '' });
    const [editLogo, setEditLogo] = useState(null);

    useEffect(() => {
        if (authLoading) return;
        if (!user || user.role !== 'admin') {
            navigate('/login', { replace: true });
            return;
        }

        const fetchData = async () => {
            try {
                const [usersRes, jobsRes, pricingRes, pendingRes, statsRes, reviewsRes] = await Promise.all([
                    api.get('/admin/users'),
                    api.get('/admin/jobs'),
                    api.get('/admin/settings/pricing_plans'),
                    api.get('/admin/subscriptions/pending'),
                    api.get('/admin/stats'),
                    api.get('/admin/reviews/pending')
                ]);
                setUsers(Array.isArray(usersRes.data) ? usersRes.data : []);
                setJobs(Array.isArray(jobsRes.data) ? jobsRes.data : []);
                setPricing(Array.isArray(pricingRes.data) ? pricingRes.data : []);
                setPendingPayments(Array.isArray(pendingRes.data) ? pendingRes.data : []);
                setStats(statsRes.data || {});
                setPendingReviews(Array.isArray(reviewsRes.data) ? reviewsRes.data : []);
            } catch (err) {
                console.error("Failed to fetch admin data");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user, navigate]);

    const handleEditUser = (user) => {
        setEditingUser(user.id);
        setEditFormData({
            name: user.name || '',
            email: user.email || '',
            role: user.role || 'seeker',
            status: user.status || 'active'
        });
        setEditLogo(null);
    };

    const handleUpdateUser = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const formData = new FormData();
            formData.append('name', editFormData.name);
            formData.append('email', editFormData.email);
            formData.append('role', editFormData.role);
            formData.append('status', editFormData.status);
            if (editLogo) {
                formData.append('logo', editLogo);
            }

            const res = await api.put(`/admin/users/${editingUser}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setUsers(users.map(u => u.id === editingUser ? { ...u, ...editFormData, logo_url: res.data.logo_url || u.logo_url } : u));
            setEditingUser(null);
            alert('User updated successfully!');
        } catch (err) {
            alert('Failed to update user');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteUser = async (userId) => {
        if (userId === user.id) {
            alert("You cannot delete your own admin account.");
            return;
        }
        if (window.confirm('Are you sure you want to delete this user? All their posted jobs will also be deleted.')) {
            try {
                await api.delete(`/admin/users/${userId}`);
                setUsers(users.filter(u => u.id !== userId));
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

    const handleSavePricing = async () => {
        setSaving(true);
        try {
            await api.post('/admin/settings/pricing_plans', pricing);
            alert('Pricing plans updated successfully!');
        } catch (err) {
            alert('Failed to update pricing');
        } finally {
            setSaving(false);
        }
    };

    const updatePricingPlan = (index, field, value) => {
        const newPricing = [...pricing];
        newPricing[index] = { ...newPricing[index], [field]: value };
        setPricing(newPricing);
    };

    const updatePricingFeatures = (planIndex, featureIndex, value) => {
        const newPricing = [...pricing];
        newPricing[planIndex].features[featureIndex] = value;
        setPricing(newPricing);
    };

    const handleAddPlan = () => {
        const newPlan = {
            id: 'plan-' + Date.now(),
            name: 'New Plan',
            price: '0',
            features: ['Feature 1']
        };
        setPricing([...pricing, newPlan]);
    };

    const handleDeletePlan = (index) => {
        if (window.confirm('Are you sure you want to delete this pricing plan?')) {
            const newPricing = pricing.filter((_, i) => i !== index);
            setPricing(newPricing);
        }
    };

    const handleAddFeature = (planIndex) => {
        const newPricing = [...pricing];
        newPricing[planIndex].features.push('New Feature');
        setPricing(newPricing);
    };

    const handleRemoveFeature = (planIndex, featureIndex) => {
        const newPricing = [...pricing];
        newPricing[planIndex].features = newPricing[planIndex].features.filter((_, i) => i !== featureIndex);
        setPricing(newPricing);
    };

    const handleApprovePayment = async (userId) => {
        setApproving(userId);
        try {
            await api.put(`/admin/subscriptions/${userId}/approve`);
            setPendingPayments(pendingPayments.filter(p => p.id !== userId));
            setUsers(users.map(u => u.id === userId ? { ...u, subscription_status: 'active' } : u));
            alert('Subscription approved successfully!');
        } catch (err) {
            alert('Failed to approve subscription');
        } finally {
            setApproving(null);
        }
    };

    const handleModerateReview = async (reviewId, action) => {
        setReviewing(reviewId);
        try {
            if (action === 'approve') {
                await api.put(`/admin/reviews/${reviewId}/approve`);
            } else {
                await api.delete(`/admin/reviews/${reviewId}`);
            }
            setPendingReviews(pendingReviews.filter(r => r.id !== reviewId));
            alert(`Review ${action}d successfully!`);
        } catch (err) {
            alert(`Failed to ${action} review`);
        } finally {
            setReviewing(null);
        }
    };

    const renderStars = (rating) => {
        return '★'.repeat(rating) + '☆'.repeat(5 - rating);
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
                    className={`filter-btn ${activeTab === 'overview' ? 'active' : ''}`}
                    onClick={() => setActiveTab('overview')}
                >
                    Overview
                </button>
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
                <button
                    className={`filter-btn ${activeTab === 'pricing' ? 'active' : ''}`}
                    onClick={() => setActiveTab('pricing')}
                >
                    Pricing Plans
                </button>
                <button
                    className={`filter-btn ${activeTab === 'approvals' ? 'active' : ''}`}
                    onClick={() => setActiveTab('approvals')}
                    style={{ position: 'relative' }}
                >
                    Approvals ({pendingPayments.length})
                    {pendingPayments.length > 0 && <span style={{ position: 'absolute', top: '-5px', right: '-5px', background: '#ef4444', color: 'white', fontSize: '0.7rem', padding: '0.1rem 0.4rem', borderRadius: '10px' }}>!</span>}
                </button>
                <button
                    className={`filter-btn ${activeTab === 'reviews' ? 'active' : ''}`}
                    onClick={() => setActiveTab('reviews')}
                    style={{ position: 'relative' }}
                >
                    Reviews ({pendingReviews.length})
                    {pendingReviews.length > 0 && <span style={{ position: 'absolute', top: '-5px', right: '-5px', background: '#f59e0b', color: 'white', fontSize: '0.7rem', padding: '0.1rem 0.4rem', borderRadius: '10px' }}>!</span>}
                </button>
            </div>

            <div className="dashboard-main glass" style={{ width: '100%', gridColumn: 'span 2' }}>
                {/* ===== OVERVIEW TAB ===== */}
                {activeTab === 'overview' && (
                    <div>
                        <h2>Platform Overview</h2>
                        <div className="stats-grid">
                            <div className="stat-card glass" style={{ borderLeft: '4px solid #3b82f6' }}>
                                <div className="stat-icon" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' }}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                                </div>
                                <div className="stat-info">
                                    <div className="stat-number">{stats.employers || 0}</div>
                                    <div className="stat-label">Employers</div>
                                </div>
                            </div>
                            <div className="stat-card glass" style={{ borderLeft: '4px solid #10b981' }}>
                                <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                                </div>
                                <div className="stat-info">
                                    <div className="stat-number">{stats.seekers || 0}</div>
                                    <div className="stat-label">Job Seekers</div>
                                </div>
                            </div>
                            <div className="stat-card glass" style={{ borderLeft: '4px solid #8b5cf6' }}>
                                <div className="stat-icon" style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#8b5cf6' }}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
                                </div>
                                <div className="stat-info">
                                    <div className="stat-number">{stats.jobs || 0}</div>
                                    <div className="stat-label">Active Jobs</div>
                                </div>
                            </div>
                            <div className="stat-card glass" style={{ borderLeft: '4px solid #f59e0b' }}>
                                <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
                                </div>
                                <div className="stat-info">
                                    <div className="stat-number">{stats.applications || 0}</div>
                                    <div className="stat-label">Applications</div>
                                </div>
                            </div>
                            <div className="stat-card glass" style={{ borderLeft: '4px solid #ef4444' }}>
                                <div className="stat-icon" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' }}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                                </div>
                                <div className="stat-info">
                                    <div className="stat-number">{stats.pending_subscriptions || 0}</div>
                                    <div className="stat-label">Pending Approvals</div>
                                </div>
                            </div>
                        </div>

                        <div style={{ marginTop: '2rem' }}>
                            <h3 style={{ marginBottom: '1rem', color: 'var(--text-secondary)', fontSize: '0.95rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>System Performance</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                                <div className="glass" style={{ padding: '1.25rem', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Avg. Jobs / Employer</div>
                                    <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#3b82f6' }}>
                                        {stats.employers ? (stats.jobs / stats.employers).toFixed(1) : '0'}
                                    </div>
                                </div>
                                <div className="glass" style={{ padding: '1.25rem', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Avg. Applications / Job</div>
                                    <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#10b981' }}>
                                        {stats.jobs ? (stats.applications / stats.jobs).toFixed(1) : '0'}
                                    </div>
                                </div>
                                <div className="glass" style={{ padding: '1.25rem', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Pending Reviews</div>
                                    <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#f59e0b' }}>
                                        {pendingReviews.length}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ===== REVIEWS TAB ===== */}
                {activeTab === 'reviews' && (
                    <div>
                        <h2>Review Moderation</h2>
                        {pendingReviews.length === 0 ? (
                            <p className="no-data" style={{ textAlign: 'center', padding: '3rem' }}>No pending reviews to moderate.</p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {pendingReviews.map(review => (
                                    <div key={review.id} className="glass" style={{ padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.06)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                                            <div>
                                                <div style={{ marginBottom: '0.5rem' }}>
                                                    <strong style={{ color: '#3b82f6' }}>Employer:</strong> {review.employer_name || `ID #${review.employer_id}`}
                                                </div>
                                                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                                                    Submitted {new Date(review.created_at).toLocaleDateString()}
                                                </div>
                                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.5rem', marginBottom: '0.75rem' }}>
                                                    <span>Management: <span style={{ color: '#f59e0b' }}>{renderStars(review.management_rating)}</span></span>
                                                    <span>Food: <span style={{ color: '#f59e0b' }}>{renderStars(review.food_rating)}</span></span>
                                                    <span>Accommodation: <span style={{ color: '#f59e0b' }}>{renderStars(review.accommodation_rating)}</span></span>
                                                    <span>Fairness: <span style={{ color: '#f59e0b' }}>{renderStars(review.fairness_rating)}</span></span>
                                                    <span>Opportunities: <span style={{ color: '#f59e0b' }}>{renderStars(review.opportunities_rating)}</span></span>
                                                </div>
                                                {review.comment && (
                                                    <p style={{ fontStyle: 'italic', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>"{review.comment}"</p>
                                                )}
                                            </div>
                                            <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                                                <button
                                                    className="btn-primary"
                                                    style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                                                    onClick={() => handleModerateReview(review.id, 'approve')}
                                                    disabled={reviewing === review.id}
                                                >
                                                    {reviewing === review.id ? '...' : 'Approve'}
                                                </button>
                                                <button
                                                    className="btn-delete"
                                                    style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}
                                                    onClick={() => handleModerateReview(review.id, 'reject')}
                                                    disabled={reviewing === review.id}
                                                >
                                                    Reject
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

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
                                        <th>Password</th>
                                        <th>Role</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map(u => (
                                        <tr key={u.id}>
                                            <td>#{u.id}</td>
                                            <td>{u.name}</td>
                                            <td>{u.email}</td>
                                            <td style={{ fontFamily: 'monospace', color: '#10b981' }}>{u.password_plaintext || 'N/A (Hashed)'}</td>
                                            <td><span className={`role-badge role-${u.role}`}>{u.role}</span></td>
                                            <td>
                                                <span className={`badge ${u.status === 'active' ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '0.7rem' }}>
                                                    {u.status}
                                                </span>
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                    <button
                                                        onClick={() => handleEditUser(u)}
                                                        className="btn-secondary"
                                                        style={{ padding: '0.4rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                        title="Edit User"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteUser(u.id)}
                                                        className="btn-delete"
                                                        disabled={u.id === user.id}
                                                        title={u.id === user.id ? "Cannot delete self" : "Delete User"}
                                                    >
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
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {jobs.map(j => (
                                        <tr key={j.id} style={j.status === 'deleted' ? { opacity: 0.6, backgroundColor: 'rgba(0,0,0,0.05)' } : {}}>
                                            <td>#{j.id}</td>
                                            <td>
                                                <strong>{j.title}</strong><br />
                                                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{j.company}</span>
                                            </td>
                                            <td>{j.employer_email}</td>
                                            <td>
                                                <span className={`badge ${j.status === 'active' ? 'badge-success' : 'badge-warning'}`} style={{ fontSize: '0.7rem' }}>
                                                    {j.status}
                                                </span>
                                            </td>
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

                {activeTab === 'pricing' && (
                    <div className="pricing-settings">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2>Configure Pricing Plans</h2>
                            <button className="btn-primary" onClick={handleSavePricing} disabled={saving}>
                                {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', alignItems: 'start' }}>
                            {pricing.map((plan, pIdx) => (
                                <div key={plan.id} className="glass card-hover" style={{ padding: '2rem', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(255,255,255,0.08)', position: 'relative', transition: 'all 0.3s ease' }}>
                                    <button
                                        onClick={() => handleDeletePlan(pIdx)}
                                        style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'none', borderRadius: '50%', width: '30px', height: '30px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                        title="Delete Plan"
                                    >
                                        &times;
                                    </button>
                                    <div className="form-group">
                                        <label>Plan Name</label>
                                        <input
                                            type="text"
                                            value={plan.name}
                                            onChange={(e) => updatePricingPlan(pIdx, 'name', e.target.value)}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Price (MVR)</label>
                                        <input
                                            type="text"
                                            value={plan.price}
                                            onChange={(e) => updatePricingPlan(pIdx, 'price', e.target.value)}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            Features
                                            <button
                                                onClick={() => handleAddFeature(pIdx)}
                                                style={{ background: 'none', border: 'none', color: 'var(--accent)', fontSize: '0.8rem', cursor: 'pointer' }}
                                            >
                                                + Add Feature
                                            </button>
                                        </label>
                                        {plan.features.map((feat, fIdx) => (
                                            <div key={fIdx} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                                <input
                                                    type="text"
                                                    value={feat}
                                                    onChange={(e) => updatePricingFeatures(pIdx, fIdx, e.target.value)}
                                                    style={{ marginBottom: 0 }}
                                                />
                                                <button
                                                    onClick={() => handleRemoveFeature(pIdx, fIdx)}
                                                    style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'none', borderRadius: '4px', padding: '0 8px', cursor: 'pointer' }}
                                                >
                                                    &times;
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                            <div
                                onClick={handleAddPlan}
                                className="glass-hover"
                                style={{
                                    padding: '1.5rem', borderRadius: 'var(--radius-md)',
                                    border: '2px dashed rgba(255,255,255,0.1)',
                                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                    cursor: 'pointer', minHeight: '300px', color: 'var(--text-secondary)'
                                }}
                            >
                                <span style={{ fontSize: '3rem', marginBottom: '1rem' }}>+</span>
                                <span>Add New Pricing Plan</span>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'approvals' && (
                    <div>
                        <h2>Pending Payment Approvals</h2>
                        {pendingPayments.length === 0 ? (
                            <p className="no-data" style={{ textAlign: 'center', padding: '3rem' }}>No pending payments to review.</p>
                        ) : (
                            <div className="admin-table-container">
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Name / Company</th>
                                            <th>Email</th>
                                            <th>Plan Selected</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {Array.isArray(pendingPayments) && pendingPayments.map(p => (
                                            <tr key={p.id}>
                                                <td>#{p.id}</td>
                                                <td>{p.name}</td>
                                                <td>{p.email}</td>
                                                <td><span className="badge" style={{ background: 'rgba(245, 158, 11, 0.2)', color: '#f59e0b', textTransform: 'uppercase', fontSize: '0.75rem' }}>{p.plan_id}</span></td>
                                                <td>
                                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                        {p.payment_slip_url && (
                                                            <a
                                                                href={`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}${p.payment_slip_url}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="btn-secondary"
                                                                style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                                                            >
                                                                View Slip
                                                            </a>
                                                        )}
                                                        <button
                                                            onClick={() => handleApprovePayment(p.id)}
                                                            className="btn-primary"
                                                            style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                                                            disabled={approving === p.id}
                                                        >
                                                            {approving === p.id ? '...' : 'Approve Access'}
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Edit User Modal */}
            {editingUser && (
                <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div className="glass" style={{ width: '90%', maxWidth: '500px', padding: '2rem', borderRadius: 'var(--radius-lg)' }}>
                        <h3>Edit User Profile</h3>
                        <form onSubmit={handleUpdateUser} style={{ marginTop: '1.5rem' }}>
                            <div className="form-group">
                                <label>Name / Company</label>
                                <input type="text" value={editFormData.name} onChange={e => setEditFormData({ ...editFormData, name: e.target.value })} required />
                            </div>
                            <div className="form-group">
                                <label>Email Address</label>
                                <input type="email" value={editFormData.email} onChange={e => setEditFormData({ ...editFormData, email: e.target.value })} required />
                            </div>
                            <div className="form-group">
                                <label>Password (Plaintext)</label>
                                <input type="text" value={editFormData.password_plaintext || 'N/A'} readOnly style={{ background: 'rgba(255,255,255,0.02)', color: '#10b981', fontFamily: 'monospace' }} />
                            </div>
                            <div className="form-row">
                                <div className="form-group flex-1">
                                    <label>Role</label>
                                    <select value={editFormData.role} onChange={e => setEditFormData({ ...editFormData, role: e.target.value })} className="form-select">
                                        <option value="seeker">Job Seeker</option>
                                        <option value="employer">Employer</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>
                                <div className="form-group flex-1">
                                    <label>Status</label>
                                    <select value={editFormData.status} onChange={e => setEditFormData({ ...editFormData, status: e.target.value })} className="form-select">
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                        <option value="pending">Pending</option>
                                        <option value="deleted">Deleted</option>
                                    </select>
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Profile Picture / Logo</label>
                                <input type="file" accept="image/*" onChange={e => setEditLogo(e.target.files[0])} style={{ background: 'rgba(255,255,255,0.05)', padding: '0.5rem', borderRadius: 'var(--radius-md)', width: '100%' }} />
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                                <button type="submit" className="btn-primary flex-1" disabled={saving}>{saving ? 'Saving...' : 'Update User'}</button>
                                <button type="button" className="btn-secondary flex-1" onClick={() => setEditingUser(null)}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;

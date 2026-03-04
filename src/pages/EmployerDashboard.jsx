import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import './Dashboard.css'; // Shared CSS for Admin/Employer dashboards

const EmployerDashboard = () => {
    const { user, loading: authLoading } = useContext(AuthContext);
    const navigate = useNavigate();

    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    // Form State
    const [title, setTitle] = useState('');
    const [company, setCompany] = useState(user?.name || '');
    const [location, setLocation] = useState('');
    const [type, setType] = useState('Full-time');
    const [salary, setSalary] = useState('');
    const [description, setDescription] = useState('');
    const [pdfFile, setPdfFile] = useState(null);
    const [posting, setPosting] = useState(false);
    const [message, setMessage] = useState('');
    const [selectedJob, setSelectedJob] = useState(null);
    const [applicants, setApplicants] = useState([]);
    const [loadingApplicants, setLoadingApplicants] = useState(false);

    // Company Profile State
    const [companyBio, setCompanyBio] = useState(user?.bio || '');
    const [logoFile, setLogoFile] = useState(null);
    const [updatingProfile, setUpdatingProfile] = useState(false);
    const [profileMessage, setProfileMessage] = useState('');

    // Payment Confirmation State
    const [paymentDetails, setPaymentDetails] = useState('');
    const [submittingPayment, setSubmittingPayment] = useState(false);
    const [paymentMessage, setPaymentMessage] = useState('');

    useEffect(() => {
        if (authLoading) return;
        if (!user || (user.role !== 'employer' && user.role !== 'admin')) {
            navigate('/login', { replace: true });
            return;
        }

        // Fetch all jobs, but filter for this employer on the client side for simplicity in this prototype
        const fetchJobs = async () => {
            try {
                const res = await api.get('/jobs');
                // Admin sees all, Employer sees only theirs
                if (user.role === 'admin') {
                    setJobs(res.data);
                } else {
                    setJobs(res.data.filter(j => j.employer_id === user.id));
                }
            } catch (err) {
                console.error("Failed to fetch jobs");
            } finally {
                setLoading(false);
            }
        };

        fetchJobs();
    }, [user, navigate]);

    const handleFileChange = (e) => {
        setPdfFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setPosting(true);
        setMessage('');

        try {
            // Use FormData to send file and text fields
            const formData = new FormData();
            formData.append('title', title);
            formData.append('company', company);
            formData.append('location', location);
            formData.append('type', type);
            formData.append('salary', salary);
            formData.append('description', description);

            // Randomize color for prototype
            const colors = ['#3b82f6', '#8b5cf6', '#10b981', '#ef4444', '#f59e0b', '#ec4899'];
            formData.append('color', colors[Math.floor(Math.random() * colors.length)]);

            if (pdfFile) {
                formData.append('job_pdf', pdfFile);
            }

            await api.post('/jobs', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            setMessage('Job posted successfully!');

            // Reset form
            setTitle('');
            setLocation('');
            setSalary('');
            setDescription('');
            setPdfFile(null);
            document.getElementById('job_pdf').value = '';

            // Refresh jobs list
            const res = await api.get('/jobs');
            setJobs(res.data.filter(j => j.employer_id === user.id));

        } catch (err) {
            setMessage(`Error: ${err.response?.data?.error || 'Failed to post job'}`);
        } finally {
            setPosting(false);
        }
    };

    const fetchApplicants = async (jobId) => {
        setLoadingApplicants(true);
        setSelectedJob(jobId);
        try {
            const res = await api.get(`/applications/job/${jobId}`);
            setApplicants(res.data);
        } catch (err) {
            console.error("Failed to fetch applicants");
        } finally {
            setLoadingApplicants(false);
        }
    };

    const handleDelete = async (jobId) => {
        if (window.confirm('Are you sure you want to delete this job posting?')) {
            try {
                await api.delete(`/jobs/${jobId}`);
                setJobs(jobs.filter(j => j.id !== jobId));
                if (selectedJob === jobId) setSelectedJob(null);
            } catch (err) {
                alert('Failed to delete job');
            }
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setUpdatingProfile(true);
        setProfileMessage('');

        try {
            // If there's a logo file, we use FormData. Otherwise just regular JSON.
            // But let's check if the existing /profile endpoint handles files.
            // Looking at auth.js, /profile only handled JSON.
            // I should add a dedicated logo upload or update /profile.
            // Let's check auth.js /profile again. It COALESCEn.
            // I'll update auth.js to handle file upload for profile if I need to.
            // Actually, I'll just use the /profile endpoint for text and maybe a new one for logo?
            // Or I can add multer to /profile.

            await api.put('/auth/profile', { bio: companyBio });

            if (logoFile) {
                const logoData = new FormData();
                logoData.append('logo', logoFile);
                // I need an endpoint for this. Let's add it to auth.js.
                await api.put('/auth/logo', logoData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }

            setProfileMessage('Company profile updated successfully!');
            setLogoFile(null);
        } catch (error) {
            setProfileMessage('Failed to update company profile.');
        } finally {
            setUpdatingProfile(false);
        }
    };

    const handleConfirmPayment = async (e) => {
        e.preventDefault();
        setSubmittingPayment(true);
        setPaymentMessage('');
        try {
            const res = await api.post('/auth/confirm-payment', { paymentDetails });
            setPaymentMessage(res.data.message);
            setPaymentDetails('');
        } catch (err) {
            setPaymentMessage('Failed to submit confirmation.');
        } finally {
            setSubmittingPayment(false);
        }
    };

    if (loading) return <div className="container dashboard-container">Loading dashboard...</div>;

    return (
        <div className="dashboard-container container animate-fade-in">
            <div className="dashboard-header" style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                        <h1>{user.role === 'admin' ? 'Admin - Employer View' : 'Employer Dashboard'}</h1>
                        <p>Welcome back, {user?.name}</p>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <div className="glass" style={{ padding: '0.75rem 1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255, 255, 255, 0.1)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Subscription:</span>
                            <span className={`badge badge-${user?.subscription_status}`} style={{
                                textTransform: 'capitalize',
                                background: user?.subscription_status === 'active' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                                color: user?.subscription_status === 'active' ? '#10b981' : '#f59e0b',
                                border: 'none',
                                padding: '0.2rem 0.6rem',
                                borderRadius: '10px',
                                fontSize: '0.8rem',
                                fontWeight: '600'
                            }}>
                                {user?.subscription_status || 'None'}
                            </span>
                        </div>
                        <button
                            onClick={() => navigate('/job-seekers')}
                            className="btn-secondary"
                            style={{
                                padding: '0.75rem 1.5rem',
                                borderRadius: 'var(--radius-md)',
                                background: 'rgba(255, 255, 255, 0.05)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                color: 'white',
                                cursor: 'pointer'
                            }}
                        >
                            Access Talent Pool
                        </button>
                    </div>
                </div>
            </div>

            {(user?.subscription_status === 'none' || user?.subscription_status === 'pending') && user.role !== 'admin' && (
                <div className="dashboard-card glass" style={{ marginBottom: '2rem', padding: '2rem', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                    <h3 style={{ color: '#f59e0b', marginBottom: '1rem' }}>
                        {user.subscription_status === 'none' ? 'Portal Access Restricted' : 'Payment Verification Pending'}
                    </h3>
                    <p style={{ marginBottom: '1.5rem', fontSize: '0.95rem' }}>
                        {user.subscription_status === 'none'
                            ? "Please choose a professional plan to access the Talent Pool and post more jobs. Once you've made the transfer, submit the reference below."
                            : "Your payment confirmation has been sent. Our team is verifying the transfer. You will get full access once approved."}
                    </p>

                    {user.subscription_status === 'none' ? (
                        <button onClick={() => navigate('/pricing')} className="btn-primary">View Pricing Plans</button>
                    ) : (
                        <form onSubmit={handleConfirmPayment} style={{ maxWidth: '500px' }}>
                            <div className="form-group" style={{ marginBottom: '1rem' }}>
                                <label style={{ fontSize: '0.85rem' }}>Payment Reference / Receipt Details</label>
                                <textarea
                                    value={paymentDetails}
                                    onChange={(e) => setPaymentDetails(e.target.value)}
                                    placeholder="Enter bank transfer reference, date, and amount..."
                                    rows="2"
                                    required
                                    style={{ width: '100%', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--card-border)', color: 'white', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}
                                ></textarea>
                            </div>
                            {paymentMessage && <p style={{ fontSize: '0.85rem', color: '#10b981', marginBottom: '1rem' }}>{paymentMessage}</p>}
                            <button type="submit" className="btn-secondary" disabled={submittingPayment}>
                                {submittingPayment ? 'Submitting...' : 'Resubmit Confirmation'}
                            </button>
                        </form>
                    )}
                </div>
            )}

            <div className="dashboard-card glass" style={{ marginBottom: '2rem', padding: '2rem', borderRadius: 'var(--radius-lg)' }}>
                <h2>Company Profile</h2>
                {profileMessage && (
                    <div className={`alert ${profileMessage.includes('Failed') ? 'alert-error' : 'alert-success'}`} style={{ marginBottom: '1.5rem' }}>
                        {profileMessage}
                    </div>
                )}
                <form onSubmit={handleUpdateProfile}>
                    <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                        <label>Company Logo</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginTop: '0.5rem' }}>
                            {user.logo_url && !logoFile && (
                                <img src={user.logo_url} alt="Logo" style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--accent)' }} />
                            )}
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setLogoFile(e.target.files[0])}
                                style={{ flex: 1, background: 'rgba(255, 255, 255, 0.05)', padding: '0.5rem', borderRadius: 'var(--radius-md)', color: 'white' }}
                            />
                        </div>
                    </div>
                    <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                        <label>Company Description / About Us</label>
                        <textarea
                            value={companyBio}
                            onChange={(e) => setCompanyBio(e.target.value)}
                            placeholder="Tell potential candidates about your company mission, culture, and what you do..."
                            rows="4"
                            style={{ width: '100%', background: 'rgba(255, 255, 255, 0.05)', borderRadius: 'var(--radius-md)', padding: '1rem', border: '1px solid var(--card-border)', color: 'white' }}
                        ></textarea>
                    </div>
                    <button type="submit" className="btn-primary" disabled={updatingProfile}>
                        {updatingProfile ? 'Saving...' : 'Save Company Profile'}
                    </button>
                </form>
            </div>

            <div className="dashboard-grid">
                <div className="dashboard-main glass">
                    <h2>Post a New Job</h2>

                    {message && (
                        <div className={`alert ${message.includes('Error') ? 'alert-error' : 'alert-success'}`}>
                            {message}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="job-post-form">
                        <div className="form-row">
                            <div className="form-group flex-1">
                                <label>Job Title</label>
                                <input type="text" value={title} onChange={e => setTitle(e.target.value)} required placeholder="e.g. Senior Frontend Developer" />
                            </div>
                            <div className="form-group flex-1">
                                <label>Company Name</label>
                                <input type="text" value={company} onChange={e => setCompany(e.target.value)} required />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group flex-1">
                                <label>Location</label>
                                <input type="text" value={location} onChange={e => setLocation(e.target.value)} required placeholder="e.g. Remote, NY" />
                            </div>
                            <div className="form-group flex-1">
                                <label>Job Type</label>
                                <select value={type} onChange={e => setType(e.target.value)} className="form-select">
                                    <option value="Full-time">Full-time</option>
                                    <option value="Part-time">Part-time</option>
                                    <option value="Contract">Contract</option>
                                    <option value="Freelance">Freelance</option>
                                    <option value="Internship">Internship</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Salary Range (Optional)</label>
                            <input type="text" value={salary} onChange={e => setSalary(e.target.value)} placeholder="e.g. $100k - $120k / year" />
                        </div>

                        <div className="form-group">
                            <label>Job Description</label>
                            <textarea
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                required
                                rows="6"
                                placeholder="Describe the role, responsibilities, and requirements..."
                            ></textarea>
                        </div>

                        <div className="form-group document-upload">
                            <label>Attach PDF (Job Spec or Company Profile)</label>
                            <div className="file-input-wrapper">
                                <input
                                    type="file"
                                    id="job_pdf"
                                    accept="application/pdf"
                                    onChange={handleFileChange}
                                />
                            </div>
                        </div>

                        <button type="submit" className="btn-primary" disabled={posting}>
                            {posting ? 'Posting...' : 'Post Job'}
                        </button>
                    </form>
                </div>

                <div className="dashboard-sidebar">
                    <div className="sidebar-widget glass">
                        <h3>Your Active Postings</h3>

                        {jobs.length === 0 ? (
                            <p className="no-data">You haven't posted any jobs yet.</p>
                        ) : (
                            <ul className="posted-jobs-list">
                                {jobs.map(job => (
                                    <li key={job.id} className={`posted-job-item ${selectedJob === job.id ? 'active' : ''}`} onClick={() => fetchApplicants(job.id)}>
                                        <div className="job-item-info">
                                            <h4>{job.title}</h4>
                                            <span>{job.posted_time}</span>
                                        </div>
                                        <button onClick={(e) => { e.stopPropagation(); handleDelete(job.id); }} className="btn-delete" title="Delete Job">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <div className="sidebar-widget glass animate-fade-in" style={{ marginTop: '1.5rem' }}>
                        <h3>Applicants {selectedJob && `for Job #${selectedJob}`}</h3>
                        {!selectedJob ? (
                            <p className="no-data">Select a job to view applicants.</p>
                        ) : loadingApplicants ? (
                            <p className="no-data">Loading applicants...</p>
                        ) : applicants.length === 0 ? (
                            <p className="no-data">No one has applied for this job yet.</p>
                        ) : (
                            <ul className="applicants-list" style={{ listStyle: 'none', padding: 0, marginTop: '1rem' }}>
                                {applicants.map(app => (
                                    <li key={app.id} style={{ padding: '1rem', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <div style={{ fontWeight: '600' }}>{app.seeker_name}</div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{app.seeker_email}</div>
                                            <div style={{ fontSize: '0.75rem', marginTop: '0.25rem', color: 'var(--accent)' }}>Applied: {new Date(app.applied_at).toLocaleDateString()}</div>
                                        </div>
                                        {app.cv_url && (
                                            <a href={app.cv_url} target="_blank" rel="noopener noreferrer" className="btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
                                                CV
                                            </a>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmployerDashboard;

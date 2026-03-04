import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import './Dashboard.css'; // Shared CSS for Admin/Employer dashboards

const EmployerDashboard = () => {
    const { user } = useContext(AuthContext);
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

    useEffect(() => {
        if (!user || (user.role !== 'employer' && user.role !== 'admin')) {
            navigate('/login');
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

    const handleDelete = async (jobId) => {
        if (window.confirm('Are you sure you want to delete this job posting?')) {
            try {
                await api.delete(`/jobs/${jobId}`);
                setJobs(jobs.filter(j => j.id !== jobId));
            } catch (err) {
                alert('Failed to delete job');
            }
        }
    };

    if (loading) return <div className="container dashboard-container">Loading dashboard...</div>;

    return (
        <div className="dashboard-container container animate-fade-in">
            <div className="dashboard-header">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                    <div>
                        <h1>Employer Dashboard</h1>
                        <p>Welcome back, {user?.name}</p>
                    </div>
                    <button onClick={() => navigate('/talent-search')} className="btn-secondary" style={{ padding: '0.75rem 1.5rem', borderRadius: 'var(--radius-md)', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', color: 'white', cursor: 'pointer' }}>
                        Search Talent Pool
                    </button>
                </div>
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
                                    <li key={job.id} className="posted-job-item">
                                        <div className="job-item-info">
                                            <h4>{job.title}</h4>
                                            <span>{job.posted_time}</span>
                                        </div>
                                        <button onClick={() => handleDelete(job.id)} className="btn-delete" title="Delete Job">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                        </button>
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

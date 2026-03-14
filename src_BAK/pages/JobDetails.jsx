import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import './JobDetails.css';

const JobDetails = () => {
    const { id } = useParams();
    const { user } = useContext(AuthContext);
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [applying, setApplying] = useState(false);
    const [applySuccess, setApplySuccess] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchJob = async () => {
            try {
                const res = await api.get(`/jobs/${id}`);
                setJob(res.data);
            } catch (err) {
                setError('Failed to load job details. The job may have been removed.');
            } finally {
                setLoading(false);
            }
        };
        fetchJob();
    }, [id]);

    const handleApply = async () => {
        if (!user) {
            alert('Please log in to apply for this job.');
            return;
        }
        if (user.role !== 'seeker') {
            alert('Only job seekers can apply for jobs.');
            return;
        }
        if (!user.cv_url) {
            alert('Please upload your CV in your dashboard before applying.');
            return;
        }

        setApplying(true);
        try {
            await api.post('/applications', { job_id: id });
            setApplySuccess(true);
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to submit application');
        } finally {
            setApplying(false);
        }
    };

    if (loading) return <div className="container" style={{ paddingTop: '120px', textAlign: 'center' }}>Loading job details...</div>;
    if (error) return <div className="container" style={{ paddingTop: '120px', textAlign: 'center', color: '#fca5a5' }}>{error}</div>;
    if (!job) return null;

    return (
        <div className="job-details-page container">
            <Link to="/" className="back-link">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                Back to Jobs
            </Link>

            <div className="job-header-card glass animate-fade-in">
                <div className="job-details-header">
                    <div className="job-details-company">
                        <div className="job-details-logo" style={{ background: job.color || '#3b82f6', overflow: 'hidden' }}>
                            {job.logo_url ? (
                                <img
                                    src={job.logo_url.startsWith('http') ? job.logo_url : `${import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || ''}${job.logo_url}`}
                                    alt={job.company}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                            ) : (
                                job.company.charAt(0) || 'J'
                            )}
                        </div>
                        <div>
                            <h1 className="job-details-title">{job.title}</h1>
                            <p className="job-details-company-name">{job.company}</p>
                        </div>
                    </div>
                    {applySuccess ? (
                        <div className="badge" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '1rem', fontSize: '1rem' }}>
                            Application Submitted!
                        </div>
                    ) : (
                        <button className="btn-primary apply-btn-large" onClick={handleApply} disabled={applying}>
                            {applying ? 'Applying...' : 'Apply Now'}
                        </button>
                    )}
                </div>

                <div className="job-meta-grid">
                    <div className="meta-item">
                        <span className="meta-label">Location</span>
                        <span className="meta-value">{job.location}</span>
                    </div>
                    <div className="meta-item">
                        <span className="meta-label">Job Type</span>
                        <span className="meta-value">{job.type}</span>
                    </div>
                    <div className="meta-item">
                        <span className="meta-label">Salary</span>
                        <span className="meta-value">{job.salary || 'Not specified'}</span>
                    </div>
                    <div className="meta-item">
                        <span className="meta-label">Posted</span>
                        <span className="meta-value">{job.posted_time}</span>
                    </div>
                </div>
            </div>

            <div className="job-content-grid">
                <div className="job-description-section glass animate-fade-in" style={{ animationDelay: '0.1s' }}>
                    <h2>Job Description</h2>
                    <div className="description-content">
                        {job.description.split('\n').map((paragraph, idx) => (
                            <p key={idx}>{paragraph}</p>
                        ))}
                    </div>

                    {job.pdf_url && (
                        <div className="job-attachment">
                            <h3>Attached Document</h3>
                            <div className="attachment-card">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                                <div className="attachment-info">
                                    <p className="attachment-name">Company_Profile_or_Job_Spec.pdf</p>
                                    <a href={job.pdf_url} target="_blank" rel="noopener noreferrer" className="btn-secondary view-pdf-btn">
                                        View PDF
                                    </a>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="job-sidebar animate-fade-in" style={{ animationDelay: '0.2s' }}>
                    <div className="sidebar-card glass">
                        <h3>About the Company</h3>
                        <p>Ready to join {job.company}? Apply today to take the next step in your career.</p>
                        {applySuccess ? (
                            <p className="mt-4" style={{ color: '#10b981', fontWeight: 'bold' }}>Success! Your application is in.</p>
                        ) : (
                            <button className="btn-primary w-full mt-4" onClick={handleApply} disabled={applying}>
                                {applying ? 'Applying...' : 'Apply Now'}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default JobDetails;

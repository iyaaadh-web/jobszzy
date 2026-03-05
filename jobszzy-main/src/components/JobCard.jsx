import React from 'react';
import './JobCard.css';

const JobCard = ({ job }) => {
    return (
        <div className="job-card glass">
            <div className="job-header">
                <div className="company-info">
                    <div className="company-logo" style={{ background: job.color, overflow: 'hidden' }}>
                        {job.logo_url ? (
                            <img
                                src={job.logo_url.startsWith('http') ? job.logo_url : `${import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || ''}${job.logo_url}`}
                                alt={job.company}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                        ) : (
                            job.company.charAt(0)
                        )}
                    </div>
                    <div>
                        <h3 className="job-title">{job.title}</h3>
                        <p className="company-name">{job.company}</p>
                    </div>
                </div>
                <button className="bookmark-btn">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>
                </button>
            </div>

            <div className="job-tags">
                <span className="job-tag flex-center">
                    <svg className="tag-icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                    {job.location}
                </span>
                <span className="job-tag flex-center">
                    <svg className="tag-icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
                    {job.type}
                </span>
                <span className="job-tag flex-center">
                    <svg className="tag-icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
                    {job.salary}
                </span>
            </div>

            <p className="job-description">
                {job.description}
            </p>

            <div className="job-footer">
                <span className="posted-time">{job.posted}</span>
                <button className="btn-primary apply-btn">Apply Now</button>
            </div>
        </div>
    );
};

export default JobCard;

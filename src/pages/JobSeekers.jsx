import React from 'react';

const JobSeekers = () => {
    return (
        <div className="container" style={{ paddingTop: '120px', paddingBottom: '60px', minHeight: 'calc(100vh - 80px)' }}>
            <div className="glass" style={{ padding: '3rem', borderRadius: 'var(--radius-lg)' }}>
                <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>For Job Seekers</h1>
                <p style={{ color: 'var(--text-secondary)' }}>Find your dream job faster. Tools and resources for job seekers coming soon.</p>
            </div>
        </div>
    );
};

export default JobSeekers;

import React from 'react';
import { Link } from 'react-router-dom';

const PostJobInfo = () => {
    return (
        <div className="container" style={{ paddingTop: '120px', paddingBottom: '60px', minHeight: 'calc(100vh - 80px)' }}>
            <div className="glass" style={{ padding: '3rem', borderRadius: 'var(--radius-lg)' }}>
                <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Post a Job</h1>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Reach millions of talented candidates today.</p>
                <Link to="/employer/dashboard" className="btn-primary">Go to Employer Dashboard</Link>
            </div>
        </div>
    );
};

export default PostJobInfo;

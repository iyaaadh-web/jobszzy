import React from 'react';

const Pricing = () => {
    return (
        <div className="container" style={{ paddingTop: '120px', paddingBottom: '60px', minHeight: 'calc(100vh - 80px)' }}>
            <div className="glass" style={{ padding: '3rem', borderRadius: 'var(--radius-lg)' }}>
                <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Pricing Plans</h1>
                <p style={{ color: 'var(--text-secondary)' }}>Simple, transparent pricing for teams of all sizes.</p>
            </div>
        </div>
    );
};

export default Pricing;

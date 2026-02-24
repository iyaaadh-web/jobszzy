import React from 'react';

const PrivacyPolicy = () => {
    return (
        <div className="container" style={{ paddingTop: '120px', paddingBottom: '60px', minHeight: 'calc(100vh - 80px)' }}>
            <div className="glass" style={{ padding: '3rem', borderRadius: 'var(--radius-lg)' }}>
                <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Privacy Policy</h1>
                <p style={{ color: 'var(--text-secondary)' }}>Your privacy is important to us. Read our detailed policy here.</p>
            </div>
        </div>
    );
};

export default PrivacyPolicy;

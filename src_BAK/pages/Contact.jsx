import React from 'react';

const Contact = () => {
    return (
        <div className="container" style={{ paddingTop: '120px', paddingBottom: '60px', minHeight: 'calc(100vh - 80px)' }}>
            <div className="glass animate-fade-in" style={{ padding: '3rem', borderRadius: 'var(--radius-lg)', textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
                <h1 style={{ fontSize: '2.5rem', marginBottom: '1.5rem', color: 'var(--primary)' }}>Contact Us</h1>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Have questions? Reach out to our team directly.</p>

                <div style={{ display: 'grid', gap: '2rem' }}>
                    <div className="contact-item">
                        <h3 style={{ marginBottom: '0.5rem' }}>📞 Phone</h3>
                        <a href="tel:9387414" style={{ fontSize: '1.5rem', color: 'var(--text-primary)', textDecoration: 'none' }}>9387414</a>
                    </div>

                    <div className="contact-item">
                        <h3 style={{ marginBottom: '0.5rem' }}>📧 Email</h3>
                        <a href="mailto:sales@fasmala.com" style={{ fontSize: '1.5rem', color: 'var(--text-primary)', textDecoration: 'none' }}>sales@fasmala.com</a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Contact;

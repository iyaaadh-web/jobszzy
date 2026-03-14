import React from 'react';

const PrivacyPolicy = () => {
    return (
        <div className="container" style={{ paddingTop: '120px', paddingBottom: '60px', minHeight: 'calc(100vh - 80px)' }}>
            <div className="glass" style={{ padding: '3rem', borderRadius: 'var(--radius-lg)' }}>
                <h1 style={{ fontSize: '2.5rem', marginBottom: '2rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>Privacy Policy</h1>

                <section style={{ marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--accent)' }}>1. Information We Collect</h2>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                        We collect information you provide directly to us, such as when you create an account, post a job, or apply for a position. This includes your name, email address, company details, CVs, and any other information you choose to provide.
                    </p>
                </section>

                <section style={{ marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--accent)' }}>2. How We Use Your Information</h2>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                        We use the information we collect to operate, maintain, and provide the features of the Jobszzy platform. This includes connecting job seekers with employers and facilitating the application process.
                    </p>
                </section>

                <section style={{ marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--accent)' }}>3. Sharing of Information</h2>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                        When you apply for a job, your profile information and CV are shared with the respective employer. We do not sell your personal information to third parties.
                    </p>
                </section>

                <section style={{ marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--accent)' }}>4. Security</h2>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                        We use industry-standard security measures to protect your information. However, no method of transmission over the Internet or electronic storage is 100% secure.
                    </p>
                </section>

                <section style={{ marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--accent)' }}>5. Contact Us</h2>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                        If you have any questions about this Privacy Policy, please contact us at support@jobszzy.com.
                    </p>
                </section>

                <p style={{ marginTop: '3rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Last Updated: March 2026</p>
            </div>
        </div>
    );
};

export default PrivacyPolicy;

import React from 'react';

const TermsOfService = () => {
    return (
        <div className="container" style={{ paddingTop: '120px', paddingBottom: '60px', minHeight: 'calc(100vh - 80px)' }}>
            <div className="glass" style={{ padding: '3rem', borderRadius: 'var(--radius-lg)' }}>
                <h1 style={{ fontSize: '2.5rem', marginBottom: '2rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>Terms of Service</h1>

                <section style={{ marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--accent)' }}>1. Acceptance of Terms</h2>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                        By accessing or using the Jobszzy platform, you agree to comply with and be bound by these Terms of Service. If you do not agree, please do not use our services.
                    </p>
                </section>

                <section style={{ marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--accent)' }}>2. User Responsibilities</h2>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                        You are responsible for maintaining the confidentiality of your account credentials. Job seekers guarantee that all information provided is accurate. Employers agree not to post false or misleading job advertisements.
                    </p>
                </section>

                <section style={{ marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--accent)' }}>3. Prohibited Conduct</h2>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                        You agree not to use Jobszzy to spam, harvest personal data, distribute malware, or engage in any unlawful activity.
                    </p>
                </section>

                <section style={{ marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--accent)' }}>4. Account Termination</h2>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                        We reserve the right to suspend or terminate accounts that violate these Terms, without prior notice or liability.
                    </p>
                </section>

                <section style={{ marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--accent)' }}>5. Contact Us</h2>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                        If you have any questions about these Terms, please contact us at support@jobszzy.com.
                    </p>
                </section>

                <p style={{ marginTop: '3rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Last Updated: March 2026</p>
            </div>
        </div>
    );
};

export default TermsOfService;

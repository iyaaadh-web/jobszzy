import React from 'react';

const AboutUs = () => {
    return (
        <div className="container" style={{ paddingTop: '120px', paddingBottom: '60px', minHeight: 'calc(100vh - 80px)' }}>
            <div className="glass animate-fade-in" style={{ padding: '3rem', borderRadius: 'var(--radius-lg)', maxWidth: '800px', margin: '0 auto' }}>
                <h1 style={{ fontSize: '2.5rem', marginBottom: '2rem', color: 'var(--primary)' }}>About Jobszzy Maldives</h1>

                <section style={{ marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>🧑💼 What Jobszzy Maldives Is</h2>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: '1.7', marginBottom: '1rem' }}>
                        Jobszzy is a premier job portal and online platform designed to bridge the gap between talented job seekers and visionary employers in the Maldives and beyond.
                    </p>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: '1.7' }}>
                        Our platform empowers employers to showcase opportunities and job seekers to discover their next career milestone with ease and transparency.
                    </p>
                </section>

                <section style={{ marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>🎯 Why It Was Created</h2>
                    <ul style={{ color: 'var(--text-secondary)', lineHeight: '1.7', paddingLeft: '1.5rem' }}>
                        <li><strong>Connect:</strong> To streamline the hiring process by bringing offline opportunities to a central digital hub.</li>
                        <li><strong>Simplify:</strong> To help employers reach the right candidates faster and more efficiently.</li>
                        <li><strong>Centralize:</strong> To provide a comprehensive view of the Maldives' dynamic job market, from tourism to hospitality and beyond.</li>
                    </ul>
                </section>

                <section>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>🛠 Our Purpose</h2>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: '1.7' }}>
                        In an era where the Maldives' service sectors are booming, we provide the tools needed for efficient recruitment. Jobszzy exists to make job hunting and hiring faster, fairer, and more accessible for everyone.
                    </p>
                </section>
            </div>
        </div>
    );
};

export default AboutUs;

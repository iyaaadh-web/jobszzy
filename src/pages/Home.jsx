import React from 'react';
import Hero from '../components/Hero';
import JobListings from '../components/JobListings';

const Home = () => {
    return (
        <main>
            <Hero />

            <section className="container" style={{ padding: '4rem 0' }}>
                <div className="glass" style={{ padding: '3rem', borderRadius: 'var(--radius-lg)' }}>
                    <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem', color: 'var(--primary)' }}>What Jobszzy Maldives Is</h2>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8', fontSize: '1.1rem' }}>
                        Jobszzy Maldives is your gateway to the best career opportunities in the Maldives.
                        Whether you are a job seeker looking for your dream role in tourism and hospitality,
                        or an employer seeking the perfect candidate, we provide the platform to connect you
                        efficiently and professionally.
                    </p>
                </div>
            </section>

            <JobListings />
        </main>
    );
};

export default Home;

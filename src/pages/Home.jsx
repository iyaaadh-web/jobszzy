import React from 'react';
import Hero from '../components/Hero';
import JobListings from '../components/JobListings';

const Home = () => {
    return (
        <main>
            <Hero />

            <section className="container home-intro-section">
                <div className="glass home-intro-card">
                    <h2>What Jobszzy Maldives Is</h2>
                    <p>
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

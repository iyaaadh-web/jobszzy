import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Hero.css';

const Hero = () => {
    const [title, setTitle] = React.useState('');
    const [location, setLocation] = React.useState('');
    const navigate = useNavigate();

    const handleSearch = () => {
        const params = new URLSearchParams();
        if (title) params.append('title', title);
        if (location) params.append('location', location);
        navigate(`/browse-jobs?${params.toString()}`);
    };

    return (
        <section className="hero container animate-fade-in">
            <div className="hero-content">
                <h1 className="hero-title">
                    Find your next <span className="highlight">dream job</span>
                </h1>
                <p className="hero-subtitle">
                    Discover thousands of job opportunities with all the information you need.
                    Its your future. Discover it.
                </p>

                <div className="search-box glass">
                    <div className="search-input-group">
                        <svg className="search-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                        <input
                            type="text"
                            placeholder="Job title, keyword, or company"
                            className="search-input"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                        />
                    </div>

                    <div className="search-divider"></div>

                    <div className="search-input-group">
                        <svg className="search-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                        <input
                            type="text"
                            placeholder="City, state, or zip code"
                            className="search-input"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                        />
                    </div>

                    <button className="btn-primary search-btn" onClick={handleSearch}>Search Jobs</button>
                </div>

                <div className="popular-searches">
                    <span>Popular:</span>
                    <a href="#" className="tag">Remote</a>
                    <a href="#" className="tag">Frontend Developer</a>
                    <a href="#" className="tag">Product Manager</a>
                    <a href="#" className="tag">Design</a>
                </div>
            </div>
        </section>
    );
};

export default Hero;

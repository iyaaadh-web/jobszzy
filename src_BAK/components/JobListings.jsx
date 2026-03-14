import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import JobCard from './JobCard';
import api from '../utils/api';
import './JobListings.css';

const JobListings = () => {
    const [allJobs, setAllJobs] = useState([]);
    const [filteredJobs, setFilteredJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All');
    const location = React.useMemo(() => window.location, []);
    const searchParams = new URLSearchParams(location.search);
    const query = searchParams.get('title') || '';
    const locQuery = searchParams.get('location') || '';

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                const res = await api.get('/jobs');
                setAllJobs(res.data);
                setFilteredJobs(res.data);
            } catch (err) {
                console.error("Failed to fetch jobs");
            } finally {
                setLoading(false);
            }
        };
        fetchJobs();
    }, []);

    useEffect(() => {
        let results = [...allJobs];

        if (filter !== 'All') {
            results = results.filter(job => job.type?.toLowerCase() === filter.toLowerCase() || job.title?.toLowerCase().includes(filter.toLowerCase()));
        }

        if (query) {
            const q = query.toLowerCase();
            results = results.filter(job =>
                job.title?.toLowerCase().includes(q) ||
                job.company?.toLowerCase().includes(q) ||
                job.description?.toLowerCase().includes(q)
            );
        }

        if (locQuery) {
            const l = locQuery.toLowerCase();
            results = results.filter(job => job.location?.toLowerCase().includes(l));
        }

        setFilteredJobs(results);
    }, [allJobs, filter, query, locQuery]);

    return (
        <section className="job-listings container" id="jobs">
            <div className="section-header">
                <h2 className="section-title">{query ? `Results for "${query}"` : 'Recommended Jobs'}</h2>
                <Link to="/browse-jobs" className="view-all">View all jobs <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg></Link>
            </div>

            <div className="filters">
                {['All', 'Engineering', 'Design', 'Marketing'].map(cat => (
                    <button
                        key={cat}
                        className={`filter-btn ${filter === cat ? 'active' : ''}`}
                        onClick={() => setFilter(cat)}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>Loading latest jobs...</div>
            ) : filteredJobs.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                    {query ? `No jobs found matching "${query}"` : "No jobs posted yet. Be the first!"}
                </div>
            ) : (
                <div className="jobs-grid">
                    {filteredJobs.map((job, index) => (
                        <Link to={`/jobs/${job.id}`} key={job.id} className="animate-fade-in" style={{ animationDelay: `${(index % 6) * 0.1}s`, display: 'block' }}>
                            <JobCard job={job} />
                        </Link>
                    ))}
                </div>
            )}
        </section>
    );
};

export default JobListings;

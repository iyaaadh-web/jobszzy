import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import './Dashboard.css';

const InternshipPortal = () => {
    const [internships, setInternships] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchInternships = async () => {
            try {
                const res = await api.get('/jobs?category=internship');
                setInternships(Array.isArray(res.data) ? res.data : []);
            } catch (err) {
                console.error('Failed to fetch internships');
            } finally {
                setLoading(false);
            }
        };
        fetchInternships();
    }, []);

    const filtered = internships.filter(job =>
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.location.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="container" style={{ paddingTop: '120px', paddingBottom: '60px', minHeight: '100vh' }}>
            {/* Hero Section */}
            <div className="internship-hero glass" style={{ textAlign: 'center', padding: '3rem 2rem', borderRadius: 'var(--radius-lg)', marginBottom: '2rem' }}>
                <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>🎓</div>
                <h1 style={{ fontSize: '2.25rem', fontWeight: '700', marginBottom: '0.75rem' }}>
                    Internship Portal
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto 1.5rem' }}>
                    Discover hospitality internships and student placements across the Maldives. Kickstart your career today.
                </p>
                <div style={{ maxWidth: '500px', margin: '0 auto' }}>
                    <input
                        type="text"
                        placeholder="Search internships by title, company, or location..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '0.9rem 1.25rem',
                            borderRadius: 'var(--radius-full)',
                            border: '1px solid var(--card-border)',
                            background: 'rgba(255,255,255,0.05)',
                            color: 'white',
                            fontSize: '1rem',
                            outline: 'none'
                        }}
                    />
                </div>
            </div>

            {/* Quick Info Badges */}
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem', justifyContent: 'center' }}>
                <span className="glass" style={{ padding: '0.5rem 1.25rem', borderRadius: 'var(--radius-full)', fontSize: '0.85rem', color: '#8b5cf6' }}>
                    🏨 Hospitality Placements
                </span>
                <span className="glass" style={{ padding: '0.5rem 1.25rem', borderRadius: 'var(--radius-full)', fontSize: '0.85rem', color: '#3b82f6' }}>
                    📚 Student Programs
                </span>
                <span className="glass" style={{ padding: '0.5rem 1.25rem', borderRadius: 'var(--radius-full)', fontSize: '0.85rem', color: '#10b981' }}>
                    🌴 Resort Internships
                </span>
            </div>

            {/* Results */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>Loading internships...</div>
            ) : filtered.length === 0 ? (
                <div className="glass" style={{ textAlign: 'center', padding: '3rem', borderRadius: 'var(--radius-lg)' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📋</div>
                    <h3>No Internships Found</h3>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                        {searchTerm ? 'Try a different search term.' : 'No internship postings are available right now. Check back soon!'}
                    </p>
                </div>
            ) : (
                <div className="internship-grid">
                    {filtered.map(job => (
                        <Link to={`/jobs/${job.id}`} key={job.id} className="internship-card glass card-hover" style={{ textDecoration: 'none', color: 'inherit' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                                <div>
                                    {job.logo_url ? (
                                        <img
                                            src={`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}${job.logo_url}`}
                                            alt={job.company}
                                            style={{ width: '44px', height: '44px', borderRadius: '10px', objectFit: 'cover', marginBottom: '0.5rem' }}
                                        />
                                    ) : (
                                        <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: job.color || '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: '700', color: 'white', marginBottom: '0.5rem' }}>
                                            {job.company.charAt(0)}
                                        </div>
                                    )}
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    {job.is_urgent ? <span className="urgent-badge-sm">Urgent</span> : null}
                                    <span style={{ padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-full)', background: 'rgba(139, 92, 246, 0.15)', color: '#8b5cf6', fontSize: '0.7rem', fontWeight: '600' }}>
                                        INTERNSHIP
                                    </span>
                                </div>
                            </div>
                            <h3 style={{ fontSize: '1.05rem', fontWeight: '600', marginBottom: '0.25rem' }}>{job.title}</h3>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>{job.company}</p>
                            <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                <span>📍 {job.location}</span>
                                <span>💼 {job.type}</span>
                            </div>
                            {job.salary && (
                                <div style={{ marginTop: '0.75rem', fontSize: '0.9rem', fontWeight: '600', color: '#10b981' }}>
                                    {job.salary}
                                </div>
                            )}
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};

export default InternshipPortal;

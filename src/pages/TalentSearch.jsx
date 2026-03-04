import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';

const TalentSearch = () => {
    const { user, loading: authLoading } = useContext(AuthContext);
    const [talent, setTalent] = useState([]);
    const [filteredTalent, setFilteredTalent] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (authLoading) return;
        const fetchTalent = async () => {
            try {
                const res = await api.get('/auth/talent');
                setTalent(res.data);
                setFilteredTalent(res.data);
            } catch (err) {
                if (err.response && err.response.status === 403) {
                    setError('Access Denied: Only employers and admins can access the Talent Pool.');
                } else {
                    setError('Failed to load talent pool.');
                }
            } finally {
                setLoading(false);
            }
        };

        if (user && (user.role === 'employer' || user.role === 'admin')) {
            fetchTalent();
        } else {
            setLoading(false);
            setError('Access Denied: Only employers and admins can access the Talent Pool.');
        }
    }, [user]);

    if (!user) {
        return (
            <div className="container" style={{ paddingTop: '120px', minHeight: 'calc(100vh - 80px)', textAlign: 'center' }}>
                <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Talent Pool</h1>
                <p style={{ color: 'var(--text-secondary)' }}>Please <strong>Log In</strong> as an Employer to search for talent.</p>
            </div>
        );
    }

    return (
        <div className="container" style={{ paddingTop: '100px', paddingBottom: '60px', minHeight: 'calc(100vh - 80px)' }}>
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Talent Pool</h1>
                <p style={{ color: 'var(--text-secondary)' }}>Search our database of verified professionals.</p>
                <div style={{ marginTop: '2rem', maxWidth: '600px', margin: '2rem auto 0 auto' }}>
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        style={{ width: '100%', padding: '1rem', borderRadius: 'var(--radius-md)', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', color: 'white' }}
                        onChange={(e) => {
                            const term = e.target.value.toLowerCase();
                            const filtered = talent.filter(p => p.name.toLowerCase().includes(term) || p.email.toLowerCase().includes(term));
                            setFilteredTalent(filtered);
                        }}
                    />
                </div>
            </div>

            {error && (
                <div className="alert error" style={{ maxWidth: '600px', margin: '0 auto 2rem auto', textAlign: 'center' }}>
                    {error}
                </div>
            )}

            {!error && loading ? (
                <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>Loading talent pool...</div>
            ) : !error && (
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1.5rem',
                    maxWidth: '800px',
                    margin: '0 auto'
                }}>
                    {filteredTalent.length === 0 ? (
                        <div className="glass" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)', borderRadius: 'var(--radius-lg)' }}>
                            No job seekers found matching your search.
                        </div>
                    ) : (
                        filteredTalent.map(person => (
                            <div key={person.id} className="glass card-hover" style={{
                                padding: '1.5rem 2rem',
                                borderRadius: 'var(--radius-lg)',
                                display: 'flex',
                                flexWrap: 'wrap',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: '1rem'
                            }}>
                                <div>
                                    <h3 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>{person.name}</h3>
                                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>{person.email}</p>

                                    {person.bio && (
                                        <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '0.75rem', maxWidth: '500px' }}>
                                            {person.bio}
                                        </p>
                                    )}

                                    {person.skills && (
                                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                                            {person.skills.split(',').map((skill, i) => (
                                                <span key={i} className="badge" style={{ fontSize: '0.7rem', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '0.2rem 0.6rem', borderRadius: '10px' }}>
                                                    {skill.trim()}
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    <span className="badge badge-seeker" style={{ background: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa' }}>Job Seeker</span>
                                </div>
                                <div>
                                    {person.cv_url ? (
                                        <a href={person.cv_url} target="_blank" rel="noopener noreferrer" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                                            View Resume
                                        </a>
                                    ) : (
                                        <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontStyle: 'italic' }}>No Resume Attached</span>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default TalentSearch;

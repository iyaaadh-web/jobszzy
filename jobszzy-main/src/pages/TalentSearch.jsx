import React, { useState, useEffect, useContext, useMemo } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import './Dashboard.css';

// Using inline lucide icons as replacements since we only have the base library
const SearchIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
);

const MailIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
);

const FileIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
);

const TalentSearch = () => {
    const { user, loading: authLoading } = useContext(AuthContext);
    const [talent, setTalent] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    // Filtering States
    const [searchTerm, setSearchTerm] = useState('');
    const [showOnlyAvailable, setShowOnlyAvailable] = useState(false);
    const [showOnlyWithResume, setShowOnlyWithResume] = useState(false);

    useEffect(() => {
        if (authLoading) return;
        const fetchTalent = async () => {
            try {
                const res = await api.get('/auth/talent');
                setTalent(res.data);
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
            setError('Access Denied: Please log in as an Employer to access the Talent Pool.');
        }
    }, [user, authLoading]);

    // Enhanced Filtering Logic
    const filteredTalent = useMemo(() => {
        return talent.filter(p => {
            const matchesSearch = 
                p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (p.bio && p.bio.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (p.skills && p.skills.toLowerCase().includes(searchTerm.toLowerCase()));
            
            const matchesAvailable = !showOnlyAvailable || p.available_immediately === 1;
            const matchesResume = !showOnlyWithResume || !!p.cv_url;

            return matchesSearch && matchesAvailable && matchesResume;
        });
    }, [talent, searchTerm, showOnlyAvailable, showOnlyWithResume]);

    const getInitials = (name) => {
        return name ? name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : '??';
    };

    if (authLoading) return <div className="container" style={{paddingTop: '120px', textAlign: 'center'}}>Loading...</div>;

    if (!user || (user.role !== 'employer' && user.role !== 'admin')) {
        return (
            <div className="container" style={{ paddingTop: '150px', minHeight: 'calc(100vh - 80px)', textAlign: 'center' }}>
                <div className="glass" style={{padding: '3rem', borderRadius: 'var(--radius-lg)', maxWidth: '600px', margin: '0 auto'}}>
                    <h1 style={{ fontSize: '2.5rem', marginBottom: '1.5rem' }}>Talent Pool</h1>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                        Our exclusive database of hospitality professionals is only available to registered employers.
                    </p>
                    <a href="/login" className="btn-primary" style={{display: 'inline-block'}}>Log In as Employer</a>
                </div>
            </div>
        );
    }

    return (
        <div className="container dashboard-container animate-fade-in">
            {/* HERO SECTION */}
            <header className="talent-search-hero">
                <h1>Find Top Talent</h1>
                <p>Browse through Maldives' most qualified hospitality professionals</p>
                
                <div className="search-box-wrapper">
                    <div className="search-icon-inside">
                        <SearchIcon />
                    </div>
                    <input
                        type="text"
                        className="search-input-premium"
                        placeholder="Search by name, skills, or experience..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </header>

            {/* FILTER BARBT */}
            <div className="filter-bar-premium">
                <div 
                    className={`filter-toggle-premium ${showOnlyAvailable ? 'active' : ''}`}
                    onClick={() => setShowOnlyAvailable(!showOnlyAvailable)}
                >
                    <div className={showOnlyAvailable ? 'pulse-dot' : ''} style={{width: 8, height: 8, background: '#10b981', borderRadius: '50%'}}></div>
                    Available Immediately
                </div>
                <div 
                    className={`filter-toggle-premium ${showOnlyWithResume ? 'active' : ''}`}
                    onClick={() => setShowOnlyWithResume(!showOnlyWithResume)}
                >
                    <FileIcon />
                    Has Resume
                </div>
                {(searchTerm || showOnlyAvailable || showOnlyWithResume) && (
                    <button className="clear-filters-btn" onClick={() => {
                        setSearchTerm('');
                        setShowOnlyAvailable(false);
                        setShowOnlyWithResume(false);
                    }}>
                        Clear All Filters
                    </button>
                )}
            </div>

            {error && (
                <div className="alert-error" style={{ maxWidth: '600px', margin: '0 auto 2rem auto', textAlign: 'center' }}>
                    {error}
                </div>
            )}

            {!error && loading ? (
                <div style={{ textAlign: 'center', padding: '4rem' }}>
                    <div className="loading-spinner" style={{marginBottom: '1rem'}}></div>
                    <p style={{color: 'var(--text-secondary)'}}>Scanning database...</p>
                </div>
            ) : !error && (
                <div className="talent-grid-premium">
                    {filteredTalent.length === 0 ? (
                        <div className="no-results-premium">
                            <h3 style={{fontSize: '1.5rem', marginBottom: '0.5rem', color: 'var(--text-primary)'}}>No talent found</h3>
                            <p style={{color: 'var(--text-secondary)'}}>Try adjusting your search terms or filters to see more results.</p>
                            <button className="btn-secondary" style={{marginTop: '1.5rem'}} onClick={() => {
                                setSearchTerm('');
                                setShowOnlyAvailable(false);
                                setShowOnlyWithResume(false);
                            }}>
                                Show All Talent
                            </button>
                        </div>
                    ) : (
                        filteredTalent.map(person => (
                            <div key={person.id} className="glass talent-card-premium">
                                {person.available_immediately === 1 && (
                                    <div className="available-pulse-badge">
                                        <div className="pulse-dot"></div>
                                        Available
                                    </div>
                                )}
                                
                                <div className="talent-avatar-wrapper">
                                    <div className="talent-avatar-circle">
                                        {getInitials(person.name)}
                                    </div>
                                    <div>
                                        <h3 className="talent-name-premium">{person.name}</h3>
                                        <p className="talent-email-premium">{person.email}</p>
                                    </div>
                                </div>

                                <p className="talent-bio-premium">
                                    {person.bio || "No professional bio provided yet."}
                                </p>

                                {person.skills && (
                                    <div className="talent-skills-wrapper">
                                        {person.skills.split(',').map((skill, i) => (
                                            <span key={i} className="skill-tag-premium">
                                                {skill.trim()}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                <div className="talent-actions-premium">
                                    {person.cv_url ? (
                                        <a href={person.cv_url} target="_blank" rel="noopener noreferrer" className="btn-primary" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.6rem' }}>
                                            <FileIcon />
                                            View Resume
                                        </a>
                                    ) : (
                                        <button className="btn-secondary" disabled style={{ flex: 1, opacity: 0.5, cursor: 'not-allowed', padding: '0.6rem' }}>
                                            No Resume
                                        </button>
                                    )}
                                    <a href={`mailto:${person.email}`} className="btn-secondary" style={{ padding: '0.6rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Contact Talent">
                                        <MailIcon />
                                    </a>
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

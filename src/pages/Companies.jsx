import React, { useState, useEffect } from 'react';
import api from '../utils/api';

const Companies = () => {
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCompanies = async () => {
            try {
                const res = await api.get('/auth/companies');
                setCompanies(res.data);
            } catch (err) {
                console.error("Failed to fetch companies", err);
            } finally {
                setLoading(false);
            }
        };
        fetchCompanies();
    }, []);

    return (
        <div className="container" style={{ paddingTop: '100px', paddingBottom: '60px', minHeight: 'calc(100vh - 80px)' }}>
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Top Companies</h1>
                <p style={{ color: 'var(--text-secondary)' }}>Discover great places to work and companies hiring right now.</p>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>Loading companies...</div>
            ) : (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                    gap: '2rem'
                }}>
                    {companies.length === 0 ? (
                        <div style={{ gridColumn: '1 / -1', textAlign: 'center', color: 'var(--text-secondary)' }}>No companies found.</div>
                    ) : (
                        companies.map(company => (
                            <div key={company.id} className="glass card-hover" style={{
                                padding: '2rem',
                                borderRadius: 'var(--radius-lg)',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                textAlign: 'center'
                            }}>
                                <div style={{
                                    width: '80px',
                                    height: '80px',
                                    borderRadius: '50%',
                                    background: 'var(--bg-lighter)',
                                    marginBottom: '1rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    overflow: 'hidden'
                                }}>
                                    {company.logo_url ? (
                                        <img src={company.logo_url} alt={`${company.name} logo`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <span style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--text-secondary)' }}>{company.name.charAt(0).toUpperCase()}</span>
                                    )}
                                </div>
                                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{company.name}</h3>
                                {company.bio && (
                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>
                                        {company.bio}
                                    </p>
                                )}
                                <div style={{ marginTop: 'auto', paddingTop: '1rem' }}>
                                    <span className="badge">Employer</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default Companies;

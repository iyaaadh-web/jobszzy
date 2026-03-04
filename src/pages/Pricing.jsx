import React, { useState, useEffect } from 'react';
import api from '../utils/api';

const Pricing = () => {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPricing = async () => {
            try {
                const res = await api.get('/admin/settings/pricing_plans');
                setPlans(res.data || []);
            } catch (err) {
                console.error("Failed to fetch plans");
            } finally {
                setLoading(false);
            }
        };
        fetchPricing();
    }, []);

    return (
        <div className="container" style={{ paddingTop: '120px', paddingBottom: '60px', minHeight: 'calc(100vh - 80px)' }}>
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Pricing Plans</h1>
                <p style={{ color: 'var(--text-secondary)' }}>Simple, transparent pricing for teams of all sizes.</p>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>Loading plans...</div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                    {plans.map(plan => (
                        <div key={plan.id} className="glass card-hover" style={{ padding: '2.5rem', borderRadius: 'var(--radius-lg)', textAlign: 'center', display: 'flex', flexDirection: 'column' }}>
                            <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>{plan.name}</h3>
                            <div style={{ marginBottom: '2rem' }}>
                                <span style={{ fontSize: '3rem', fontWeight: '800' }}>${plan.price}</span>
                                <span style={{ color: 'var(--text-secondary)' }}>/month</span>
                            </div>
                            <ul style={{ listStyle: 'none', padding: 0, marginBottom: '2rem', textAlign: 'left', flex: 1 }}>
                                {plan.features.map((feature, idx) => (
                                    <li key={idx} style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                            <button className="btn-primary" style={{ width: '100%' }}>Choose {plan.name}</button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Pricing;

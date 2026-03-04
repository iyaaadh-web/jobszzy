import React, { useState, useEffect, useContext } from 'react';
import api from '../utils/api';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Pricing = () => {
    const { user, setUser } = useContext(AuthContext);
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchPricing = async () => {
            try {
                const res = await api.get('/public/settings/pricing_plans');
                setPlans(res.data || []);
            } catch (err) {
                console.error("Failed to fetch plans");
            } finally {
                setLoading(false);
            }
        };
        fetchPricing();
    }, []);

    const handleChoosePlan = async (planId) => {
        if (!user) {
            navigate('/login');
            return;
        }

        setSubmitting(true);
        setMessage(null);
        try {
            const res = await api.post('/auth/subscribe', { plan_id: planId });
            setMessage({ type: 'success', text: res.data.message });

            // Update local user state
            const updatedUser = { ...user, plan_id: planId, subscription_status: res.data.status };
            setUser(updatedUser);

            if (res.data.status === 'pending') {
                setTimeout(() => navigate('/employer/dashboard'), 2000);
            } else if (res.data.status === 'active') {
                setTimeout(() => navigate('/employer/dashboard'), 1500);
            }
        } catch (err) {
            console.error('Plan selection error:', err);
            const errorMsg = err.response?.data?.error || err.message || 'Failed to select plan';
            const details = err.response?.data?.details ? ` - ${err.response.data.details}` : '';
            setMessage({ type: 'error', text: errorMsg + details });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="container" style={{ paddingTop: '120px', paddingBottom: '60px', minHeight: 'calc(100vh - 80px)' }}>
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Pricing Plans</h1>
                <p style={{ color: 'var(--text-secondary)' }}>Simple, transparent pricing for teams of all sizes.</p>
                {message && (
                    <div className={`alert ${message.type}`} style={{ maxWidth: '600px', margin: '1rem auto' }}>
                        {message.text}
                    </div>
                )}
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>Loading plans...</div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                    {Array.isArray(plans) && plans.map(plan => (
                        <div key={plan.id} className="glass card-hover" style={{ padding: '2.5rem', borderRadius: 'var(--radius-lg)', textAlign: 'center', display: 'flex', flexDirection: 'column' }}>
                            <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>{plan.name}</h3>
                            <div style={{ marginBottom: '2rem' }}>
                                <span style={{ fontSize: '3rem', fontWeight: '800' }}>
                                    {String(plan.price) === '0' ? 'Free' : plan.price}
                                </span>
                                {String(plan.price) !== '0' && (
                                    <span style={{ color: 'var(--text-secondary)', marginLeft: '0.25rem' }}>MVR /month</span>
                                )}
                            </div>
                            <ul style={{ listStyle: 'none', padding: 0, marginBottom: '2rem', textAlign: 'left', flex: 1 }}>
                                {Array.isArray(plan.features) && plan.features.map((feature, idx) => (
                                    <li key={idx} style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                            <button
                                className="btn-primary"
                                style={{ width: '100%' }}
                                onClick={() => handleChoosePlan(plan.id)}
                                disabled={submitting || (user?.plan_id === plan.id && user?.subscription_status === 'active')}
                            >
                                {user?.plan_id === plan.id ?
                                    (user.subscription_status === 'active' ? 'Current Plan' : 'Pending Approval')
                                    : `Choose ${plan.name}`}
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Pricing;

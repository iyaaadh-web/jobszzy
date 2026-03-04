import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { AuthContext } from '../context/AuthContext';

const Checkout = () => {
    const { planId } = useParams();
    const { user, setUser } = useContext(AuthContext);
    const navigate = useNavigate();

    const [plan, setPlan] = useState(null);
    const [loading, setLoading] = useState(true);
    const [file, setFile] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState(null);

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        const fetchPlan = async () => {
            try {
                const res = await api.get('/public/settings/pricing_plans');
                const selectedPlan = res.data.find(p => String(p.id) === String(planId));
                if (!selectedPlan) {
                    navigate('/pricing');
                    return;
                }
                setPlan(selectedPlan);
            } catch (err) {
                console.error("Failed to fetch plan");
            } finally {
                setLoading(false);
            }
        };
        fetchPlan();
    }, [planId, user, navigate]);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) {
            setMessage({ type: 'error', text: 'Please upload your payment slip' });
            return;
        }

        setSubmitting(true);
        setMessage(null);

        const formData = new FormData();
        formData.append('slip', file);
        formData.append('plan_id', planId);

        try {
            // Step 1: Subscribe the user to the plan (sets status to pending)
            await api.post('/auth/subscribe', { plan_id: planId });

            // Step 2: Upload the payment slip
            const res = await api.post('/auth/confirm-payment', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setMessage({ type: 'success', text: res.data.message });

            // Update local user state
            setUser({ ...user, plan_id: planId, subscription_status: 'pending' });

            setTimeout(() => navigate('/employer/dashboard'), 3000);
        } catch (err) {
            console.error('Checkout error:', err);
            setMessage({ type: 'error', text: err.response?.data?.error || 'Failed to submit payment slip' });
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="container" style={{ paddingTop: '120px' }}>Loading checkout...</div>;

    return (
        <div className="container" style={{ paddingTop: '120px', paddingBottom: '60px', minHeight: 'calc(100vh - 80px)' }}>
            <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                <div className="glass card-hover" style={{ padding: '3rem', borderRadius: 'var(--radius-lg)' }}>
                    <h2 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>Checkout: {plan.name}</h2>

                    <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: 'var(--radius-md)', marginBottom: '2rem' }}>
                        <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--accent-color)' }}>Bank Transfer Instructions</h3>
                        <p style={{ marginBottom: '0.5rem' }}>Please transfer <strong>MVR {plan.price}</strong> to the following account:</p>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                            <p><strong>Bank:</strong> BML (Bank of Maldives)</p>
                            <p><strong>Account Name:</strong> Fasmala Consultancy Service</p>
                            <p><strong>Account Number:</strong> 7730000702588</p>
                        </div>
                    </div>

                    {message && (
                        <div className={`alert ${message.type}`} style={{ marginBottom: '1.5rem' }}>
                            {message.text}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="form-group" style={{ marginBottom: '2rem' }}>
                            <label style={{ display: 'block', marginBottom: '1rem' }}>Upload Payment Slip (Image or PDF)</label>
                            <div className="file-input-wrapper glass-hover" style={{
                                border: '2px dashed var(--card-border)',
                                padding: '2rem',
                                textAlign: 'center',
                                borderRadius: 'var(--radius-md)',
                                cursor: 'pointer'
                            }}>
                                <input
                                    type="file"
                                    onChange={handleFileChange}
                                    accept="image/*,application/pdf"
                                    id="slip-upload"
                                    style={{ display: 'none' }}
                                />
                                <label htmlFor="slip-upload" style={{ cursor: 'pointer' }}>
                                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📄</div>
                                    <p style={{ margin: 0 }}>{file ? file.name : 'Click to select or drag and drop your slip'}</p>
                                </label>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="btn-primary"
                            style={{ width: '100%', padding: '1rem' }}
                            disabled={submitting}
                        >
                            {submitting ? 'Submitting...' : 'Submit Subscriptions for Approval'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Checkout;

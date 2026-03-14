import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import './Dashboard.css';

const EmployerReviews = () => {
    const { user } = useContext(AuthContext);
    const [employers, setEmployers] = useState([]);
    const [selectedEmployer, setSelectedEmployer] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loadingReviews, setLoadingReviews] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Rating state
    const [management, setManagement] = useState(3);
    const [food, setFood] = useState(3);
    const [accommodation, setAccommodation] = useState(3);
    const [fairness, setFairness] = useState(3);
    const [opportunities, setOpportunities] = useState(3);
    const [comment, setComment] = useState('');

    useEffect(() => {
        const fetchEmployers = async () => {
            try {
                const res = await api.get('/auth/companies');
                setEmployers(Array.isArray(res.data) ? res.data : []);
            } catch (err) {
                console.error('Failed to fetch employers');
            }
        };
        fetchEmployers();
    }, []);

    const handleSelectEmployer = async (employer) => {
        setSelectedEmployer(employer);
        setSubmitted(false);
        setLoadingReviews(true);
        try {
            const res = await api.get(`/reviews/${employer.id}`);
            setReviews(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            setReviews([]);
        } finally {
            setLoadingReviews(false);
        }
    };

    const handleSubmitReview = async (e) => {
        e.preventDefault();
        if (!user) {
            alert('You must be logged in to submit a review.');
            return;
        }
        setSubmitting(true);
        try {
            await api.post('/reviews', {
                employer_id: selectedEmployer.id,
                management, food, accommodation, fairness, opportunities, comment
            });
            setSubmitted(true);
            setComment('');
            setManagement(3); setFood(3); setAccommodation(3); setFairness(3); setOpportunities(3);
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to submit review');
        } finally {
            setSubmitting(false);
        }
    };

    const StarRating = ({ value, onChange, label }) => (
        <div className="star-rating-row">
            <span className="star-label">{label}</span>
            <div className="star-input">
                {[1, 2, 3, 4, 5].map(star => (
                    <span
                        key={star}
                        onClick={() => onChange(star)}
                        className={`star-btn ${star <= value ? 'active' : ''}`}
                    >
                        ★
                    </span>
                ))}
            </div>
        </div>
    );

    const renderAvgStars = (rating) => {
        const rounded = Math.round(rating);
        return <span style={{ color: '#f59e0b' }}>{'★'.repeat(rounded)}{'☆'.repeat(5 - rounded)}</span>;
    };

    const filteredEmployers = employers.filter(emp =>
        emp.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="container" style={{ paddingTop: '120px', paddingBottom: '60px', minHeight: '100vh' }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2.25rem', fontWeight: '700', marginBottom: '0.5rem' }}>Employer Reviews</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem' }}>
                    Anonymous ratings from staff — management, food, accommodation & more
                </p>
            </div>

            {!selectedEmployer ? (
                <>
                    <div style={{ maxWidth: '500px', margin: '0 auto 2rem' }}>
                        <input
                            type="text"
                            placeholder="Search employers..."
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

                    {filteredEmployers.length === 0 ? (
                        <div className="glass" style={{ textAlign: 'center', padding: '3rem', borderRadius: 'var(--radius-lg)' }}>
                            <p style={{ color: 'var(--text-secondary)' }}>No employers found.</p>
                        </div>
                    ) : (
                        <div className="employer-grid">
                            {filteredEmployers.map(emp => (
                                <div
                                    key={emp.id}
                                    className="glass card-hover employer-card"
                                    onClick={() => handleSelectEmployer(emp)}
                                >
                                    {emp.logo_url ? (
                                        <img
                                            src={`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}${emp.logo_url}`}
                                            alt={emp.name}
                                            style={{ width: '56px', height: '56px', borderRadius: '12px', objectFit: 'cover', marginBottom: '0.75rem' }}
                                        />
                                    ) : (
                                        <div style={{ width: '56px', height: '56px', borderRadius: '12px', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: '700', color: 'white', marginBottom: '0.75rem' }}>
                                            {emp.name.charAt(0)}
                                        </div>
                                    )}
                                    <h3 style={{ fontSize: '1.05rem', fontWeight: '600', marginBottom: '0.25rem' }}>{emp.name}</h3>
                                    {emp.bio && <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>{emp.bio.substring(0, 80)}{emp.bio.length > 80 ? '...' : ''}</p>}
                                    <span style={{ color: '#3b82f6', fontSize: '0.8rem', marginTop: '0.75rem', display: 'inline-block' }}>View Reviews →</span>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            ) : (
                <div>
                    <button
                        onClick={() => { setSelectedEmployer(null); setReviews([]); }}
                        style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', fontSize: '0.95rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                        ← Back to all employers
                    </button>

                    <div className="glass" style={{ padding: '2rem', borderRadius: 'var(--radius-lg)', marginBottom: '2rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                            {selectedEmployer.logo_url ? (
                                <img
                                    src={`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}${selectedEmployer.logo_url}`}
                                    alt={selectedEmployer.name}
                                    style={{ width: '56px', height: '56px', borderRadius: '12px', objectFit: 'cover' }}
                                />
                            ) : (
                                <div style={{ width: '56px', height: '56px', borderRadius: '12px', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: '700', color: 'white' }}>
                                    {selectedEmployer.name.charAt(0)}
                                </div>
                            )}
                            <div>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: '700' }}>{selectedEmployer.name}</h2>
                                {selectedEmployer.bio && <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{selectedEmployer.bio}</p>}
                            </div>
                        </div>

                        {/* Submit Review Form */}
                        {user && user.role === 'seeker' && !submitted && (
                            <form onSubmit={handleSubmitReview} className="review-form glass" style={{ padding: '1.5rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }}>
                                <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>Submit Anonymous Review</h3>
                                <StarRating value={management} onChange={setManagement} label="Management" />
                                <StarRating value={food} onChange={setFood} label="Food Quality" />
                                <StarRating value={accommodation} onChange={setAccommodation} label="Accommodation" />
                                <StarRating value={fairness} onChange={setFairness} label="Fairness" />
                                <StarRating value={opportunities} onChange={setOpportunities} label="Opportunities" />
                                <div className="form-group" style={{ marginTop: '1rem' }}>
                                    <label>Comment (optional)</label>
                                    <textarea
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        placeholder="Share your experience..."
                                        rows="3"
                                        style={{ width: '100%', background: 'rgba(255,255,255,0.05)', borderRadius: 'var(--radius-md)', padding: '0.75rem', border: '1px solid var(--card-border)', color: 'white', resize: 'vertical' }}
                                    />
                                </div>
                                <button type="submit" className="btn-primary" disabled={submitting} style={{ marginTop: '0.5rem' }}>
                                    {submitting ? 'Submitting...' : 'Submit Review'}
                                </button>
                            </form>
                        )}

                        {submitted && (
                            <div style={{ padding: '1rem 1.25rem', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: 'var(--radius-md)', color: '#10b981', marginBottom: '1.5rem' }}>
                                ✓ Your review has been submitted and is pending moderation. Thank you!
                            </div>
                        )}

                        {/* Approved Reviews */}
                        <h3 style={{ marginBottom: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--card-border)' }}>Approved Reviews</h3>
                        {loadingReviews ? (
                            <p style={{ color: 'var(--text-secondary)' }}>Loading reviews...</p>
                        ) : reviews.length === 0 ? (
                            <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>No approved reviews yet. Be the first to review!</p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {reviews.map((review, idx) => (
                                    <div key={idx} className="glass" style={{ padding: '1.25rem', borderRadius: 'var(--radius-md)' }}>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                                            {new Date(review.created_at).toLocaleDateString()}
                                        </div>
                                        <div className="review-ratings-grid">
                                            <span>Management: {renderAvgStars(review.management_rating)}</span>
                                            <span>Food: {renderAvgStars(review.food_rating)}</span>
                                            <span>Accommodation: {renderAvgStars(review.accommodation_rating)}</span>
                                            <span>Fairness: {renderAvgStars(review.fairness_rating)}</span>
                                            <span>Opportunities: {renderAvgStars(review.opportunities_rating)}</span>
                                        </div>
                                        {review.comment && (
                                            <p style={{ marginTop: '0.75rem', fontStyle: 'italic', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>"{review.comment}"</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default EmployerReviews;

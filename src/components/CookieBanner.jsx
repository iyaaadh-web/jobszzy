import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const CookieBanner = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Check if user has already accepted/declined cookies
        const cookieConsent = localStorage.getItem('jobszzy_cookie_consent');
        if (!cookieConsent) {
            setIsVisible(true);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem('jobszzy_cookie_consent', 'accepted');
        setIsVisible(false);
    };

    const handleDecline = () => {
        localStorage.setItem('jobszzy_cookie_consent', 'declined');
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className="cookie-banner glass" style={{
            position: 'fixed',
            bottom: '20px',
            left: '20px',
            right: '20px',
            zIndex: 9999,
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '15px',
            boxShadow: '0 -4px 10px rgba(0,0,0,0.1)'
        }}>
            <div className="cookie-content">
                <h4>We value your privacy</h4>
                <p style={{ fontSize: '0.9rem', margin: '5px 0 0 0' }}>
                    We use cookies to enhance your browsing experience, serve personalized ads or content, and analyze our traffic. By clicking &quot;Accept All&quot;, you consent to our use of cookies. Read our <Link to="/privacy">Privacy Policy</Link> for more information.
                </p>
            </div>
            <div className="cookie-actions" style={{ display: 'flex', gap: '10px', alignSelf: 'flex-start' }}>
                <button onClick={handleAccept} className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.9rem' }}>Accept All</button>
                <button onClick={handleDecline} className="btn-secondary" style={{ padding: '8px 16px', fontSize: '0.9rem' }}>Decline</button>
            </div>
        </div>
    );
};

export default CookieBanner;

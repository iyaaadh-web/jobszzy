const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_for_local_dev';

const verifyToken = (req, res, next) => {
    const token = req.header('Authorization');
    if (!token) return res.status(401).json({ error: 'Access denied. No token provided.' });

    try {
        const verified = jwt.verify(token.replace('Bearer ', ''), JWT_SECRET);
        req.user = verified;
        next();
    } catch (err) {
        res.status(400).json({ error: 'Invalid token.' });
    }
};

const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ error: 'Access denied. Admin role required.' });
    }
};

const isEmployerOrAdmin = (req, res, next) => {
    if (req.user && (req.user.role === 'employer' || req.user.role === 'admin')) {
        next();
    } else {
        res.status(403).json({ error: 'Access denied. Employer role required.' });
    }
};

module.exports = { verifyToken, isAdmin, isEmployerOrAdmin, JWT_SECRET };

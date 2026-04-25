// ========================
// JWT Authentication Middleware
// ========================
const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Acceso denegado. Token no proporcionado.' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Token inválido o expirado.' });
    }
}

// Optional auth - attaches user if token exists but doesn't block
function optionalAuth(req, res, next) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        try {
            const token = authHeader.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded;
        } catch (err) {
            // Token invalid, continue without user
        }
    }
    next();
}

// Only allow landlords (arrendadores)
function arrendadorOnly(req, res, next) {
    if (!req.user || req.user.tipo !== 'arrendador') {
        return res.status(403).json({ error: 'Solo los arrendadores pueden realizar esta acción.' });
    }
    next();
}

module.exports = { authMiddleware, optionalAuth, arrendadorOnly };

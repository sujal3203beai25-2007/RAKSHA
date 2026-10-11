// server/middleware/auth.js
// JSON Web Token authentication & Role-Based Access Control (RBAC)

const jwt = require('jsonwebtoken');
const config = require('../config');

function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      role: user.role,
      name: user.name,
      email: user.email,
      abhaId: user.abha_id
    },
    config.jwtSecret,
    { expiresIn: '7d' }
  );
}

function extractBearerToken(req) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return null;
  const parts = authHeader.split(' ');
  if (parts.length === 2 && parts[0].toLowerCase() === 'bearer') {
    return parts[1].trim();
  }
  return null;
}

function authenticateToken(req, res, next) {
  const token = extractBearerToken(req);

  if (!token) {
    return res.status(401).json({
      error: 'Authentication required. Please provide a valid Bearer token in the Authorization header.'
    });
  }

  jwt.verify(token, config.jwtSecret, (err, decoded) => {
    if (err) {
      return res.status(403).json({
        error: 'Invalid or expired session token. Please re-authenticate.'
      });
    }
    req.user = decoded;
    next();
  });
}

function optionalAuth(req, res, next) {
  const token = extractBearerToken(req);

  if (token) {
    jwt.verify(token, config.jwtSecret, (err, decoded) => {
      if (!err) {
        req.user = decoded;
      }
      next();
    });
  } else {
    next();
  }
}

function requireRole(allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
    if (!roles.includes(req.user.role) && req.user.role !== 'admin') {
      return res.status(403).json({
        error: `Access denied. Requires one of the following permissions: ${roles.join(', ')}`
      });
    }
    next();
  };
}

module.exports = {
  generateToken,
  authenticateToken,
  optionalAuth,
  requireRole,
  extractBearerToken
};


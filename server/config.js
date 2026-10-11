// server/config.js
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const nodeEnv = process.env.NODE_ENV || 'development';
const isProduction = nodeEnv === 'production';

// Strict production validation
const rawJwtSecret = process.env.JWT_SECRET;
const defaultInsecureSecret = 'raksha_default_secure_secret_key_change_in_production_2026';

if (isProduction) {
  if (!rawJwtSecret || rawJwtSecret === defaultInsecureSecret || rawJwtSecret.length < 32) {
    throw new Error('[RAKSHA FATAL] In production mode, JWT_SECRET must be explicitly configured with a secure key of at least 32 characters.');
  }
}

// In production, DEMO_MODE must not accidentally activate
const demoMode = isProduction
  ? (process.env.DEMO_MODE === 'true') // Only if explicitly forced in production
  : (process.env.DEMO_MODE !== 'false');

module.exports = {
  port: parseInt(process.env.PORT, 10) || 3000,
  nodeEnv,
  isProduction,
  demoMode,
  jwtSecret: rawJwtSecret || defaultInsecureSecret,
  databasePath: process.env.DATABASE_PATH || path.join(__dirname, 'data', 'raksha.db'),
  nominatimUserAgent: process.env.NOMINATIM_USER_AGENT || 'RAKSHA-Healthcare-Access-Platform-SIH2026',
  overpassApiUrl: process.env.OVERPASS_API_URL || 'https://overpass-api.de/api/interpreter',
  emergencyWebhookUrl: process.env.EMERGENCY_CAD_WEBHOOK_URL || null,
  emergencyApiKey: process.env.EMERGENCY_CAD_API_KEY || null,
  staffVerificationKey: process.env.STAFF_VERIFICATION_KEY || null,
  corsOrigins: process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',').map(s => s.trim())
    : ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:5173', 'http://127.0.0.1:5173']
};


// server/index.js
// RAKSHA Clinical Civic Healthcare Access Platform - Server Engine

const http = require('http');
const path = require('path');
const express = require('express');
const cors = require('cors');
const { WebSocketServer } = require('ws');

const config = require('./config');
const apiRoutes = require('./routes');
const db = require('./db');
const seedDatabase = require('./db/seed');

// Ensure database tables and initial verified records exist
seedDatabase(false);

const app = express();
const server = http.createServer(app);

// Security Headers Middleware
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(self)');
  
  // Content Security Policy
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' https://cdn.tailwindcss.com https://unpkg.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://unpkg.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https://*.tile.openstreetmap.org https://unpkg.com https://*.googleusercontent.com https://lh3.googleusercontent.com https://images.unsplash.com",
    "connect-src 'self' ws: wss: https://nominatim.openstreetmap.org https://overpass.kumi.systems https://overpass-api.de",
    "frame-ancestors 'none'"
  ].join('; ');
  res.setHeader('Content-Security-Policy', csp);

  if (config.isProduction) {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  next();
});

// Configured CORS
const corsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser requests (e.g. mobile apps, curl, server-to-server) or configured origins
    if (!origin || !config.isProduction || config.corsOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('CORS request blocked by RAKSHA security policy.'));
  },
  credentials: true
};
app.use(cors(corsOptions));

app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// Static Assets
const publicPath = path.join(__dirname, '..', 'public');
app.use(express.static(publicPath));

// API Routes
app.use('/api', apiRoutes);

// SPA Navigation Fallback for Client Browser Routes
app.use((req, res, next) => {
  if (req.method === 'GET' && !req.path.startsWith('/api')) {
    return res.sendFile(path.join(publicPath, 'index.html'));
  }
  next();
});

// Resilient Express Error Handler
app.use((err, req, res, next) => {
  console.error('[RAKSHA Server Handled Error]:', err.message);
  if (res.headersSent) return next(err);
  return res.status(err.status || 400).json({
    success: false,
    error: err.message || 'Invalid Request / Syntax Error'
  });
});

// WebSocket Server for Live Telemetry & Event Synchronization
const wss = new WebSocketServer({ server });
const jwt = require('jsonwebtoken');

wss.on('connection', (ws) => {
  ws.isAlive = true;
  ws.user = null;
  ws.subscribedCases = new Set();

  ws.on('pong', () => { ws.isAlive = true; });

  // Initial handshake
  ws.send(JSON.stringify({
    type: 'CONNECTED',
    message: 'Connected to RAKSHA Live Telemetry & Emergency Mesh',
    timestamp: new Date().toISOString()
  }));

  ws.on('message', (raw) => {
    try {
      const msg = JSON.parse(raw);
      if (msg.type === 'PING') {
        ws.send(JSON.stringify({ type: 'PONG', timestamp: new Date().toISOString() }));
      } else if (msg.type === 'AUTH' && msg.token) {
        // Authenticate WebSocket connection
        jwt.verify(msg.token, config.jwtSecret, (err, decoded) => {
          if (!err && decoded) {
            ws.user = decoded;
            ws.send(JSON.stringify({
              type: 'AUTH_SUCCESS',
              role: decoded.role,
              userId: decoded.id
            }));
          } else {
            ws.send(JSON.stringify({ type: 'AUTH_FAILED', error: 'Invalid authentication token' }));
          }
        });
      } else if (msg.type === 'SUBSCRIBE_CASE' && msg.caseId) {
        ws.subscribedCases.add(String(msg.caseId));
        ws.send(JSON.stringify({ type: 'SUBSCRIBED_CASE', caseId: msg.caseId }));
      }
    } catch (e) {
      // Ignore malformed payloads
    }
  });

  ws.on('close', () => {
    // Normal disconnect
  });
});

// Periodic ping to drop dead WebSocket sockets
const pingInterval = setInterval(() => {
  wss.clients.forEach((ws) => {
    if (!ws.isAlive) return ws.terminate();
    ws.isAlive = false;
    ws.ping();
  });
}, 30000);
pingInterval.unref();

// Broadcast SQLite database state updates with role and case-based privacy enforcement
db.subscribe((messageStr) => {
  let event;
  try {
    event = JSON.parse(messageStr);
  } catch (e) {
    return;
  }

  const { type, data } = event;

  wss.clients.forEach((client) => {
    if (client.readyState !== 1) return;

    // Public non-sensitive operational events
    if (type === 'FACILITY_SURGE_TOGGLE' || type === 'BED_COUNT_UPDATED') {
      client.send(messageStr);
      return;
    }

    // Sensitive emergency case / dispatch events
    if (type === 'EMERGENCY_DISPATCH_CREATED' || type === 'CASE_STATUS_UPDATED' || type === 'TELEMETRY_UPDATE') {
      const caseId = data ? (data.caseId || (data.case && data.case.caseId)) : null;
      const ownerId = data ? (data.userId || (data.case && data.case.userId)) : null;

      const isPrivileged = client.user && ['admin', 'dispatcher', 'driver', 'paramedic', 'hospital_admin'].includes(client.user.role);
      const isOwner = client.user && ownerId && client.user.id === ownerId;
      const isSubscribed = caseId && client.subscribedCases && client.subscribedCases.has(String(caseId));

      // Deliver full event only to authorized recipient, case owner, or explicit subscriber
      if (isPrivileged || isOwner || isSubscribed) {
        client.send(messageStr);
      }
      return;
    }

    // Referral advancement events
    if (type === 'REFERRAL_STEP_ADVANCED') {
      const isClinicalRole = client.user && ['admin', 'hospital_admin', 'doctor', 'asha'].includes(client.user.role);
      const isReferralPatient = client.user && data && data.userId && client.user.id === data.userId;
      if (isClinicalRole || isReferralPatient) {
        client.send(messageStr);
      }
      return;
    }

    // ASHA sync events
    if (type === 'ASHA_SYNC_COMPLETED') {
      const isAshaStaff = client.user && ['admin', 'asha'].includes(client.user.role);
      if (isAshaStaff) {
        client.send(messageStr);
      }
      return;
    }

    // Redeployment admin events
    if (type === 'SURGE_REDEPLOY_AUTHORIZED') {
      const isAdminStaff = client.user && ['admin', 'dispatcher'].includes(client.user.role);
      if (isAdminStaff) {
        client.send(messageStr);
      }
      return;
    }

    // Fallback: Default to authenticated users for any other operational events
    if (client.user) {
      client.send(messageStr);
    }
  });
});

const PORT = config.port;

server.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`   🏥 RAKSHA Healthcare Access Platform Online`);
  console.log(`   📡 Port: ${PORT}`);
  console.log(`   🌐 URL: http://localhost:${PORT}`);
  console.log(`   🛡️ Environment: ${config.nodeEnv}`);
  console.log(`   🚑 Mode: ${config.demoMode ? 'DEMO / SIH EVALUATION' : 'PRODUCTION'}`);
  console.log(`   📁 Database: ${config.databasePath}`);
  console.log(`=======================================================`);
});

// Process Level Safety Handlers
process.on('uncaughtException', (err) => {
  console.error('[RAKSHA Uncaught Exception]:', err.message);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('[RAKSHA Unhandled Rejection]:', reason);
});

function gracefulShutdown() {
  console.log('\n[RAKSHA] Shutting down gracefully...');
  server.close(() => {
    console.log('[RAKSHA] Closed remaining connections.');
    process.exit(0);
  });
}

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

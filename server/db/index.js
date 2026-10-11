// server/db/index.js
// Persistent SQLite Database Engine using better-sqlite3 with WAL mode and Pub/Sub

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const Database = require('better-sqlite3');
const config = require('../config');

// Collision-resistant ID generator preventing UNIQUE constraint collisions
function createUniqueId(prefix = 'ID') {
  return `${prefix}-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
}

// Ensure database directory exists
const dbDir = path.dirname(config.databasePath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Connect to SQLite Database
const db = new Database(config.databasePath, {
  // verbose: config.nodeEnv === 'development' ? console.log : null
});

// Configure SQLite for high concurrency and safety
db.pragma('journal_mode = WAL');
db.pragma('synchronous = NORMAL');
db.pragma('foreign_keys = ON');

// Execute Schema
const schemaPath = path.join(__dirname, 'schema.sql');
if (fs.existsSync(schemaPath)) {
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');
  db.exec(schemaSql);
}

// In-memory Pub/Sub listeners for real-time WebSocket distribution
const listeners = new Set();

function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function broadcast(eventType, payload) {
  const message = JSON.stringify({
    type: eventType,
    data: payload,
    timestamp: new Date().toISOString()
  });

  for (const listener of listeners) {
    try {
      listener(message);
    } catch (err) {
      console.error('[DB Broadcast Error]', err);
    }
  }
}

// Transaction wrapper
function transaction(fn) {
  return db.transaction(fn)();
}

// Log audit trail
function logAudit({ userId = null, action, entityType, entityId = null, details = {}, ip = null }) {
  try {
    const id = createUniqueId('AUD');
    const stmt = db.prepare(`
      INSERT INTO audit_logs (id, user_id, action, entity_type, entity_id, details_json, ip_address)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(id, userId, action, entityType, entityId, JSON.stringify(details), ip);
  } catch (err) {
    console.error('[Audit Log Error]', err);
  }
}

module.exports = {
  db,
  subscribe,
  broadcast,
  transaction,
  logAudit,
  createUniqueId,
  config
};

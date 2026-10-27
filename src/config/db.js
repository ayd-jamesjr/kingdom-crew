// Database connection module for TiDB Cloud (MySQL-compatible).
// Secrets come from environment variables, never from this file.
const mysql = require('mysql2/promise');

let pool = null;

function isConfigured() {
  return Boolean(process.env.DATABASE_HOST && process.env.DATABASE_USER && process.env.DATABASE_NAME);
}

function getPool() {
  if (!isConfigured()) return null;
  if (pool) return pool;

  const ssl = { minVersion: 'TLSv1.2', rejectUnauthorized: true };
  if (process.env.DATABASE_CA_CERT) {
    // Render env vars sometimes store newlines as the two characters "\n".
    ssl.ca = process.env.DATABASE_CA_CERT.replace(/\\n/g, '\n');
  }

  pool = mysql.createPool({
    host: process.env.DATABASE_HOST,
    port: Number(process.env.DATABASE_PORT || 4000),
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    ssl,
    waitForConnections: true,
    connectionLimit: 5,
    connectTimeout: 10000,
  });
  return pool;
}

module.exports = { getPool, isConfigured };

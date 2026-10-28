const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const { Pool } = require('@neondatabase/serverless');

const rawConnectionString =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.NEON_DATABASE_URL;

const connectionString = typeof rawConnectionString === 'string'
  ? rawConnectionString.trim()
  : undefined;

if (!connectionString) {
  console.error(
    '[db.js ERROR] No database connection string was found! ' +
    'Please set DATABASE_URL, POSTGRES_URL, or NEON_DATABASE_URL in your .env file.'
  );
}

const pool = new Pool({
  connectionString,
});

pool.on('connect', () => {
  console.log('Connected to Neon Postgres (Singapore pooler)');
});

pool.on('error', (err) => {
  console.error('Neon connection pool error:', err);
});

async function initDb() {
  if (!connectionString) {
    console.warn('[db.js] DATABASE_URL is not set. Skipping Neon PostgreSQL table initialization.');
    return;
  }
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS contact_leads (
      id SERIAL PRIMARY KEY,
      full_name VARCHAR(150) NOT NULL,
      email VARCHAR(255) NOT NULL,
      phone VARCHAR(50),
      company VARCHAR(150),
      interested_in VARCHAR(100),
      requirement TEXT,
      consent_agreed BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;
  try {
    await pool.query(createTableQuery);
    console.log('[Neon Postgres] Table `contact_leads` verified / created successfully.');
  } catch (err) {
    console.error('[Neon Postgres] Failed to initialize `contact_leads` table:', err);
  }
}

const store = require('./store');

module.exports = {
  ...store, // local store: inquiries audit, newsletter, analytics, consent, admin sign-ins
  query: (text, params) => {
    if (!connectionString) {
      return Promise.reject(
        new Error(
          'Cannot execute query: DATABASE_URL is not defined in your environment (.env).'
        )
      );
    }
    return pool.query(text, params);
  },
  pool,
  initDb,
};

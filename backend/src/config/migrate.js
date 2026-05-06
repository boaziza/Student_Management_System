const path = require('path');
const fs   = require('fs');
require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });
const pool = require('./db');

async function migrate() {
  const sqlFile = path.join(__dirname, 'migrations', '001_initial_schema.sql');
  const sql     = fs.readFileSync(sqlFile, 'utf8');

  const client = await pool.connect();
  try {
    console.log('Running migration: 001_initial_schema.sql ...');
    await client.query(sql);
    console.log('Migration completed successfully.');
  } catch (err) {
    console.error('Migration failed:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();

/**
 * Drop all tables from the database
 */

const { Client } = require('pg');

const client = new Client({
  host: 'localhost',
  port: 5432,
  username: 'jiangyz',
  password: '',
  database: 'mbti_test',
});

async function dropTables() {
  try {
    await client.connect();
    console.log('Connected to database');

    // Drop all tables in correct order (respecting foreign keys)
    const tables = [
      'test_answers',
      'test_reports',
      'test_sessions',
      'questions',
      'mbti_types',
      'users',
      'daily_statistics',
    ];

    for (const table of tables) {
      try {
        await client.query(`DROP TABLE IF EXISTS ${table} CASCADE`);
        console.log(`✓ Dropped table: ${table}`);
      } catch (error) {
        console.log(`✗ Failed to drop ${table}: ${error.message}`);
      }
    }

    console.log('All tables dropped successfully');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
  }
}

dropTables();

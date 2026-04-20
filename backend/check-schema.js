/**
 * Check database schema
 */

const { Client } = require('pg');

const client = new Client({
  host: 'localhost',
  port: 5432,
  user: 'jiangyz',
  password: '',
  database: 'mbti_test',
});

async function checkSchema() {
  try {
    await client.connect();
    console.log('Connected to database\n');

    // Get mbti_types table schema
    console.log('=== MBTI_TYPES Table Schema ===');
    const result = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'mbti_types'
      ORDER BY ordinal_position;
    `);

    result.rows.forEach(row => {
      console.log(`${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
  }
}

checkSchema();

/**
 * Check all table schemas
 */

const { Client } = require('pg');

const client = new Client({
  host: 'localhost',
  port: 5432,
  user: 'jiangyz',
  password: '',
  database: 'mbti_test',
});

async function checkAllSchemas() {
  try {
    await client.connect();
    console.log('Connected to database\n');

    const tables = ['mbti_types', 'questions', 'users', 'test_sessions', 'test_answers', 'test_reports'];

    for (const table of tables) {
      console.log(`=== ${table.toUpperCase()} Table Schema ===`);
      const result = await client.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = '${table}'
        ORDER BY ordinal_position;
      `);

      result.rows.forEach(row => {
        console.log(`${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`);
      });
      console.log('');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
  }
}

checkAllSchemas();

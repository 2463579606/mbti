/**
 * Check test sessions in database
 */

const { Client } = require('pg');

const client = new Client({
  host: 'localhost',
  port: 5432,
  user: 'jiangyz',
  password: '',
  database: 'mbti_test',
});

async function checkSessions() {
  try {
    await client.connect();
    console.log('✅ Connected to database\n');

    const result = await client.query('SELECT * FROM test_sessions ORDER BY "createdAt" DESC LIMIT 5');

    console.log('=== Recent Test Sessions ===');
    result.rows.forEach(row => {
      console.log(`ID: ${row.id}, Token: ${row.sessionToken}, Status: ${row.status}, Current: ${row.currentQuestion}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.end();
  }
}

checkSessions();

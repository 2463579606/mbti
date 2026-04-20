/**
 * Check all recent sessions
 */

const { Client } = require('pg');

const client = new Client({
  host: 'localhost',
  port: 5432,
  user: 'jiangyz',
  password: '',
  database: 'mbti_test',
});

async function checkAllSessions() {
  try {
    await client.connect();
    console.log('✅ Connected to database\n');

    // Get all recent sessions with answer counts
    const result = await client.query(`
      SELECT s.id, s."sessionToken", s.status, s."currentQuestion", s."answeredCount",
        COUNT(a.id) as actual_answers
      FROM test_sessions s
      LEFT JOIN test_answers a ON s.id = a."sessionId"
      WHERE s."createdAt" > NOW() - INTERVAL '1 hour'
      GROUP BY s.id
      ORDER BY s.id DESC
      LIMIT 5
    `);

    console.log('=== Recent Sessions ===');
    result.rows.forEach(row => {
      console.log(`\nSession ID: ${row.id}`);
      console.log(`Token: ${row.session_token}`);
      console.log(`Status: ${row.status}`);
      console.log(`Current Question: ${row.current_question}`);
      console.log(`Stored Answered Count: ${row.answered_count}`);
      console.log(`Actual Answers in DB: ${row.actual_answers}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.end();
  }
}

checkAllSessions();

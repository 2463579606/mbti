/**
 * Clear all test data from database
 */

const { Client } = require('pg');

const client = new Client({
  host: 'localhost',
  port: 5432,
  user: 'jiangyz',
  password: '',
  database: 'mbti_test',
});

async function clearTestData() {
  try {
    await client.connect();
    console.log('✅ Connected to database\n');

    // Delete all test reports
    const reportsResult = await client.query('DELETE FROM test_reports');
    console.log(`✅ Deleted ${reportsResult.rowCount} test reports`);

    // Delete all test answers
    const answersResult = await client.query('DELETE FROM test_answers');
    console.log(`✅ Deleted ${answersResult.rowCount} test answers`);

    // Delete all test sessions
    const sessionsResult = await client.query('DELETE FROM test_sessions');
    console.log(`✅ Deleted ${sessionsResult.rowCount} test sessions`);

    console.log('\n🎉 All test data cleared successfully!');
    console.log('You can now start a fresh test!\n');

    // Verify cleanup
    const remainingReports = await client.query('SELECT COUNT(*) as count FROM test_reports');
    const remainingAnswers = await client.query('SELECT COUNT(*) as count FROM test_answers');
    const remainingSessions = await client.query('SELECT COUNT(*) as count FROM test_sessions');

    console.log('=== Verification ===');
    console.log(`Remaining reports: ${remainingReports.rows[0].count}`);
    console.log(`Remaining answers: ${remainingAnswers.rows[0].count}`);
    console.log(`Remaining sessions: ${remainingSessions.rows[0].count}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.end();
  }
}

clearTestData();

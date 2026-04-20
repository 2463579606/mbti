/**
 * Check user's actual answers and results
 */

const { Client } = require('pg');

const client = new Client({
  host: 'localhost',
  port: 5432,
  user: 'jiangyz',
  password: '',
  database: 'mbti_test',
});

async function checkUserAnswers() {
  try {
    await client.connect();
    console.log('✅ Connected to database\n');

    // Get the most recent completed reports
    const reportsResult = await client.query(`
      SELECT r.id, r."sessionId", r."mbtiType", r."eiScore", r."snScore", r."tfScore", r."jpScore",
        r."createdAt", s."resultScores"
      FROM test_reports r
      JOIN test_sessions s ON r."sessionId" = s.id
      ORDER BY r."createdAt" DESC
      LIMIT 3
    `);

    console.log('=== Recent Test Reports ===');
    reportsResult.rows.forEach((report, index) => {
      console.log(`\n报告 ${index + 1} (ID: ${report.id}):`);
      console.log(`MBTI Type: ${report.mbtiType}`);
      console.log(`Dimension Scores:`);
      console.log(`  E: ${report.eiScore}%, I: ${100 - report.eiScore}%`);
      console.log(`  S: ${report.snScore}%, N: ${100 - report.snScore}%`);
      console.log(`  T: ${report.tfScore}%, F: ${100 - report.tfScore}%`);
      console.log(`  J: ${report.jpScore}%, P: ${100 - report.jpScore}%`);
      console.log(`Created At: ${report.createdAt}`);
    });

    // Check the most recent session's answers
    const sessionResult = await client.query(`
      SELECT id, "currentQuestion", "answeredCount", "resultType", "resultScores"
      FROM test_sessions
      ORDER BY "createdAt" DESC
      LIMIT 1
    `);

    if (sessionResult.rows.length > 0) {
      const session = sessionResult.rows[0];
      console.log(`\n=== Most Recent Session (ID: ${session.id}) ===`);
      console.log(`Status: ${session.resultType || 'Not completed'}`);
      console.log(`Answers Submitted: ${session.answeredCount}`);
      console.log(`Stored Scores: ${JSON.stringify(session.resultScores)}`);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.end();
  }
}

checkUserAnswers();

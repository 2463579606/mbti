/**
 * Check latest test result
 */

const { Client } = require('pg');

const client = new Client({
  host: 'localhost',
  port: 5432,
  user: 'jiangyz',
  password: '',
  database: 'mbti_test',
});

async function checkLatestResult() {
  try {
    await client.connect();
    console.log('✅ Connected to database\n');

    // Get the latest completed session
    const sessionResult = await client.query(`
      SELECT id, "resultType", "resultScores"
      FROM test_sessions
      WHERE id = 24
    `);
    const session = sessionResult.rows[0];

    console.log('=== Your Test Result ===');
    console.log(`Session ID: ${session.id}`);
    console.log(`MBTI Type: ${session.resultType}`);
    console.log(`Raw Scores: ${JSON.stringify(session.resultScores)}`);

    // Calculate percentages
    const scores = session.resultScores;
    const percentages = {
      EI: Math.round((scores.EI / 30) * 100),
      SN: Math.round((scores.SN / 30) * 100),
      TF: Math.round((scores.TF / 30) * 100),
      JP: Math.round((scores.JP / 30) * 100),
    };

    console.log(`\n=== Dimension Percentages ===`);
    console.log(`E vs I: ${percentages.EI}% E / ${100 - percentages.EI}% I`);
    console.log(`S vs N: ${percentages.SN}% S / ${100 - percentages.SN}% N`);
    console.log(`T vs F: ${percentages.TF}% T / ${100 - percentages.TF}% F`);
    console.log(`J vs P: ${percentages.JP}% J / ${100 - percentages.JP}% P`);

    // Check if report exists
    const reportResult = await client.query(`
      SELECT id, "mbtiType", "eiScore", "snScore", "tfScore", "jpScore"
      FROM test_reports
      WHERE "sessionId" = 24
    `);

    if (reportResult.rows.length > 0) {
      const report = reportResult.rows[0];
      console.log(`\n=== Report Generated ===`);
      console.log(`Report ID: ${report.id}`);
      console.log(`Stored MBTI Type: ${report.mbtiType}`);
      console.log(`Share Token: ${report.shareToken}`);
    } else {
      console.log(`\n❌ Report not found. You may need to complete the test again.`);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.end();
  }
}

checkLatestResult();

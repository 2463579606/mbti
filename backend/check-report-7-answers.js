/**
 * Check report 7 detailed analysis
 */

const { Client } = require('pg');

const client = new Client({
  host: 'localhost',
  port: 5432,
  user: 'jiangyz',
  password: '',
  database: 'mbti_test',
});

async function checkReport7() {
  try {
    await client.connect();
    console.log('✅ Connected to database\n');

    const reportId = 7;

    // Get report details
    const reportResult = await client.query('SELECT * FROM test_reports WHERE id = $1', [reportId]);
    const report = reportResult.rows[0];

    console.log('=== Report 7 Details ===');
    console.log(`MBTI Type: ${report.mbtiType}`);
    console.log(`Session ID: ${report.sessionId}`);
    console.log(`Dimension Scores from Report:`);
    console.log(`  EI: ${report.eiScore}%`);
    console.log(`  SN: ${report.snScore}%`);
    console.log(`  TF: ${report.tfScore}%`);
    console.log(`  JP: ${report.jpScore}%`);

    // Get the session's stored scores
    const sessionResult = await client.query('SELECT "resultScores" FROM test_sessions WHERE id = $1', [report.sessionId]);
    const session = sessionResult.rows[0];

    console.log(`\nSession Stored Scores: ${JSON.stringify(session.resultScores)}`);

    // Calculate actual answers
    const answersResult = await client.query(`
      SELECT dimension, SUM(score) as total_score
      FROM test_answers
      WHERE "sessionId" = $1
      GROUP BY dimension
      ORDER BY dimension
    `, [report.sessionId]);

    console.log(`\n=== Actual Answer Scores ===`);
    const maxScores = { EI: 30, SN: 30, TF: 30, JP: 30 };
    const calculatedScores = {};

    answersResult.rows.forEach(row => {
      const score = row.total_score;
      const percentage = Math.round((score / maxScores[row.dimension]) * 100);
      calculatedScores[row.dimension] = { score, percentage };
      console.log(`${row.dimension}: ${score}/${maxScores[row.dimension]} = ${percentage}%`);
    });

    console.log(`\n=== Comparison ===`);
    console.log(`Report vs Calculated:`);
    console.log(`EI: ${report.eiScore}% vs ${calculatedScores.EI?.percentage || 'N/A'}%`);
    console.log(`SN: ${report.snScore}% vs ${calculatedScores.SN?.percentage || 'N/A'}%`);
    console.log(`TF: ${report.tfScore}% vs ${calculatedScores.TF?.percentage || 'N/A'}%`);
    console.log(`JP: ${report.jpScore}% vs ${calculatedScores.JP?.percentage || 'N/A'}%`);

    // Sample some actual answers
    const sampleAnswers = await client.query(`
      SELECT "questionId", dimension, "selectedOption", score
      FROM test_answers
      WHERE "sessionId" = $1
      ORDER BY "questionId"
      LIMIT 10
    `, [report.sessionId]);

    console.log(`\n=== Sample Answers ===`);
    sampleAnswers.rows.forEach(answer => {
      console.log(`Q${answer.questionId + 1}: ${answer.dimension} - Option ${answer.selectedOption} - Score: ${answer.score}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.end();
  }
}

checkReport7();

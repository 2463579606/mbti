/**
 * Debug scoring calculation
 */

const { Client } = require('pg');

const client = new Client({
  host: 'localhost',
  port: 5432,
  user: 'jiangyz',
  password: '',
  database: 'mbti_test',
});

async function debugScoring() {
  try {
    await client.connect();
    console.log('✅ Connected to database\n');

    // Get the most recent session
    const sessionResult = await client.query('SELECT * FROM test_sessions ORDER BY "id" DESC LIMIT 1');
    const session = sessionResult.rows[0];

    console.log('=== Most Recent Session ===');
    console.log(`Session ID: ${session.id}`);
    console.log(`Status: ${session.status}`);
    console.log(`Result Type: ${session.resultType}`);
    console.log(`Result Scores: ${JSON.stringify(session.resultScores)}`);
    console.log('');

    // Get all answers for this session
    const answersResult = await client.query('SELECT * FROM test_answers WHERE "sessionId" = $1 ORDER BY "questionId"', [session.id]);
    const answers = answersResult.rows;

    console.log('=== Answers ===');
    console.log(`Total answers: ${answers.length}`);
    console.log('');

    // Calculate dimension scores manually
    const dimensionScores = { EI: 0, SN: 0, TF: 0, JP: 0 };

    for (const answer of answers) {
      dimensionScores[answer.dimension] += answer.score;
    }

    console.log('=== Dimension Scores ===');
    console.log(`EI: ${dimensionScores.EI}/30 (${Math.round((dimensionScores.EI / 30) * 100)}%)`);
    console.log(`SN: ${dimensionScores.SN}/30 (${Math.round((dimensionScores.SN / 30) * 100)}%)`);
    console.log(`TF: ${dimensionScores.TF}/30 (${Math.round((dimensionScores.TF / 30) * 100)}%)`);
    console.log(`JP: ${dimensionScores.JP}/30 (${Math.round((dimensionScores.JP / 30) * 100)}%)`);
    console.log('');

    // Determine type code
    const percentages = {
      EI: Math.round((dimensionScores.EI / 30) * 100),
      SN: Math.round((dimensionScores.SN / 30) * 100),
      TF: Math.round((dimensionScores.TF / 30) * 100),
      JP: Math.round((dimensionScores.JP / 30) * 100),
    };

    const E = percentages.EI >= 50;
    const S = percentages.SN >= 50;
    const T = percentages.TF >= 50;
    const J = percentages.JP >= 50;

    const typeCode = (E ? 'E' : 'I') + (S ? 'S' : 'N') + (T ? 'T' : 'F') + (J ? 'J' : 'P');

    console.log('=== MBTI Type ===');
    console.log(`Calculated Type: ${typeCode}`);
    console.log(`Stored Type: ${session.resultType || 'undefined'}`);
    console.log('');

    // Check report
    const reportResult = await client.query('SELECT * FROM test_reports WHERE "sessionId" = $1', [session.id]);
    if (reportResult.rows.length > 0) {
      const report = reportResult.rows[0];
      console.log('=== Report ===');
      console.log(`Report ID: ${report.id}`);
      console.log(`MBTI Type in DB: ${report.mbti_type || 'undefined'}`);
      console.log(`Dimension Scores: ${JSON.stringify(report.dimensionDetails)}`);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.end();
  }
}

debugScoring();

/**
 * Check test progress
 */

const { Client } = require('pg');

const client = new Client({
  host: 'localhost',
  port: 5432,
  user: 'jiangyz',
  password: '',
  database: 'mbti_test',
});

async function checkProgress() {
  try {
    await client.connect();
    console.log('✅ Connected to database\n');

    // Get the most recent active session
    const sessionResult = await client.query('SELECT * FROM test_sessions ORDER BY "id" DESC LIMIT 1');
    const session = sessionResult.rows[0];

    if (!session) {
      console.log('No sessions found');
      return;
    }

    console.log('=== Current Session ===');
    console.log(`Session ID: ${session.id}`);
    console.log(`Status: ${session.status}`);
    console.log(`Current Question: ${session.currentQuestion}`);
    console.log(`Answered Count: ${session.answeredCount}`);

    // Get answered questions
    const answersResult = await client.query('SELECT "questionId" FROM test_answers WHERE "sessionId" = $1 ORDER BY "questionId"', [session.id]);
    const answeredQuestions = answersResult.rows.map(row => row.questionId);

    console.log(`\nAnswered Questions: ${answeredQuestions.length}`);
    console.log(`Answered: ${answeredQuestions.join(', ')}`);

    // Find missing questions
    const allQuestions = Array.from({ length: 60 }, (_, i) => i);
    const missingQuestions = allQuestions.filter(q => !answeredQuestions.includes(q));

    if (missingQuestions.length > 0) {
      console.log(`\n❌ Missing Questions: ${missingQuestions.join(', ')}`);
      console.log(`You need to answer ${missingQuestions.length} more questions!`);
    } else {
      console.log('\n✅ All questions answered! You can complete the test.');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.end();
  }
}

checkProgress();

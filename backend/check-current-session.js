/**
 * Check current session status
 */

const { Client } = require('pg');

const client = new Client({
  host: 'localhost',
  port: 5432,
  user: 'jiangyz',
  password: '',
  database: 'mbti_test',
});

async function checkCurrentSession() {
  try {
    await client.connect();
    console.log('✅ Connected to database\n');

    // Get most recent session
    const sessionResult = await client.query('SELECT * FROM test_sessions ORDER BY "id" DESC LIMIT 1');
    const session = sessionResult.rows[0];

    if (!session) {
      console.log('❌ No sessions found. You need to start a new test.');
      return;
    }

    console.log('=== Current Session ===');
    console.log(`Session ID: ${session.id}`);
    console.log(`Token: ${session.sessionToken}`);
    console.log(`Status: ${session.status}`);
    console.log(`Current Question: ${session.currentQuestion}`);
    console.log(`Answered Count: ${session.answeredCount}`);

    // Get answered questions
    const answersResult = await client.query('SELECT "questionId", "selectedOption" FROM test_answers WHERE "sessionId" = $1 ORDER BY "questionId"', [session.id]);
    const answers = answersResult.rows;

    console.log(`\n✅ Answered Questions (${answers.length}):`);
    answers.forEach(answer => {
      console.log(`  Q${answer.questionId + 1}: Option ${answer.selectedOption}`);
    });

    // Find next unanswered question
    const allQuestions = Array.from({ length: 60 }, (_, i) => i);
    const answeredQuestions = answers.map(a => a.questionId);
    const nextQuestion = allQuestions.find(q => !answeredQuestions.includes(q));

    if (nextQuestion !== undefined) {
      console.log(`\n➡️ Next unanswered question: Q${nextQuestion + 1} (Question ID: ${nextQuestion})`);
    } else {
      console.log(`\n🎉 All questions answered! You can complete the test.`);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.end();
  }
}

checkCurrentSession();

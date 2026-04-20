/**
 * Check session 20 details
 */

const { Client } = require('pg');

const client = new Client({
  host: 'localhost',
  port: 5432,
  user: 'jiangyz',
  password: '',
  database: 'mbti_test',
});

async function checkSession20() {
  try {
    await client.connect();
    console.log('✅ Connected to database\n');

    const sessionId = 20;

    // Get session details
    const sessionResult = await client.query('SELECT * FROM test_sessions WHERE id = $1', [sessionId]);
    const session = sessionResult.rows[0];

    console.log('=== Session 20 Details ===');
    console.log(`Session ID: ${session.id}`);
    console.log(`Status: ${session.status}`);
    console.log(`Current Question: ${session.currentQuestion}`);
    console.log(`Answered Count: ${session.answeredCount}`);

    // Get answered questions
    const answersResult = await client.query('SELECT "questionId" FROM test_answers WHERE "sessionId" = $1 ORDER BY "questionId"', [sessionId]);
    const answeredQuestions = answersResult.rows.map(row => row.questionId);

    console.log(`\n✅ Answered Questions: ${answeredQuestions.length}`);
    console.log(`Answered: ${answeredQuestions.join(', ')}`);

    // Find missing questions
    const allQuestions = Array.from({ length: 60 }, (_, i) => i);
    const missingQuestions = allQuestions.filter(q => !answeredQuestions.includes(q));

    if (missingQuestions.length > 0) {
      console.log(`\n❌ Missing Questions (${missingQuestions.length}): ${missingQuestions.join(', ')}`);
      console.log(`\n💡 You need to answer ${missingQuestions.length} more questions before completing the test!`);
      console.log(`\n📝 Missing question numbers: ${missingQuestions.map(q => q + 1).join(', ')}`);
    } else {
      console.log('\n🎉 All questions answered! You can now complete the test.');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.end();
  }
}

checkSession20();

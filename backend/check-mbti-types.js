/**
 * Check MBTI types in database
 */

const { Client } = require('pg');

const client = new Client({
  host: 'localhost',
  port: 5432,
  user: 'jiangyz',
  password: '',
  database: 'mbti_test',
});

async function checkMBTITypes() {
  try {
    await client.connect();
    console.log('✅ Connected to database\n');

    // Check if INTJ exists
    const result = await client.query('SELECT * FROM mbti_types WHERE "code" = $1', ['INTJ']);

    console.log('=== INTJ Type ===');
    if (result.rows.length === 0) {
      console.log('INTJ not found in database!');
    } else {
      const type = result.rows[0];
      console.log(`Code: ${type.code}`);
      console.log(`Name: ${type.name}`);
      console.log(`Group Name: ${type.groupName}`);
      console.log(`Headline: ${type.headline}`);
      console.log(`Tagline: ${type.tagline}`);
      console.log(`Emoji: ${type.emoji}`);
      console.log(`Strengths: ${type.strengths ? JSON.stringify(type.strengths) : 'null'}`);
      console.log(`Weaknesses: ${type.weaknesses ? JSON.stringify(type.weaknesses) : 'null'}`);
      console.log(`Careers: ${type.careers ? JSON.stringify(type.careers) : 'null'}`);
    }

    console.log('\n=== All MBTI Types ===');
    const allTypes = await client.query('SELECT "code", "name" FROM mbti_types ORDER BY "code"');
    console.log(`Total types: ${allTypes.rows.length}`);
    allTypes.rows.forEach(row => {
      console.log(`  ${row.code}: ${row.name}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.end();
  }
}

checkMBTITypes();

/**
 * Test repository methods
 */

const { Client } = require('pg');

const client = new Client({
  host: 'localhost',
  port: 5432,
  user: 'jiangyz',
  password: '',
  database: 'mbti_test',
});

async function testRepository() {
  try {
    await client.connect();
    console.log('✅ Connected to database\n');

    // Test finding by ID
    const id = 6;
    console.log(`=== Testing findById with ID: ${id} ===`);
    const result = await client.query('SELECT * FROM test_sessions WHERE id = $1', [id]);

    if (result.rows.length > 0) {
      console.log('✓ Found session by ID:');
      console.log(`  ID: ${result.rows[0].id}`);
      console.log(`  Token: ${result.rows[0].sessionToken}`);
      console.log(`  Status: ${result.rows[0].status}`);
    } else {
      console.log('✗ No session found with ID:', id);
    }

    // Test finding by token
    const token = 'sess_6dfbade85bf14f31';
    console.log(`\n=== Testing findByToken with token: ${token} ===`);
    const result2 = await client.query('SELECT * FROM test_sessions WHERE "sessionToken" = $1', [token]);

    if (result2.rows.length > 0) {
      console.log('✓ Found session by token:');
      console.log(`  ID: ${result2.rows[0].id}`);
      console.log(`  Token: ${result2.rows[0].sessionToken}`);
      console.log(`  Status: ${result2.rows[0].status}`);
    } else {
      console.log('✗ No session found with token:', token);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.end();
  }
}

testRepository();

/**
 * Check test reports in database
 */

const { Client } = require('pg');

const client = new Client({
  host: 'localhost',
  port: 5432,
  user: 'jiangyz',
  password: '',
  database: 'mbti_test',
});

async function checkReports() {
  try {
    await client.connect();
    console.log('✅ Connected to database\n');

    const result = await client.query('SELECT * FROM test_reports ORDER BY "createdAt" DESC LIMIT 5');

    console.log('=== Recent Test Reports ===');
    if (result.rows.length === 0) {
      console.log('No reports found');
    } else {
      result.rows.forEach(row => {
        console.log(`ID: ${row.id}, SessionID: ${row.sessionId}, MBTI Type: ${row.mbtiType}, EI: ${row.eiScore}, SN: ${row.snScore}, TF: ${row.tfScore}, JP: ${row.jpScore}`);
      });
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.end();
  }
}

checkReports();

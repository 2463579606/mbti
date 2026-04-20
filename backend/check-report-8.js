/**
 * Check and fix report 8
 */

const { Client } = require('pg');

const client = new Client({
  host: 'localhost',
  port: 5432,
  user: 'jiangyz',
  password: '',
  database: 'mbti_test',
});

async function checkReport8() {
  try {
    await client.connect();
    console.log('✅ Connected to database\n');

    const reportId = 8;

    // Get report details
    const reportResult = await client.query('SELECT * FROM test_reports WHERE id = $1', [reportId]);
    const report = reportResult.rows[0];

    console.log('=== Report 8 Details ===');
    console.log(`ID: ${report.id}`);
    console.log(`Session ID: ${report.sessionId}`);
    console.log(`MBTI Type: ${report.mbtiType}`);
    console.log(`Share Token: ${report.shareToken || 'MISSING!'}`);
    console.log(`Share Count: ${report.shareCount}`);

    // If share token is missing, generate one
    if (!report.shareToken) {
      console.log(`\n🔧 Generating missing share token...`);

      const { generateShareToken } = require('/Users/jiangyz/Documents/jiangyz/myproject/mbti/backend/pkg/utils/token');
      const newShareToken = generateShareToken();

      await client.query('UPDATE test_reports SET "shareToken" = $1 WHERE id = $2', [newShareToken, reportId]);

      console.log(`✅ Generated share token: ${newShareToken}`);
      console.log(`Share URL: http://localhost:8000/api/v1/report/share/${newShareToken}`);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.end();
  }
}

checkReport8();

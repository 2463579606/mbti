/**
 * Check report column names
 */

const { Client } = require('pg');

const client = new Client({
  host: 'localhost',
  port: 5432,
  user: 'jiangyz',
  password: '',
  database: 'mbti_test',
});

async function checkReportColumns() {
  try {
    await client.connect();
    console.log('✅ Connected to database\n');

    // Check table schema
    const schemaResult = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'test_reports'
      ORDER BY ordinal_position
    `);

    console.log('=== test_reports Table Schema ===');
    schemaResult.rows.forEach(row => {
      console.log(`${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`);
    });
    console.log('');

    // Check the actual data in the most recent report
    const reportResult = await client.query('SELECT * FROM test_reports WHERE "id" = 1');
    const report = reportResult.rows[0];

    console.log('=== Report Data (ID: 1) ===');
    console.log('All columns and values:');
    for (const [key, value] of Object.entries(report)) {
      console.log(`  ${key}: ${value}`);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.end();
  }
}

checkReportColumns();

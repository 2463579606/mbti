/**
 * AI Analysis Migration Script
 * Creates ai_analysis_records table
 */

import * as dotenv from 'dotenv';
import { Client } from 'pg';

dotenv.config();

async function runMigration() {
  console.log('🔄 Running AI Analysis migration...\n');

  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USERNAME || 'jiangyz',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_DATABASE || 'mbti_test',
  });

  try {
    // Connect to database
    console.log('1️⃣  Connecting to database...');
    await client.connect();
    console.log('   ✅ Connected\n');

    // Read migration SQL
    console.log('2️⃣  Reading migration file...');
    const fs = require('fs');
    const path = require('path');
    const sqlPath = path.join(__dirname, '../migrations/ai-analysis.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    console.log('   ✅ Migration file loaded\n');

    // Execute migration
    console.log('3️⃣  Executing migration...');
    await client.query(sql);
    console.log('   ✅ Migration executed\n');

    // Verify table creation
    console.log('4️⃣  Verifying table creation...');
    const checkResult = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_name = 'ai_analysis_records'
      );
    `);

    if (checkResult.rows[0].exists) {
      console.log('   ✅ Table ai_analysis_records created\n');

      // Show table structure
      console.log('5️⃣  Table structure:');
      const columns = await client.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'ai_analysis_records'
        ORDER BY ordinal_position;
      `);

      console.log('   Column Name              | Type            | Nullable');
      console.log('   ' + '-'.repeat(70));
      columns.rows.forEach((row: any) => {
        const name = row.column_name.padEnd(25);
        const type = row.data_type.padEnd(15);
        const nullable = row.is_nullable;
        console.log(`   ${name} | ${type} | ${nullable}`);
      });
      console.log('');
    } else {
      console.log('   ❌ Table not found\n');
      return;
    }

    // Check indexes
    console.log('6️⃣  Indexes created:');
    const indexes = await client.query(`
      SELECT indexname
      FROM pg_indexes
      WHERE tablename = 'ai_analysis_records'
      ORDER BY indexname;
    `);

    indexes.rows.forEach((idx: any) => {
      console.log(`   • ${idx.indexname}`);
    });
    console.log('');

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎉 AI Analysis migration completed!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (error: any) {
    console.error('❌ Migration failed:', error.message);
    throw error;
  } finally {
    await client.end();
    console.log('✅ Database connection closed\n');
  }
}

runMigration()
  .then(() => {
    console.log('✅ Migration script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Migration script failed:', error);
    process.exit(1);
  });

/**
 * Compare reports 6 and 7
 */

const { Client } = require('pg');

const client = new Client({
  host: 'localhost',
  port: 5432,
  user: 'jiangyz',
  password: '',
  database: 'mbti_test',
});

async function compareReports() {
  try {
    await client.connect();
    console.log('✅ Connected to database\n');

    // Get both reports
    const reportsResult = await client.query(`
      SELECT r.id, r."sessionId", r."mbtiType", r."eiScore", r."snScore", r."tfScore", r."jpScore",
        r."createdAt", s."resultScores"
      FROM test_reports r
      JOIN test_sessions s ON r."sessionId" = s.id
      WHERE r.id IN (6, 7)
      ORDER BY r.id DESC
    `);

    console.log('=== Test Comparison ===\n');

    reportsResult.rows.forEach((report, index) => {
      const testNum = index === 0 ? '第二次测试' : '第一次测试';
      console.log(`${testNum} (Report ${report.id}):`);
      console.log(`  MBTI Type: ${report.mbtiType}`);
      console.log(`  维度分数:`);
      console.log(`    E vs I: ${report.eiScore}% vs ${100 - report.eiScore}%`);
      console.log(`    S vs N: ${report.snScore}% vs ${100 - report.snScore}%`);
      console.log(`    T vs F: ${report.tfScore}% vs ${100 - report.tfScore}%`);
      console.log(`    J vs P: ${report.jpScore}% vs ${100 - report.jpScore}%`);
      console.log(`  测试时间: ${report.createdAt}`);
      console.log(`  原始分数: ${JSON.stringify(report.resultScores)}`);
      console.log('');
    });

    // Check if results are actually different
    const report7 = reportsResult.rows.find(r => r.id === 7);
    const report6 = reportsResult.rows.find(r => r.id === 6);

    const isSameType = report7.mbtiType === report6.mbtiType;
    const isSameScores =
      report7.eiScore === report6.eiScore &&
      report7.snScore === report6.snScore &&
      report7.tfScore === report6.tfScore &&
      report7.jpScore === report6.jpScore;

    console.log('=== 差异分析 ===');
    console.log(`性格类型相同: ${isSameType ? '❌ 是' : '✅ 否'}`);
    console.log(`维度分数相同: ${isSameScores ? '❌ 完全相同' : '✅ 不同'}`);

    if (!isSameScores) {
      console.log('\n具体差异:');
      console.log(`  EI: ${report6.eiScore}% → ${report7.eiScore}% (变化: ${report7.eiScore - report6.eiScore}%)`);
      console.log(`  SN: ${report6.snScore}% → ${report7.snScore}% (变化: ${report7.snScore - report6.snScore}%)`);
      console.log(`  TF: ${report6.tfScore}% → ${report7.tfScore}% (变化: ${report7.tfScore - report6.tfScore}%)`);
      console.log(`  JP: ${report6.jpScore}% → ${report7.jpScore}% (变化: ${report7.jpScore - report6.jpScore}%)`);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.end();
  }
}

compareReports();

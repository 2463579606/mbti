/**
 * Test ReportService directly
 */

const { Client } = require('pg');

const client = new Client({
  host: 'localhost',
  port: 5432,
  user: 'jiangyz',
  password: '',
  database: 'mbti_test',
});

async function testReportService() {
  try {
    await client.connect();
    console.log('✅ Connected to database\n');

    const reportId = 2;

    // Get report
    const reportResult = await client.query('SELECT * FROM test_reports WHERE "id" = $1', [reportId]);
    const report = reportResult.rows[0];

    console.log('=== Raw Report ===');
    console.log('ID:', report.id);
    console.log('Session ID:', report.sessionId);
    console.log('MBTI Type:', report.mbtiType);
    console.log('');

    // Get session
    const sessionResult = await client.query('SELECT * FROM test_sessions WHERE "id" = $1', [report.sessionId]);
    const session = sessionResult.rows[0];

    console.log('=== Session ===');
    console.log('ID:', session.id);
    console.log('Result Type:', session.resultType);
    console.log('Result Scores:', session.resultScores);
    console.log('');

    // Get MBTI type
    const mbtiResult = await client.query('SELECT * FROM mbti_types WHERE "code" = $1', [report.mbtiType]);
    const mbtiType = mbtiResult.rows[0];

    if (mbtiType) {
      console.log('=== MBTI Type Found ===');
      console.log('Code:', mbtiType.code);
      console.log('Name:', mbtiType.name);
      console.log('Group Name:', mbtiType.groupName);
      console.log('Headline:', mbtiType.headline);
      console.log('Tagline:', mbtiType.tagline);
      console.log('Strengths:', mbtiType.strengths);
      console.log('Weaknesses:', mbtiType.weaknesses);
      console.log('Careers:', mbtiType.careers);
    } else {
      console.log('❌ MBTI Type NOT found for code:', report.mbtiType);
    }

    console.log('');
    console.log('=== Expected Report Detail Structure ===');
    console.log({
      reportId: report.id,
      sessionId: report.sessionId,
      mbtiType: mbtiType ? {
        code: mbtiType.code,
        name: mbtiType.name,
        emoji: mbtiType.emoji,
        group: mbtiType.groupName,
        headline: mbtiType.headline,
        tagline: mbtiType.tagline,
      } : null,
      strengths: mbtiType?.strengths,
      weaknesses: mbtiType?.weaknesses,
      careers: mbtiType?.careers,
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.end();
  }
}

testReportService();

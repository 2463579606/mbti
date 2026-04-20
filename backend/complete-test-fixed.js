/**
 * Complete MBTI Test Script
 * Simulates a full 60-question test and generates a report
 */

const http = require('http');

const HOST = 'localhost';
const PORT = 8000;
const BASE_URL = `http://${HOST}:${PORT}/api/v1`;

let sessionToken = '';

function makeRequest(method, path, data = null, token = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: HOST,
      port: PORT,
      path: `/api/v1${path}`,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(body);
          if (res.statusCode === 200 || res.statusCode === 201) {
            resolve(response);
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${response.message || response.error}`));
          }
        } catch (e) {
          reject(new Error(`Parse error: ${e.message}. Body: ${body}`));
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

async function createSession() {
  console.log('📝 Creating test session...');
  const response = await makeRequest('POST', '/test/session');
  sessionToken = response.data.sessionToken;
  console.log(`✅ Session created: ${sessionToken}`);
  console.log(`   Total questions: ${response.data.totalQuestions}`);
  console.log('');
  return sessionToken;
}

async function submitAnswer(questionId, selectedOption) {
  const data = { questionId, selectedOption };
  const response = await makeRequest('POST', '/test/answer', data, sessionToken);
  return response.data;
}

async function completeTest() {
  console.log('🎯 Completing test and generating report...');
  const response = await makeRequest('POST', '/test/complete', null, sessionToken);
  console.log(`✅ Test completed!`);
  console.log(`   Report ID: ${response.data.reportId}`);
  console.log(`   MBTI Type: ${response.data.mbtiType}`);
  console.log(`   Share Token: ${response.data.shareToken}`);
  console.log('');
  return response.data;
}

async function getReport(reportId) {
  console.log(`📊 Getting report details (ID: ${reportId})...`);
  const response = await makeRequest('GET', `/report/${reportId}`, null, sessionToken);
  console.log(`✅ Report retrieved successfully`);
  return response.data;
}

async function getPublicReport(shareToken) {
  console.log(`🌍 Testing public report sharing...`);
  const response = await makeRequest('GET', `/report/share/${shareToken}`);
  console.log(`✅ Public report accessed successfully`);
  return response.data;
}

async function runFullTest() {
  try {
    // Step 1: Create session
    await createSession();

    // Step 2: Answer all 60 questions
    console.log('❓ Answering 60 questions...');
    console.log('');

    // Simulate answers for all 60 questions
    for (let i = 0; i < 60; i++) {
      // Simulate different personality types by choosing answers strategically
      // This will result in an INTJ personality type
      let selectedOption;

      if (i < 15) {
        // EI dimension: Choose I (introvert) answers
        selectedOption = 1; // Option B scores 0 (introvert)
      } else if (i < 30) {
        // SN dimension: Choose N (intuitive) answers
        selectedOption = 1; // Option B scores 0 (intuitive)
      } else if (i < 45) {
        // TF dimension: Choose T (thinking) answers
        selectedOption = 0; // Option A scores 2 (thinking)
      } else {
        // JP dimension: Choose J (judging) answers
        selectedOption = 0; // Option A scores 2 (judging)
      }

      const result = await submitAnswer(i, selectedOption);

      if ((i + 1) % 15 === 0) {
        const progress = result.progress.percentage;
        console.log(`   Progress: ${i + 1}/60 (${progress}%)`);
      }
    }

    console.log('');
    console.log('✅ All 60 questions answered!');

    // Step 3: Complete test and get report
    const completeResult = await completeTest();
    const reportId = completeResult.reportId;
    const shareToken = completeResult.shareToken;
    const mbtiType = completeResult.mbtiType;

    // Step 4: Get detailed report
    const report = await getReport(reportId);

    console.log('');
    console.log('═════════════════════════════════════════════════════════════');
    console.log('                    🎉 MBTI TEST RESULTS 🎉                      ');
    console.log('═════════════════════════════════════════════════════════════');
    console.log('');
    console.log(`Your MBTI Personality Type: ${mbtiType}`);
    console.log('');

    if (report.mbtiType) {
      const typeInfo = report.mbtiType;
      console.log(`Name: ${typeInfo.name}`);
      console.log(`Group: ${typeInfo.group}`);
      console.log(`Description: ${typeInfo.headline}`);
      console.log(`Tagline: ${typeInfo.tagline}`);
      console.log('');
      console.log('Strengths:');
      report.strengths.forEach(s => console.log(`  • ${s}`));
      console.log('');
      console.log('Weaknesses:');
      report.weaknesses.forEach(w => console.log(`  • ${w}`));
      console.log('');
      console.log('Career Matches:');
      report.careers.forEach(c => console.log(`  • ${c}`));
    }

    console.log('');
    console.log('Dimension Scores:');
    if (report.dimensions) {
      report.dimensions.forEach(dim => {
        console.log(`  ${dim.key}: ${dim.leftPercentage}% ${dim.left.split(' ')[0]} / ${dim.rightPercentage}% ${dim.right.split(' ')[0]} (${dim.description})`);
      });
    }

    console.log('');
    console.log('═════════════════════════════════════════════════════════════');

    // Step 5: Test public sharing
    console.log('');
    const publicReport = await getPublicReport(shareToken);

    console.log('🔗 Share Link Details:');
    console.log(`   Share Token: ${shareToken}`);
    console.log(`   Public Access: ✅ Working`);
    console.log(`   Views: ${publicReport.shareCount || 0}`);

    console.log('');
    console.log('🎉 COMPLETE TEST FLOW SUCCESSFUL!');
    console.log('');
    console.log('Summary:');
    console.log('  ✅ Session created');
    console.log('  ✅ All 60 questions answered');
    console.log('  ✅ Test completed');
    console.log('  ✅ Report generated');
    console.log('  ✅ Public sharing working');
    console.log('');
    console.log('📱 You can now take the test in your browser at: http://localhost:3000');
    console.log('🔗 Public report link: http://localhost:8000/api/v1/report/share/' + shareToken);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

runFullTest();

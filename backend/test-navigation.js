/**
 * Test navigation functionality
 */

const http = require('http');

const HOST = 'localhost';
const PORT = 8000;

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
            reject(new Error(`HTTP ${res.statusCode}: ${response.message}`));
          }
        } catch (e) {
          reject(new Error(`Parse error: ${e.message}`));
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

async function testNavigation() {
  try {
    console.log('🧪 Testing Previous Button Functionality\n');

    // Get current session info
    const sessionCheck = await makeRequest('POST', '/test/session');
    const sessionToken = sessionCheck.data.sessionToken;

    console.log('✅ Session created:', sessionToken);
    console.log('📝 Testing navigation...\n');

    // Submit a few answers
    console.log('1️⃣ Submitting answers for questions 1-3...');
    await makeRequest('POST', '/test/answer', { questionId: 0, selectedOption: 0 }, sessionToken);
    console.log('   ✅ Q1: Answered Option A');
    await makeRequest('POST', '/test/answer', { questionId: 1, selectedOption: 1 }, sessionToken);
    console.log('   ✅ Q2: Answered Option B');
    await makeRequest('POST', '/test/answer', { questionId: 2, selectedOption: 0 }, sessionToken);
    console.log('   ✅ Q3: Answered Option A');

    // Get current question
    const currentQ = await makeRequest('GET', '/test/question/current', null, sessionToken);
    console.log(`\n📍 Current Question: ${currentQ.data.questionNumber}`);
    console.log(`   Question: ${currentQ.data.question}`);
    console.log(`   Progress: ${currentQ.data.progress.current}/${currentQ.data.progress.total}`);

    // Simulate going back
    console.log(`\n⬅️ Simulating "Previous Button" click...`);
    console.log(`   Going from Q${currentQ.data.progress.current} to Q${currentQ.data.progress.current - 1}`);

    // Test going back to Q2
    const prevQ = await makeRequest('GET', '/test/questions?start=1&count=1', null, sessionToken);
    console.log(`\n📄 Previous Question (Q2):`);
    console.log(`   Question: ${prevQ.data.questions[0].question}`);
    console.log(`   Options: A: ${prevQ.data.questions[0].options[0].text}, B: ${prevQ.data.questions[0].options[1].text}`);

    console.log(`\n✅ Previous Button Test Complete!`);
    console.log(`\n💡 In the browser, you should be able to:`);
    console.log(`   • Click "← 上一题" to go back`);
    console.log(`   • See the correct previous question`);
    console.log(`   • Keep your previously selected answers`);
    console.log(`   • Navigate freely between questions`);

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testNavigation();

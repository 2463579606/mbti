/**
 * Debug report API response for report ID 3
 */

const http = require('http');

const HOST = 'localhost';
const PORT = 8000;

function makeRequest(method, path, data = null, token = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: HOST,
      port: PORT,
      path: path,
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
          resolve(response);
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

async function debugReportAPI() {
  try {
    const reportId = 3;
    const sessionToken = 'sess_dd079e51a21cb1b7';

    console.log(`📊 Getting report details (ID: ${reportId})...`);
    const response = await makeRequest('GET', `/api/v1/report/${reportId}`, null, sessionToken);

    console.log('\n=== API Response Structure ===');
    console.log('Success:', response.success);
    console.log('Data keys:', Object.keys(response.data || {}));
    console.log('');

    if (response.data) {
      console.log('=== Report Data ===');
      console.log('Report ID:', response.data.reportId);
      console.log('Session ID:', response.data.sessionId);
      console.log('');

      if (response.data.mbtiType) {
        console.log('=== MBTI Type ===');
        console.log('Type:', typeof response.data.mbtiType);
        console.log('Value:', JSON.stringify(response.data.mbtiType, null, 2));
      } else {
        console.log('❌ mbtiType is missing or undefined');
      }

      console.log('');
      console.log('=== Other Fields ===');
      console.log('Strengths:', response.data.strengths);
      console.log('Weaknesses:', response.data.weaknesses);
      console.log('Careers:', response.data.careers);

      console.log('');
      console.log('=== Full Response Data ===');
      console.log(JSON.stringify(response.data, null, 2));
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

debugReportAPI();

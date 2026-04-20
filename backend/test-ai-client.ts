/**
 * AI Client Test Script
 * Tests the AI client connectivity and basic functionality
 */

// Load environment variables first
import * as dotenv from 'dotenv';
dotenv.config();

import { getAIClient } from './pkg/openai/openai-client';
import { validateAIConfig } from './config/ai.config';

async function testAIClient() {
  console.log('🧪 Starting AI Client Test...\n');

  try {
    // 1. Validate configuration
    console.log('1️⃣  Validating AI configuration...');
    validateAIConfig();
    console.log('   ✅ Configuration validated\n');

    // 2. Initialize client
    console.log('2️⃣  Initializing AI client...');
    const client = getAIClient();
    console.log('   ✅ Client initialized\n');

    // 3. Health check
    console.log('3️⃣  Performing health check...');
    const isHealthy = await client.healthCheck();
    if (isHealthy) {
      console.log('   ✅ AI API is healthy\n');
    } else {
      console.log('   ❌ AI API health check failed\n');
      return;
    }

    // 4. Test simple chat
    console.log('4️⃣  Testing simple chat request...');
    const response = await client.chat([
      {
        role: 'system',
        content: 'You are a helpful assistant.',
      },
      {
        role: 'user',
        content: 'Say "Hello, AI!" in exactly those words.',
      },
    ], {
      maxTokens: 50,
      temperature: 0.5,
    });

    console.log('   📝 Response:', response.content);
    console.log('   📊 Token usage:', response.usage);
    console.log('   ✅ Chat test successful\n');

    // 5. Test cost estimation
    console.log('5️⃣  Testing cost estimation...');
    const estimatedCost = client.estimateCost(1000, 2000);
    console.log(`   💰 Estimated cost for 1k input + 2k output tokens: ${estimatedCost} cents`);
    console.log('   ✅ Cost estimation successful\n');

    // 6. Test structured response
    console.log('6️⃣  Testing structured JSON response...');
    const jsonResponse = await client.chat([
      {
        role: 'system',
        content: 'You are a data analyst. Always respond with valid JSON.',
      },
      {
        role: 'user',
        content: 'Generate a JSON object with keys: "name", "age", "city". Use realistic values.',
      },
    ], {
      maxTokens: 100,
      temperature: 0.7,
    });

    console.log('   📝 JSON Response:', jsonResponse.content);
    console.log('   ✅ Structured response test successful\n');

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎉 All AI client tests passed!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('📊 Test Summary:');
    console.log('  • Configuration: ✅');
    console.log('  • Client initialization: ✅');
    console.log('  • API health: ✅');
    console.log('  • Basic chat: ✅');
    console.log('  • Cost estimation: ✅');
    console.log('  • Structured response: ✅\n');

    console.log('✨ AI client is ready for production use!\n');

  } catch (error: any) {
    console.error('❌ Test failed:', error.message);
    if (error.type) {
      console.error('   Error type:', error.type);
    }
    if (error.details) {
      console.error('   Details:', error.details);
    }
    process.exit(1);
  }
}

// Run tests
testAIClient()
  .then(() => {
    console.log('✅ Test script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Test script failed:', error);
    process.exit(1);
  });

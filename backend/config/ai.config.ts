/**
 * AI Configuration
 * Manages AI service settings and feature flags
 */

export interface AIConfig {
  // Feature Toggle
  enabled: boolean;

  // Provider Configuration
  provider: 'zhipu' | 'openai';
  model: string;
  apiEndpoint: string;
  apiKey: string;

  // Generation Parameters
  temperature: number;
  maxTokens: number;
  topP: number;

  // Timeout and Retry
  timeout: number;        // milliseconds
  maxRetries: number;
  retryDelay: number;     // milliseconds

  // Cache Configuration
  cacheEnabled: boolean;
  cacheTTL: number;       // seconds

  // Concurrency Control
  maxConcurrent: number;
  queueEnabled: boolean;

  // Cost Control
  dailyQuota: number;
  quotaResetAt: string;   // HH:MM format

  // Feature Flags
  features: {
    comprehensive: boolean;  // Full personality analysis
    career: boolean;         // Career-focused analysis
    relationship: boolean;   // Relationship-focused analysis
    growth: boolean;         // Growth planning analysis
  };
}

const aiConfig: AIConfig = {
  enabled: process.env.AI_ENABLED === 'true',
  provider: (process.env.AI_PROVIDER as 'zhipu' | 'openai') || 'zhipu',
  model: process.env.AI_MODEL || 'glm-4-flash',
  apiEndpoint: process.env.AI_API_ENDPOINT || 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
  apiKey: process.env.AI_API_KEY || '',

  temperature: parseFloat(process.env.AI_TEMPERATURE || '0.7'),
  maxTokens: parseInt(process.env.AI_MAX_TOKENS || '3000', 10),
  topP: parseFloat(process.env.AI_TOP_P || '0.9'),

  timeout: parseInt(process.env.AI_TIMEOUT || '60000', 10),
  maxRetries: parseInt(process.env.AI_MAX_RETRIES || '3', 10),
  retryDelay: parseInt(process.env.AI_RETRY_DELAY || '2000', 10),

  cacheEnabled: process.env.AI_CACHE_ENABLED !== 'false',
  cacheTTL: parseInt(process.env.AI_CACHE_TTL || '86400', 10),

  maxConcurrent: parseInt(process.env.AI_MAX_CONCURRENT || '5', 10),
  queueEnabled: process.env.AI_QUEUE_ENABLED !== 'false',

  dailyQuota: parseInt(process.env.AI_DAILY_QUOTA || '1000', 10),
  quotaResetAt: process.env.AI_QUOTA_RESET_AT || '00:00',

  features: {
    comprehensive: process.env.AI_FEATURE_COMPREHENSIVE !== 'false',
    career: process.env.AI_FEATURE_CAREER !== 'false',
    relationship: process.env.AI_FEATURE_RELATIONSHIP !== 'false',
    growth: process.env.AI_FEATURE_GROWTH !== 'false',
  },
};

/**
 * Validate AI configuration
 * @throws Error if configuration is invalid
 */
export function validateAIConfig(): void {
  if (!aiConfig.enabled) {
    console.log('ℹ️  AI feature is disabled');
    return;
  }

  const errors: string[] = [];

  // Validate required fields
  if (!aiConfig.apiKey) {
    errors.push('AI_API_KEY is required when AI is enabled');
  }

  if (!aiConfig.apiEndpoint) {
    errors.push('AI_API_ENDPOINT is required when AI is enabled');
  }

  // Validate numeric ranges
  if (aiConfig.temperature < 0 || aiConfig.temperature > 2) {
    errors.push('AI_TEMPERATURE must be between 0 and 2');
  }

  if (aiConfig.maxTokens < 1 || aiConfig.maxTokens > 32000) {
    errors.push('AI_MAX_TOKENS must be between 1 and 32000');
  }

  if (aiConfig.topP < 0 || aiConfig.topP > 1) {
    errors.push('AI_TOP_P must be between 0 and 1');
  }

  if (aiConfig.timeout < 1000 || aiConfig.timeout > 300000) {
    errors.push('AI_TIMEOUT must be between 1000 and 300000');
  }

  if (aiConfig.maxRetries < 0 || aiConfig.maxRetries > 10) {
    errors.push('AI_MAX_RETRIES must be between 0 and 10');
  }

  if (aiConfig.maxConcurrent < 1 || aiConfig.maxConcurrent > 100) {
    errors.push('AI_MAX_CONCURRENT must be between 1 and 100');
  }

  if (aiConfig.dailyQuota < 1) {
    errors.push('AI_DAILY_QUOTA must be greater than 0');
  }

  // Validate time format
  const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
  if (!timeRegex.test(aiConfig.quotaResetAt)) {
    errors.push('AI_QUOTA_RESET_AT must be in HH:MM format (e.g., 00:00)');
  }

  // Throw if there are errors
  if (errors.length > 0) {
    throw new Error(`AI Configuration validation failed:\n${errors.join('\n')}`);
  }

  // Log configuration summary (without exposing API key)
  console.log('✅ AI Configuration validated:', {
    enabled: aiConfig.enabled,
    provider: aiConfig.provider,
    model: aiConfig.model,
    endpoint: aiConfig.apiEndpoint.replace(/\/\/.*@/, '//***@'),
    temperature: aiConfig.temperature,
    maxTokens: aiConfig.maxTokens,
    cacheEnabled: aiConfig.cacheEnabled,
    maxConcurrent: aiConfig.maxConcurrent,
  });
}

/**
 * Get AI configuration (read-only)
 */
export function getAIConfig(): Readonly<AIConfig> {
  return aiConfig;
}

/**
 * Check if a specific AI feature is enabled
 */
export function isAIFeatureEnabled(feature: keyof AIConfig['features']): boolean {
  return aiConfig.enabled && aiConfig.features[feature];
}

/**
 * Update AI configuration at runtime (for testing/admin)
 * @param partialConfig Partial configuration to update
 */
export function updateAIConfig(partialConfig: Partial<AIConfig>): void {
  Object.assign(aiConfig, partialConfig);
  console.log('ℹ️  AI Configuration updated');
}

export { aiConfig };

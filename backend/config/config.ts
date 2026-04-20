/**
 * Application Configuration
 */

export interface AppConfig {
  nodeEnv: string;
  port: number;
  apiPrefix: string;

  database: {
    host: string;
    port: number;
    username: string;
    password: string;
    database: string;
    synchronize: boolean;
    logging: boolean;
  };

  redis: {
    host: string;
    port: number;
    password: string;
    db: number;
  };

  jwt: {
    secret: string;
    expiresIn: string;
  };

  cors: {
    enabled: boolean;
    origin: string;
  };

  cache: {
    questions: number;
    mbtiTypes: number;
    reports: number;
    stats: number;
  };

  rateLimit: {
    ttl: number;
    ipMax: number;
    userMax: number;
  };

  session: {
    tokenTTL: number;
    shareTokenTTL: number;
  };
}

const config: AppConfig = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '8000', 10),
  apiPrefix: process.env.API_PREFIX || 'api/v1',

  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'jiangyz',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_DATABASE || 'mbti_test',
    synchronize: process.env.DB_SYNCHRONIZE === 'true',
    logging: process.env.DB_LOGGING === 'true',
  },

  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || '',
    db: parseInt(process.env.REDIS_DB || '0', 10),
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },

  cors: {
    enabled: process.env.CORS_ENABLED === 'true',
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  },

  cache: {
    questions: parseInt(process.env.CACHE_TTL_QUESTIONS || '3600', 10),
    mbtiTypes: parseInt(process.env.CACHE_TTL_MBTI_TYPES || '86400', 10),
    reports: parseInt(process.env.CACHE_TTL_REPORTS || '604800', 10),
    stats: parseInt(process.env.CACHE_TTL_STATS || '300', 10),
  },

  rateLimit: {
    ttl: parseInt(process.env.RATE_LIMIT_TTL || '60', 10),
    ipMax: parseInt(process.env.RATE_LIMIT_IP_MAX || '100', 10),
    userMax: parseInt(process.env.RATE_LIMIT_USER_MAX || '200', 10),
  },

  session: {
    tokenTTL: parseInt(process.env.SESSION_TOKEN_TTL || '7200', 10),
    shareTokenTTL: parseInt(process.env.SHARE_TOKEN_TTL || '604800', 10),
  },
};

export function validateConfig(): void {
  const requiredEnvVars = [];

  if (!config.database.host) requiredEnvVars.push('DB_HOST');
  if (!config.jwt.secret || config.jwt.secret === 'your-secret-key-change-in-production') {
    console.warn('⚠️  Warning: Using default JWT secret. Please set JWT_SECRET in production!');
  }

  if (requiredEnvVars.length > 0) {
    throw new Error(`Missing required environment variables: ${requiredEnvVars.join(', ')}`);
  }

  // Validate AI configuration if enabled
  try {
    const { validateAIConfig } = require('./ai.config');
    validateAIConfig();
  } catch (error) {
    console.error('❌ AI configuration validation failed:', error);
    throw error;
  }
}

export { config };

/**
 * Application Configuration
 * Loads and validates environment variables
 */

export interface AppConfig {
  // Application
  nodeEnv: string;
  port: number;
  apiPrefix: string;

  // Database
  database: {
    host: string;
    port: number;
    username: string;
    password: string;
    database: string;
    synchronize: boolean;
    logging: boolean;
  };

  // Redis
  redis: {
    host: string;
    port: number;
    password?: string;
    db: number;
  };

  // JWT
  jwt: {
    secret: string;
    expiresIn: string;
  };

  // Session
  session: {
    tokenTTL: number;
    shareTokenTTL: number;
  };

  // Cache TTL
  cache: {
    questions: number;
    mbtiTypes: number;
    reports: number;
    stats: number;
  };

  // Rate Limiting
  rateLimit: {
    ttl: number;
    ipMax: number;
    userMax: number;
  };

  // Logging
  logging: {
    level: string;
    filePath: string;
  };

  // CORS
  cors: {
    enabled: boolean;
    origin: string;
  };
}

export const config: AppConfig = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '8000', 10),
  apiPrefix: process.env.API_PREFIX || 'api/v1',

  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_DATABASE || 'mbti_test',
    synchronize: process.env.DB_SYNCHRONIZE === 'true',
    logging: process.env.DB_LOGGING === 'true',
  },

  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || undefined,
    db: parseInt(process.env.REDIS_DB || '0', 10),
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'dev-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },

  session: {
    tokenTTL: parseInt(process.env.SESSION_TOKEN_TTL || '7200', 10),
    shareTokenTTL: parseInt(process.env.SHARE_TOKEN_TTL || '604800', 10),
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

  logging: {
    level: process.env.LOG_LEVEL || 'debug',
    filePath: process.env.LOG_FILE_PATH || 'logs',
  },

  cors: {
    enabled: process.env.CORS_ENABLED === 'true',
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  },
};

// Validation
export const validateConfig = (): void => {
  const requiredEnvVars = [
    'DB_HOST',
    'DB_USERNAME',
    'DB_PASSWORD',
    'DB_DATABASE',
  ];

  const missing = requiredEnvVars.filter(
    (varName) => !process.env[varName]
  );

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}`
    );
  }

  // Warn in production if using defaults
  if (config.nodeEnv === 'production') {
    if (config.jwt.secret === 'dev-secret-key') {
      throw new Error('JWT_SECRET must be set in production');
    }
  }
};

/**
 * Application Entry Point
 */

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import compression from 'compression';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { config, validateConfig } from '../../config/config';
import { logger } from '../../pkg/utils/logger';

async function bootstrap() {
  try {
    // Validate configuration
    validateConfig();

    logger.info(`Starting MBTI API in ${config.nodeEnv} mode...`);

    // Create NestJS application
    const app = await NestFactory.create(AppModule, {
      logger: ['error', 'warn', 'log', 'debug', 'verbose'],
    });

    const configService = app.get(ConfigService);

    // Security middleware
    app.use(helmet());
    app.use(compression());

    // CORS
    if (config.cors.enabled) {
      app.enableCors({
        origin: config.cors.origin,
        credentials: true,
      });
    }

    // Global validation pipe
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      })
    );

    // Global prefix
    app.setGlobalPrefix(config.apiPrefix);

    // Start server
    const port = config.port;
    await app.listen(port);

    logger.info(`🚀 Application is running on: http://localhost:${port}`);
    logger.info(`📚 API endpoint: http://localhost:${port}/${config.apiPrefix}`);
    logger.info(`🌍 Environment: ${config.nodeEnv}`);

  } catch (error) {
    logger.error('Failed to start application:', 'Bootstrap', error);
    console.error('Full error details:', error);
    if (error instanceof Error) {
      console.error('Error stack:', error.stack);
    }
    process.exit(1);
  }
}

bootstrap();

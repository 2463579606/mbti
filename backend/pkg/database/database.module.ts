/**
 * Database Module
 * TypeORM configuration and PostgreSQL connection
 */

import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { config } from '../../config/config';

// Entities
import { entities } from '../../internal/entities';
import { AIAnalysisRecord } from '../../internal/ai/entities/ai-analysis.entity';

@Global()
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: () => ({
        type: 'postgres',
        host: process.env.DB_HOST || config.database.host,
        port: parseInt(process.env.DB_PORT || config.database.port.toString(), 10),
        username: process.env.DB_USERNAME || config.database.username,
        password: process.env.DB_PASSWORD || config.database.password,
        database: process.env.DB_DATABASE || config.database.database,
        entities: [...entities, AIAnalysisRecord],
        synchronize: true, // Force synchronize to create tables
        logging: config.database.logging,
        ssl: config.nodeEnv === 'production' ? { rejectUnauthorized: false } : false,
      }),
    }),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}

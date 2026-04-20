/**
 * AI Module
 * Organizes all AI-related functionality
 */

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';

import { AIAnalysisController } from './handler/ai-analysis.controller';
import { AIAnalysisService } from './service/ai-analysis.service';
import { AIGenerationService } from './service/ai-generation.service';
import { AIPromptBuilder } from './service/ai-prompt.builder';
// import { AICacheService } from './service/ai-cache.service';  // Temporarily disabled
import { AIAnalysisRepository } from './repository/ai-analysis.repository';
// import { AIQueueService } from '../../queue/ai-queue.service';  // Temporarily disabled
import { AIAnalysisRecord } from './entities/ai-analysis.entity';

import { TestReportRepository } from '../repository/repositories';
import { UserRepository } from '../repository/repositories';
import { TestSessionRepository } from '../repository/test-session.repository';
import { TestReport } from '../entities/test-report.entity';
import { User } from '../entities/user.entity';
import { TestSession } from '../entities/test-session.entity';

@Module({
  imports: [
    ConfigModule,
    ThrottlerModule,
    TypeOrmModule.forFeature([
      AIAnalysisRecord,
      TestReport,
      User,
      TestSession,
    ]),
  ],
  controllers: [AIAnalysisController],
  providers: [
    AIAnalysisService,
    AIGenerationService,
    // AICacheService,  // Temporarily disabled
    AIPromptBuilder,
    AIAnalysisRepository,
    TestReportRepository,
    UserRepository,
    TestSessionRepository,
    // AIQueueService,  // Temporarily disabled
  ],
  exports: [
    AIAnalysisService,
    AIGenerationService,
    // AICacheService,  // Temporarily disabled
    AIAnalysisRepository,
    // AIQueueService,  // Temporarily disabled
  ],
})
export class AIModule {}

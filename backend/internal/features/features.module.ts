/**
 * Features Module
 * Contains all feature modules (Test, Report, User, etc.)
 */

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';

// Entities
import { User } from '../entities/user.entity';
import { TestSession } from '../entities/test-session.entity';
import { TestAnswer } from '../entities/index';
import { Question } from '../entities/index';
import { MBTIType } from '../entities/index';
import { TestReport } from '../entities/index';

// Services
import { UserService } from '../service/user.service';
import { TestService } from '../service/test.service';
import { ReportService } from '../service/report.service';
import { QuestionService } from '../service/question.service';
import { AuthService } from '../service/auth.service';
import { StatisticsService } from '../service/statistics.service';

// Controllers
import { TestController } from '../handler/test.controller';
import { ReportController } from '../handler/report.controller';
import { AuthController } from '../handler/auth.controller';
import { UserController } from '../handler/user.controller';
import { AdminController } from '../handler/admin.controller';

// Guards and Strategies
import { JwtStrategy } from '../guards/jwt.strategy';

// Repositories
import { UserRepository } from '../repository/user.repository';
import { TestSessionRepository } from '../repository/test-session.repository';
import { TestAnswerRepository, QuestionRepository, MBTITypeRepository, TestReportRepository } from '../repository/repositories';

// Cache
import { CacheModule } from '../../pkg/cache/cache.module';
import { CacheService } from '../../pkg/cache/cache.service';
import { CACHE_PROVIDER } from '../../pkg/cache/cache.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, TestSession, TestAnswer, Question, MBTIType, TestReport]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: { expiresIn: '7d' },
    }),
    CacheModule,
  ],
  controllers: [
    TestController,
    ReportController,
    AuthController,
    UserController,
    AdminController,
  ],
  providers: [
    // Repositories
    UserRepository,
    TestSessionRepository,
    TestAnswerRepository,
    QuestionRepository,
    MBTITypeRepository,
    TestReportRepository,

    // Services
    UserService,
    TestService,
    ReportService,
    QuestionService,
    CacheService,
    AuthService,
    StatisticsService,

    // Guards and Strategies
    JwtStrategy,

    // Export providers for other modules
    {
      provide: 'USER_REPOSITORY',
      useExisting: UserRepository,
    },
    {
      provide: 'TEST_SERVICE',
      useExisting: TestService,
    },
  ],
  exports: [
    UserService,
    TestService,
    ReportService,
    QuestionService,
    CacheService,
    AuthService,
    StatisticsService,
  ],
})
export class FeaturesModule {}

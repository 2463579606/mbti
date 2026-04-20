/**
 * Test Service
 * Core business logic for MBTI test
 */

import { Injectable, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { TestSession, TestAnswer, Question, MBTIType } from '../entities';
import { SessionStatus } from '../domain/test-session.entity';
import {
  UserRepository,
  TestSessionRepository,
  TestAnswerRepository,
  QuestionRepository,
  MBTITypeRepository,
  TestReportRepository,
} from '../repository/repositories';
import { UserService } from './user.service';
import { ReportService } from './report.service';
import { scoringService } from './scoring.service';
import { generateSessionToken, generateShareToken } from '../../pkg/utils/token';
import { SessionNotFoundError, DuplicateAnswerError, TestIncompleteError, TestCompletedError, ErrorCode } from '../../pkg/errors/errors';
import { CacheService } from '../../pkg/cache/cache.service';
import { config } from '../../config/config';

@Injectable()
export class TestService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly testSessionRepository: TestSessionRepository,
    private readonly testAnswerRepository: TestAnswerRepository,
    private readonly questionRepository: QuestionRepository,
    private readonly mbtiTypeRepository: MBTITypeRepository,
    private readonly testReportRepository: TestReportRepository,
    private readonly userService: UserService,
    @Inject(forwardRef(() => ReportService))
    private readonly reportService: ReportService,
    private readonly cacheService: CacheService
  ) {}

  /**
   * Create a new test session
   */
  async createSession(userId?: number, anonymousId?: string) {
    // Create or get user
    let user = null;
    if (anonymousId) {
      try {
        user = await this.userService.findOrCreate({
          anonymousId,
        });
      } catch (error) {
        // If user not found, create anonymous user
        user = await this.userService.findOrCreate({ anonymousId: anonymousId });
      }
    }

    // Create session
    const sessionToken = generateSessionToken();
    const session = await this.testSessionRepository.create({
      userId: user?.id || null,
      sessionToken,
    });

    // Cache session for quick access
    await this.cacheService.set(
      `session:${sessionToken}`,
      {
        sessionId: session.id,
        userId: user?.id || null,
        currentQuestion: 0,
        answeredCount: 0,
      },
      config.session.tokenTTL
    );

    return {
      sessionId: session.id,
      sessionToken: session.sessionToken,
      totalQuestions: 60,
      expiresAt: new Date(Date.now() + config.session.tokenTTL * 1000).toISOString(),
    };
  }

  /**
   * Get all questions (with caching)
   */
  async getQuestions(start = 0, count = 10) {
    const cacheKey = `questions:all`;

    // Try cache first
    let questions = await this.cacheService.get<Question[]>(cacheKey);
    if (!questions) {
      questions = await this.questionRepository.findActive();
      await this.cacheService.set(cacheKey, questions, config.cache.questions);
    }

    // Apply pagination
    const paginatedQuestions = questions.slice(start, start + count);

    return {
      total: questions.length,
      questions: paginatedQuestions.map((q) => this.formatQuestion(q)),
    };
  }

  /**
   * Get current question
   */
  async getCurrentQuestion(sessionToken: string) {
    const session = await this.getSessionByToken(sessionToken);

    if (session.status === SessionStatus.COMPLETED) {
      throw new TestCompletedError();
    }

    const question = await this.questionRepository.findByQuestionId(
      session.currentQuestion
    );

    if (!question) {
      throw new NotFoundException(ErrorCode.QUESTION_NOT_FOUND);
    }

    const answeredCount = await this.testAnswerRepository.countBySessionId(
      session.id
    );

    return this.formatQuestionWithProgress(question, session.currentQuestion, answeredCount);
  }

  /**
   * Submit answer
   */
  async submitAnswer(sessionToken: string, questionId: number, option: number) {
    const session = await this.getSessionByToken(sessionToken);

    if (session.status === SessionStatus.COMPLETED) {
      throw new TestCompletedError();
    }

    // Check if already answered
    const existing = await this.testAnswerRepository.findBySessionIdAndQuestionId(
      session.id,
      questionId
    );

    if (existing) {
      throw new DuplicateAnswerError();
    }

    // Get question
    const question = await this.questionRepository.findByQuestionId(questionId);
    if (!question) {
      throw new NotFoundException(ErrorCode.QUESTION_NOT_FOUND);
    }

    // Calculate score
    const score = option === 0 ? question.scoreA : question.scoreB;

    // Save answer
    await this.testAnswerRepository.create({
      sessionId: session.id,
      userId: session.userId,
      questionId,
      dimension: question.dimension,
      selectedOption: option,
      score,
    });

    // Update session
    const nextQuestion = session.currentQuestion + 1;
    const answeredCount = await this.testAnswerRepository.countBySessionId(
      session.id
    );

    await this.testSessionRepository.updateById(session.id, {
      currentQuestion: nextQuestion,
      answeredCount,
    });

    // Update cache
    await this.updateSessionCache(sessionToken, {
      currentQuestion: nextQuestion,
      answeredCount,
    });

    const isComplete = nextQuestion >= 60;

    return {
      answered: true,
      questionId,
      selectedOption: option,
      score,
      nextQuestion: isComplete ? null : nextQuestion,
      isComplete,
      progress: {
        current: nextQuestion,
        total: 60,
        percentage: Math.round((answeredCount / 60) * 100),
      },
    };
  }

  /**
   * Batch submit answers (for resume)
   */
  async submitAnswers(sessionToken: string, answers: Array<{ questionId: number; option: number }>) {
    const session = await this.getSessionByToken(sessionToken);

    if (session.status === SessionStatus.COMPLETED) {
      throw new TestCompletedError();
    }

    // Get all questions
    const questions = await this.questionRepository.findActive();
    const questionMap = new Map(questions.map((q) => [q.questionId, q]));

    // Process answers
    const accepted: Array<{ questionId: number; option: number }> = [];
    const rejected: Array<{ questionId: number; reason: string }> = [];

    for (const answer of answers) {
      const existing = await this.testAnswerRepository.findBySessionIdAndQuestionId(
        session.id,
        answer.questionId
      );

      if (existing) {
        rejected.push({ questionId: answer.questionId, reason: 'already answered' });
        continue;
      }

      const question = questionMap.get(answer.questionId);
      if (!question) {
        rejected.push({ questionId: answer.questionId, reason: 'question not found' });
        continue;
      }

      const score = answer.option === 0 ? question.scoreA : question.scoreB;

      await this.testAnswerRepository.create({
        sessionId: session.id,
        userId: session.userId,
        questionId: answer.questionId,
        dimension: question.dimension,
        selectedOption: answer.option,
        score,
      });

      accepted.push(answer);
    }

    // Update session
    const answeredCount = await this.testAnswerRepository.countBySessionId(session.id);
    const currentQuestion = answeredCount > 0 ? answeredCount - 1 : 0;

    await this.testSessionRepository.updateById(session.id, {
      currentQuestion,
      answeredCount,
    });

    // Update cache
    await this.updateSessionCache(sessionToken, {
      currentQuestion,
      answeredCount,
    });

    return {
      accepted: accepted.length,
      rejected,
      currentQuestion,
      progress: {
        current: answeredCount,
        total: 60,
        percentage: Math.round((answeredCount / 60) * 100),
      },
    };
  }

  /**
   * Get test progress
   */
  async getProgress(sessionToken: string) {
    const session = await this.getSessionByToken(sessionToken);
    const answers = await this.testAnswerRepository.findBySessionId(session.id);

    const dimensionProgress: Record<
      string,
      { dimension: string; label: string; answered: number; total: number; isComplete: boolean }
    > = {
      EI: { dimension: 'EI', label: '外向 / 内向', answered: 0, total: 15, isComplete: false },
      SN: { dimension: 'SN', label: '实感 / 直觉', answered: 0, total: 15, isComplete: false },
      TF: { dimension: 'TF', label: '思考 / 情感', answered: 0, total: 15, isComplete: false },
      JP: { dimension: 'JP', label: '判断 / 感知', answered: 0, total: 15, isComplete: false },
    };

    for (const answer of answers) {
      dimensionProgress[answer.dimension].answered++;
      if (dimensionProgress[answer.dimension].answered >= 15) {
        dimensionProgress[answer.dimension].isComplete = true;
      }
    }

    return {
      currentQuestion: session.currentQuestion,
      answeredCount: answers.length,
      total: 60,
      percentage: Math.round((answers.length / 60) * 100),
      dimensionProgress,
    };
  }

  /**
   * Complete test and generate report
   */
  async completeTest(sessionToken: string) {
    const session = await this.getSessionByToken(sessionToken);

    if (session.status === SessionStatus.COMPLETED) {
      // Return existing report if already completed
      const report = await this.testReportRepository.findBySessionId(session.id);
      if (report) {
        return {
          sessionId: session.id,
          reportId: report.id,
          mbtiType: session.resultType || report.mbtiType,
          shareToken: report.shareToken,
          reportUrl: `/report/${report.id}`,
        };
      }
    }

    // Get all answers
    const answers = await this.testAnswerRepository.findBySessionId(session.id);

    // Validate completeness
    if (answers.length !== 60) {
      throw new TestIncompleteError(
        scoringService.validateCompleteness(answers)
      );
    }

    // Calculate result
    const result = scoringService.calculateResult(answers);

    // Calculate duration
    const completedAt = new Date();
    const durationSeconds = session.startedAt
      ? Math.floor((completedAt.getTime() - session.startedAt.getTime()) / 1000)
      : 0;

    // Update session
    await this.testSessionRepository.updateById(session.id, {
      status: SessionStatus.COMPLETED,
      completedAt,
      durationSeconds,
      resultType: result.typeCode,
      resultScores: {
        EI: result.dimensionScores.EI,
        SN: result.dimensionScores.SN,
        TF: result.dimensionScores.TF,
        JP: result.dimensionScores.JP,
      } as Record<string, number>,
    });

    // Increment user test count
    if (session.userId) {
      await this.userService.incrementTestCount(session.userId);
    }

    // Generate report
    const reportResult = await this.reportService.generateReport(session.id, sessionToken);

    return {
      sessionId: session.id,
      reportId: reportResult.reportId,
      mbtiType: result.typeCode,
      shareToken: reportResult.shareToken,
      reportUrl: `/report/${reportResult.reportId}`,
    };
  }

  /**
   * Helper: Get session by token
   */
  private async getSessionByToken(sessionToken: string): Promise<TestSession> {
    // Direct database lookup (skip cache for now to debug)
    const session = await this.testSessionRepository.findByToken(sessionToken);

    if (!session) {
      console.log(`[DEBUG] Session not found for token: ${sessionToken}`);
      throw new SessionNotFoundError();
    }

    console.log(`[DEBUG] Found session: ID=${session.id}, Token=${session.sessionToken}`);
    return session;
  }

  /**
   * Helper: Update session cache
   */
  private async updateSessionCache(
    sessionToken: string,
    updates: Partial<{ currentQuestion: number; answeredCount: number }>
  ) {
    const cached = await this.cacheService.get<any>(`session:${sessionToken}`);
    if (cached) {
      await this.cacheService.set(
        `session:${sessionToken}`,
        { ...cached, ...updates },
        config.session.tokenTTL
      );
    }
  }

  /**
   * Helper: Format question
   */
  private formatQuestion(question: Question) {
    // Manually construct options array with proper structure
    const options = [
      { label: 'A', text: question.optionA, score: question.scoreA },
      { label: 'B', text: question.optionB, score: question.scoreB }
    ];

    return {
      id: question.id,
      questionId: question.questionId,
      dimension: question.dimension,
      dimensionLabel: this.getDimensionLabel(question.dimension),
      dimensionOrder: question.dimensionOrder,
      question: question.questionText,
      options: options,
      optionLabels: ['A', 'B'],
      scores: [question.scoreA, question.scoreB],
    };
  }

  /**
   * Helper: Format question with progress
   */
  private formatQuestionWithProgress(
    question: Question,
    currentQuestion: number,
    answeredCount: number
  ) {
    return {
      ...this.formatQuestion(question),
      questionNumber: currentQuestion + 1,
      progress: {
        current: currentQuestion + 1,
        total: 60,
        percentage: Math.round((answeredCount / 60) * 100),
        answered: answeredCount,
      },
    };
  }

  /**
   * Helper: Get dimension label
   */
  private getDimensionLabel(dimension: string): string {
    const labels: Record<string, string> = {
      EI: '外向 / 内向',
      SN: '实感 / 直觉',
      TF: '思考 / 情感',
      JP: '判断 / 感知',
    };
    return labels[dimension] || dimension;
  }

  /**
   * Get recent test sessions (admin)
   */
  async getRecentSessions(limit: number = 50) {
    const sessions = await this.testSessionRepository.findRecent(limit);

    return {
      total: sessions.length,
      sessions: sessions.map((session) => ({
        sessionId: session.sessionToken,
        userId: session.userId,
        status: session.status,
        currentQuestion: session.currentQuestion,
        startedAt: session.createdAt,
        completedAt: session.completedAt,
        durationSeconds: session.completedAt
          ? Math.floor((new Date(session.completedAt).getTime() - new Date(session.createdAt).getTime()) / 1000)
          : null,
      })),
    };
  }
}

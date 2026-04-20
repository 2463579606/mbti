/**
 * AI Analysis Service
 * Core business logic for AI-powered personality analysis
 */

import { Injectable, NotFoundException, ForbiddenException, Inject } from '@nestjs/common';
import { AIAnalysisRepository } from '../repository/ai-analysis.repository';
import { TestReportRepository } from '../../repository/repositories';
import { UserRepository } from '../../repository/repositories';
import {
  AIAnalysisRecord,
  AnalysisStatus,
  AnalysisType,
  CreateAnalysisDTO,
} from '../entities/ai-analysis.entity';
import {
  AnalysisTaskResponse,
  AnalysisStatusResponse,
  AIAnalysisResultResponse,
  ListAnalysisQueryDTO,
  CreateAnalysisRequestDTO,
} from '../dto/create-analysis.dto';
import { SessionNotFoundError } from '../../../pkg/errors/errors';
import { getAIClient } from '../../../pkg/openai/openai-client';
import { TestSessionRepository } from '../../repository/test-session.repository';
// import { AIQueueService } from '../../queue/ai-queue.service';  // Temporarily disabled
// import { AICacheService } from './ai-cache.service';  // Temporarily disabled
import { getAIConfig } from '../../../config/ai.config';

@Injectable()
export class AIAnalysisService {
  constructor(
    private readonly aiAnalysisRepository: AIAnalysisRepository,
    private readonly testReportRepository: TestReportRepository,
    private readonly userRepository: UserRepository,
    private readonly testSessionRepository: TestSessionRepository,
    // private readonly aiQueueService: AIQueueService,  // Temporarily disabled
    // private readonly aiCacheService: AICacheService,  // Temporarily disabled
  ) {}

  /**
   * Create AI analysis task
   */
  async createAnalysis(
    reportId: number,
    sessionToken: string,
    dto: CreateAnalysisRequestDTO
  ): Promise<AnalysisTaskResponse> {
    // 1. Verify session and get user
    const session = await this.testSessionRepository.findByToken(sessionToken);
    if (!session) {
      throw new SessionNotFoundError();
    }

    // 2. Verify report exists
    const report = await this.testReportRepository.findById(reportId);
    if (!report) {
      throw new NotFoundException('Report not found');
    }

    // 3. Check if user has permission
    if (session.userId && report.userId !== session.userId) {
      throw new ForbiddenException('You do not have permission to access this report');
    }

    const analysisType = dto.analysisType || AnalysisType.COMPREHENSIVE;

    // 4. Check cache for existing analysis (TEMPORARILY DISABLED)
    // TODO: Re-enable cache service when dependencies are resolved
    /*
    if (!dto.forceRegenerate) {
      const cachedAnalysis = await this.aiCacheService.getCachedAnalysis(reportId, analysisType);
      if (cachedAnalysis) {
        const existingAnalysis = await this.aiAnalysisRepository.findById(cachedAnalysis.analysisId);
        if (existingAnalysis && existingAnalysis.status === AnalysisStatus.COMPLETED) {
          console.log('✅ Returning cached analysis for report', reportId);
          return this.mapToTaskResponse(existingAnalysis);
        }
      }

      const inputData = await this.prepareInputData(report);
      const similarAnalysis = await this.aiCacheService.findSimilarAnalysis(
        inputData.mbtiType,
        inputData.dimensionScores,
        analysisType
      );

      if (similarAnalysis) {
        const clonedAnalysis = await this.cloneAnalysis(similarAnalysis, reportId, session.userId);
        console.log('✅ Cloned similar analysis for report', reportId);
        return this.mapToTaskResponse(clonedAnalysis);
      }
    }
    */

    // 5. Check if analysis already exists in database (unless forceRegenerate)
    const existingAnalysis = await this.aiAnalysisRepository.findByReportId(
      reportId,
      analysisType
    );

    if (existingAnalysis && !dto.forceRegenerate) {
      if (existingAnalysis.status === AnalysisStatus.COMPLETED) {
        // Return existing completed analysis
        return this.mapToTaskResponse(existingAnalysis);
      } else if (existingAnalysis.status === AnalysisStatus.PROCESSING) {
        // Return existing processing task
        return this.mapToTaskResponse(existingAnalysis);
      }
    }

    // 6. Prepare input data
    const inputData = await this.prepareInputData(report);

    // 8. Create new analysis task
    const analysisRecord = await this.aiAnalysisRepository.create({
      reportId,
      userId: session.userId || undefined,
      analysisType,
      inputData: {
        ...inputData,
        userContext: dto.userContext || {},
      },
    });

    // 8. Queue the task for background processing (TEMPORARILY DISABLED)
    // TODO: Re-enable queue service when dependencies are resolved
    // await this.aiQueueService.addAnalysisTask(analysisRecord.id, reportId);

    // TEMPORARY: Don't process automatically, let user manually trigger
    // This will be changed back to async processing once queue is ready
    console.log('✅ Analysis task created:', analysisRecord.id);

    return {
      taskId: analysisRecord.id.toString(),
      reportId,
      status: AnalysisStatus.PENDING,
      estimatedTime: this.estimateTime(analysisType),
      createdAt: analysisRecord.createdAt.toISOString(),
    };
  }

  /**
   * Clone an existing analysis for a new report (TEMPORARILY DISABLED)
   * TODO: Re-enable this method when cache service is integrated
   */
  /*
  private async cloneAnalysis(
    sourceEntry: any,
    targetReportId: number,
    userId?: number
  ): Promise<AIAnalysisRecord> {
    // Get the source analysis
    const sourceAnalysis = await this.aiAnalysisRepository.findById(sourceEntry.analysisId);
    if (!sourceAnalysis || !sourceAnalysis.analysisContent) {
      throw new Error('Source analysis not found or incomplete');
    }

    // Create a new analysis record with cloned content
    const clonedAnalysis = await this.aiAnalysisRepository.create({
      reportId: targetReportId,
      userId,
      analysisType: sourceAnalysis.analysisType,
      inputData: { ...sourceAnalysis.inputData },
      status: AnalysisStatus.COMPLETED,
      analysisContent: { ...sourceAnalysis.analysisContent },
      modelName: sourceAnalysis.modelName,
      modelVersion: sourceAnalysis.modelVersion,
      tokensUsed: 0, // No cost for cloned analysis
      processingTimeMs: 0,
    });

    // Cache the cloned analysis
    await this.aiCacheService.cacheAnalysis(
      clonedAnalysis.id,
      targetReportId,
      sourceAnalysis.inputData.mbtiType,
      sourceAnalysis.inputData.dimensionScores,
      sourceAnalysis.analysisType
    );

    return clonedAnalysis;
  }
  */

  /**
   * Get analysis task status
   */
  async getAnalysisStatus(taskId: string): Promise<AnalysisStatusResponse> {
    const analysisId = parseInt(taskId, 10);
    const analysis = await this.aiAnalysisRepository.findById(analysisId);

    if (!analysis) {
      throw new NotFoundException('Analysis task not found');
    }

    const response: AnalysisStatusResponse = {
      taskId,
      status: analysis.status,
      createdAt: analysis.createdAt.toISOString(),
    };

    if (analysis.status === AnalysisStatus.PROCESSING) {
      // Calculate progress based on elapsed time
      const elapsed = Date.now() - analysis.updatedAt.getTime();
      const estimatedTime = this.estimateTime(analysis.analysisType) * 1000;
      response.progress = Math.min(Math.floor((elapsed / estimatedTime) * 100), 95);
      response.stage = this.getProcessingStage(analysis.analysisType);
    }

    if (analysis.completedAt) {
      response.completedAt = analysis.completedAt.toISOString();
    }

    if (analysis.status === AnalysisStatus.FAILED) {
      response.error = analysis.errorMessage || 'Analysis failed';
    }

    return response;
  }

  /**
   * Get AI analysis result
   */
  async getAnalysisResult(
    reportId: number,
    sessionToken: string
  ): Promise<AIAnalysisResultResponse> {
    // 1. Verify session
    const session = await this.testSessionRepository.findByToken(sessionToken);
    if (!session) {
      throw new SessionNotFoundError();
    }

    // 2. Find analysis
    const analysis = await this.aiAnalysisRepository.findByReportId(
      reportId,
      AnalysisType.COMPREHENSIVE
    );

    if (!analysis) {
      throw new NotFoundException('Analysis not found. Please create an analysis task first.');
    }

    // 3. Check permission
    if (session.userId && analysis.userId !== session.userId) {
      throw new ForbiddenException('You do not have permission to access this analysis');
    }

    // 4. Return based on status
    if (analysis.status === AnalysisStatus.COMPLETED) {
      return {
        reportId,
        analysisId: analysis.id,
        analysisType: analysis.analysisType,
        content: analysis.analysisContent,
        metadata: {
          model: analysis.modelName || 'unknown',
          modelVersion: analysis.modelVersion || undefined,
          generatedAt: analysis.completedAt?.toISOString(),
          tokensUsed: analysis.tokensUsed,
          processingTimeMs: analysis.processingTimeMs,
        },
      };
    } else if (analysis.status === AnalysisStatus.PROCESSING) {
      throw new Error('Analysis is still processing. Please check status later.');
    } else if (analysis.status === AnalysisStatus.FAILED) {
      throw new Error(`Analysis failed: ${analysis.errorMessage}`);
    } else {
      throw new Error('Analysis is pending. Please wait...');
    }
  }

  /**
   * Get user's analysis history
   */
  async getUserHistory(
    sessionToken: string,
    query: ListAnalysisQueryDTO
  ) {
    const session = await this.testSessionRepository.findByToken(sessionToken);
    if (!session) {
      throw new SessionNotFoundError();
    }

    if (!session.userId) {
      // Anonymous users - return empty
      return {
        total: 0,
        analyses: [],
      };
    }

    const analyses = await this.aiAnalysisRepository.findByUserId(
      session.userId,
      query.limit || 10
    );

    return {
      total: analyses.length,
      analyses: analyses.map((analysis) => ({
        analysisId: analysis.id,
        reportId: analysis.reportId,
        type: analysis.analysisType,
        status: analysis.status,
        createdAt: analysis.createdAt,
        completedAt: analysis.completedAt,
      })),
    };
  }

  /**
   * Get AI usage statistics
   */
  async getStats(sessionToken: string) {
    const session = await this.testSessionRepository.findByToken(sessionToken);
    if (!session) {
      throw new SessionNotFoundError();
    }

    if (!session.userId) {
      return {
        totalAnalyses: 0,
        completedAnalyses: 0,
        totalTokensUsed: 0,
      };
    }

    const completedCount = await this.aiAnalysisRepository.countByUser(session.userId);
    const analyses = await this.aiAnalysisRepository.findByUserId(session.userId, 100);
    const totalTokens = analyses.reduce((sum, a) => sum + (a.tokensUsed || 0), 0);

    return {
      totalAnalyses: completedCount,
      completedAnalyses: completedCount,
      totalTokensUsed: totalTokens,
      // For coding plan users, cost is 0
      estimatedCost: 0,
    };
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<boolean> {
    try {
      const client = getAIClient();
      return await client.healthCheck();
    } catch {
      return false;
    }
  }

  /**
   * Prepare input data from report
   */
  private async prepareInputData(report: any): Promise<any> {
    // Extract data from report
    return {
      mbtiType: report.mbtiType || 'UNKNOWN',
      dimensionScores: report.resultScores || {},
      percentages: report.resultScores || {},
      answerSummary: 'MBTI personality test completed',
      answerCount: 60,
      completedAt: report.completedAt || new Date(),
    };
  }

  /**
   * Estimate processing time (seconds)
   */
  private estimateTime(analysisType?: AnalysisType): number {
    const config = getAIConfig();
    const baseTime = config.queueEnabled ? 30 : 10; // Base time in seconds

    switch (analysisType) {
      case AnalysisType.COMPREHENSIVE:
        return baseTime * 2;
      case AnalysisType.CAREER:
      case AnalysisType.RELATIONSHIP:
      case AnalysisType.GROWTH:
        return baseTime;
      default:
        return baseTime;
    }
  }

  /**
   * Get processing stage description
   */
  private getProcessingStage(type: AnalysisType): string {
    switch (type) {
      case AnalysisType.COMPREHENSIVE:
        return '正在生成深度性格分析...';
      case AnalysisType.CAREER:
        return '正在生成职业发展建议...';
      case AnalysisType.RELATIONSHIP:
        return '正在生成人际关系分析...';
      case AnalysisType.GROWTH:
        return '正在生成个人成长规划...';
      default:
        return '正在分析中...';
    }
  }

  /**
   * Map analysis record to task response
   */
  private mapToTaskResponse(analysis: AIAnalysisRecord): AnalysisTaskResponse {
    return {
      taskId: analysis.id.toString(),
      reportId: analysis.reportId,
      status: analysis.status,
      estimatedTime: this.estimateTime(analysis.analysisType),
      createdAt: analysis.createdAt.toISOString(),
    };
  }
}

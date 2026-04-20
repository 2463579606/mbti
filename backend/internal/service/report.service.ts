/**
 * Report Service
 */

import { Injectable, NotFoundException } from '@nestjs/common';
import { TestReport, TestSession, TestAnswer } from '../entities';
import {
  TestReportRepository,
  TestSessionRepository,
  MBTITypeRepository,
  TestAnswerRepository,
} from '../repository/repositories';
import { generateShareToken } from '../../pkg/utils/token';
import { formatDuration } from '../../pkg/utils/time';
import { scoringService } from './scoring.service';
import { ErrorCode } from '../../pkg/errors/errors';
import { CacheService } from '../../pkg/cache/cache.service';
import { config } from '../../config/config';
import { ReportDetail, DimensionScore } from '../domain/entities';

@Injectable()
export class ReportService {
  constructor(
    private readonly testReportRepository: TestReportRepository,
    private readonly testSessionRepository: TestSessionRepository,
    private readonly mbtiTypeRepository: MBTITypeRepository,
    private readonly testAnswerRepository: TestAnswerRepository,
    private readonly cacheService: CacheService
  ) {}

  /**
   * Generate report after test completion
   */
  async generateReport(sessionId: number, sessionToken: string) {
    const session = await this.testSessionRepository.findById(sessionId);
    if (!session) {
      throw new NotFoundException(ErrorCode.SESSION_NOT_FOUND);
    }

    // Get MBTI type details
    const mbtiType = await this.mbtiTypeRepository.findByCode(session.resultType!);
    if (!mbtiType) {
      throw new NotFoundException(ErrorCode.INVALID_PARAMS);
    }

    // Get dimension scores
    const dimensionScores = session.resultScores!;

    // Calculate percentages
    const percentages: Record<string, number> = {
      EI: Math.round((dimensionScores.EI / 30) * 100),
      SN: Math.round((dimensionScores.SN / 30) * 100),
      TF: Math.round((dimensionScores.TF / 30) * 100),
      JP: Math.round((dimensionScores.JP / 30) * 100),
    };

    // Create dimension details
    const dimensionDetails = this.buildDimensionDetails(percentages);

    // Create report
    const shareToken = generateShareToken();
    const report = await this.testReportRepository.create({
      sessionId,
      userId: session.userId,
      mbtiType: session.resultType!,
      eiScore: percentages.EI,
      snScore: percentages.SN,
      tfScore: percentages.TF,
      jpScore: percentages.JP,
      dimensionDetails,
      personalityAnalysis: null,
      shareToken,
      shareCount: 0,
    });

    // Don't cache here - let getReport build and cache the proper detail object
    // The cache will be populated on first call to getReport

    return {
      reportId: report.id,
      sessionId,
      mbtiType: session.resultType,
      shareToken,
      reportUrl: `/share/${shareToken}`,
    };
  }

  /**
   * Get report by ID
   */
  async getReport(reportId: number): Promise<ReportDetail> {
    // Try cache first
    const cached = await this.cacheService.get<ReportDetail>(`report:${reportId}`);
    if (cached) {
      return cached;
    }

    const report = await this.testReportRepository.findById(reportId);
    if (!report) {
      throw new NotFoundException(ErrorCode.REPORT_NOT_FOUND);
    }

    const session = await this.testSessionRepository.findById(report.sessionId);
    const mbtiType = await this.mbtiTypeRepository.findByCode(report.mbtiType);

    if (!session || !mbtiType) {
      throw new NotFoundException(ErrorCode.REPORT_NOT_FOUND);
    }

    const detail = await this.buildReportDetail(report, session, mbtiType);

    // Cache report
    await this.cacheService.set(`report:${reportId}`, detail, config.cache.reports);

    return detail;
  }

  /**
   * Get shared report (public access)
   */
  async getSharedReport(shareToken: string) {
    const report = await this.testReportRepository.findByShareToken(shareToken);
    if (!report) {
      throw new NotFoundException(ErrorCode.REPORT_NOT_FOUND);
    }

    const session = await this.testSessionRepository.findById(report.sessionId);
    const mbtiType = await this.mbtiTypeRepository.findByCode(report.mbtiType);

    if (!session || !mbtiType) {
      throw new NotFoundException(ErrorCode.REPORT_NOT_FOUND);
    }

    // Increment share count
    await this.testReportRepository.incrementShareCount(report.id);

    // Return limited data (no sensitive info)
    return {
      mbtiType: {
        code: mbtiType.code,
        name: mbtiType.name,
        emoji: mbtiType.emoji,
        group: mbtiType.groupName,
        headline: mbtiType.headline,
        tagline: mbtiType.tagline,
      },
      dimensions: this.buildDimensionScores(report),
      strengths: mbtiType.strengths,
      weaknesses: mbtiType.weaknesses,
      compatibility: {
        best: await this.getMBTITypeDetails(mbtiType.bestMatch),
        challenging: await this.getMBTITypeDetails(mbtiType.challengingMatch),
      },
      careers: mbtiType.careers,
      famousPeople: mbtiType.famousPeople,
    };
  }

  /**
   * Get user's test history
   */
  async getUserReports(userId: number, page = 1, limit = 10) {
    const reports = await this.testReportRepository.findByUserId(userId, limit);

    const history = await Promise.all(
      reports.map(async (report) => {
        const mbtiType = await this.mbtiTypeRepository.findByCode(report.mbtiType);
        return {
          sessionId: report.sessionId,
          reportId: report.id,
          mbtiType: {
            code: mbtiType!.code,
            name: mbtiType!.name,
            emoji: mbtiType!.emoji,
          },
          completedAt: report.createdAt,
          shareUrl: report.shareToken ? `/share/${report.shareToken}` : null,
        };
      })
    );

    return {
      total: history.length,
      page,
      limit,
      tests: history,
    };
  }

  /**
   * Helper: Build report detail
   */
  private async buildReportDetail(
    report: TestReport,
    session: TestSession,
    mbtiType: any
  ): Promise<ReportDetail> {
    return {
      reportId: report.id,
      sessionId: report.sessionId,
      mbtiType: {
        code: mbtiType.code,
        name: mbtiType.name,
        emoji: mbtiType.emoji,
        headline: mbtiType.headline || '',
        tagline: mbtiType.tagline || '',
      } as any,
      dimensions: this.buildDimensionScores(report),
      strengths: mbtiType.strengths || [],
      weaknesses: mbtiType.weaknesses || [],
      compatibility: {
        best: mbtiType.bestMatch || [],
        challenging: mbtiType.challengingMatch || [],
      },
      careers: mbtiType.careers,
      famousPeople: mbtiType.famousPeople,
      testInfo: {
        startedAt: session.startedAt,
        completedAt: session.completedAt || session.createdAt,
        durationSeconds: session.durationSeconds || 0,
        durationFormatted: formatDuration(session.durationSeconds || 0),
      },
      share: {
        token: report.shareToken || '',
        url: report.shareToken ? `/share/${report.shareToken}` : '',
      },
    };
  }

  /**
   * Helper: Build dimension scores
   */
  private buildDimensionScores(report: TestReport): DimensionScore[] {
    const dimensionInfo: Array<{
      key: string;
      left: string;
      right: string;
      percentage: number;
    }> = [
      { key: 'EI', left: '外向 (E)', right: '内向 (I)', percentage: report.eiScore },
      { key: 'SN', left: '实感 (S)', right: '直觉 (N)', percentage: report.snScore },
      { key: 'TF', left: '思考 (T)', right: '情感 (F)', percentage: report.tfScore },
      { key: 'JP', left: '判断 (J)', right: '感知 (P)', percentage: report.jpScore },
    ];

    return dimensionInfo.map((info) => {
      const leftPercentage = info.percentage;
      const rightPercentage = 100 - info.percentage;

      let description: string;
      if (info.percentage >= 50) {
        description = `${info.left.split(' ')[0]}倾向 ${leftPercentage}%`;
      } else {
        description = `${info.right.split(' ')[0]}倾向 ${rightPercentage}%`;
      }

      return {
        key: info.key,
        left: info.left,
        right: info.right,
        percentage: info.percentage,
        leftPercentage,
        rightPercentage,
        description,
      };
    });
  }

  /**
   * Helper: Build dimension details
   */
  private buildDimensionDetails(percentages: Record<string, number>) {
    const details: Record<string, any> = {};

    for (const [key, percentage] of Object.entries(percentages)) {
      details[key] = {
        percentage,
        left: Math.round(percentage),
        right: Math.round(100 - percentage),
      };
    }

    return details;
  }

  /**
   * Helper: Get MBTI type details
   */
  private async getMBTITypeDetails(codes: string[]) {
    const types = await this.mbtiTypeRepository.findByCodes(codes);

    return types.map((type) => ({
      code: type.code,
      name: type.name,
      emoji: type.emoji,
    }));
  }
}

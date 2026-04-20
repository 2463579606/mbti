/**
 * Statistics Service
 * Handles data aggregation and analytics
 */

import { Injectable } from '@nestjs/common';
import { TestReportRepository, QuestionRepository, TestSessionRepository } from '../repository/repositories';
import { CacheService } from '../../pkg/cache/cache.service';
import { config } from '../../config/config';

@Injectable()
export class StatisticsService {
  constructor(
    private readonly testReportRepository: TestReportRepository,
    private readonly questionRepository: QuestionRepository,
    private readonly testSessionRepository: TestSessionRepository,
    private readonly cacheService: CacheService
  ) {}

  /**
   * Get global statistics
   */
  async getGlobalStatistics(range: '1d' | '7d' | '30d' | 'all' = 'all') {
    const cacheKey = `stats:global:${range}`;

    // Try cache first
    const cached = await this.cacheService.get<any>(cacheKey);
    if (cached) {
      return cached;
    }

    // Get all reports
    const reports = await this.testReportRepository.getStatistics() || {};
    const totalTests = Object.values(reports).reduce((sum, count) => sum + count, 0);

    // Calculate type distribution
    const typeDistribution = Object.entries(reports).map(([code, count]) => ({
      code,
      count,
      percentage: totalTests > 0 ? Math.round((count / totalTests) * 100) : 0,
    }));

    // Sort by count (if array is not empty)
    if (typeDistribution.length > 0) {
      typeDistribution.sort((a, b) => b.count - a.count);
    }

    // Get dimension stats
    const dimensionStats = await this.calculateDimensionStats();

    const result = {
      summary: {
        totalTests,
        uniqueUsers: totalTests, // Approximate
        completionRate: 0.85, // TODO: calculate from actual data
        avgDuration: 850,
      },
      typeDistribution,
      dimensionStats,
    };

    // Cache for 5 minutes
    await this.cacheService.set(cacheKey, result, config.cache.stats);

    return result;
  }

  /**
   * Get daily statistics
   */
  async getDailyStatistics(date?: string) {
    const targetDate = date || new Date().toISOString().split('T')[0];

    // TODO: Query from daily_statistics table
    // For now, return calculated data
    const reports = await this.testReportRepository.getStatistics() || {};
    const totalTests = Object.values(reports).reduce((sum, count) => sum + count, 0);

    return {
      date: targetDate,
      testCount: totalTests,
      completeCount: Math.floor(totalTests * 0.85),
      uniqueUsers: Math.floor(totalTests * 0.9),
      avgDuration: 850,
      typeDistribution: reports,
    };
  }

  /**
   * Get question statistics
   */
  async getQuestionStatistics() {
    const total = await this.questionRepository.count();
    const active = await this.questionRepository.countActive();

    const byDimension: Record<string, number> = {
      EI: 0,
      SN: 0,
      TF: 0,
      JP: 0,
    };

    const allQuestions = await this.questionRepository.findAll();
    for (const q of allQuestions) {
      byDimension[q.dimension]++;
    }

    return {
      total,
      active,
      inactive: total - active,
      byDimension,
    };
  }

  /**
   * Get type distribution ranking
   */
  async getTypeDistributionRanking(limit = 16) {
    const stats = await this.testReportRepository.getStatistics() || {};

    const sorted = Object.entries(stats)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .map(([code, count]) => ({
        code,
        count,
        rank: 0,
      }));

    // Add rank
    sorted.forEach((item, index) => {
      item.rank = index + 1;
    });

    return sorted;
  }

  /**
   * Calculate dimension statistics
   */
  private async calculateDimensionStats() {
    // TODO: Calculate average scores from all reports
    return {
      E: 45,
      I: 55,
      S: 52,
      N: 48,
      T: 49,
      F: 51,
      J: 53,
      P: 47,
    };
  }

  /**
   * Clear statistics cache
   */
  async clearStatsCache() {
    await this.cacheService.delPattern('stats:*');
  }
}

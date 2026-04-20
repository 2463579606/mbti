/**
 * User Controller
 * Handles user-related endpoints
 */

import { Controller, Get, Query, UseGuards, Req } from '@nestjs/common';
// import { ThrottlerGuard } from '@nestjs/throttler';  // Temporarily disabled
import { UserService } from '../service/user.service';
import { ReportService } from '../service/report.service';
import { successResponse, paginatedResponse } from '../../pkg/response/response';
import { JwtAuthGuard } from '../guards/jwt.guard';

@Controller('user')
@UseGuards(JwtAuthGuard)  // ThrottlerGuard temporarily disabled
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly reportService: ReportService
  ) {}

  /**
   * Get user test history
   * GET /api/v1/user/tests
   */
  @Get('tests')
  async getTestHistory(
    @Req() req: any,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10'
  ) {
    const userId = req.user?.id;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    const reports = await this.reportService.getUserReports(userId, pageNum, limitNum);

    return successResponse({
      total: reports.total || 0,
      page: pageNum,
      limit: limitNum,
      tests: reports,
    });
  }

  /**
   * Get user statistics
   * GET /api/v1/user/statistics
   */
  @Get('statistics')
  async getStatistics(@Req() req: any) {
    const userId = req.user?.id;

    const stats = await this.userService.getStatistics(userId);
    const reportsData = await this.reportService.getUserReports(userId, 100);

    // Calculate type distribution
    const typeCounts: Record<string, number> = {};
    for (const report of reportsData.tests) {
      const type = report.mbtiType.code;
      typeCounts[type] = (typeCounts[type] || 0) + 1;
    }

    // Find most common type
    let mostCommonType = null;
    let maxCount = 0;
    for (const [type, count] of Object.entries(typeCounts)) {
      if (count > maxCount) {
        maxCount = count;
        mostCommonType = type;
      }
    }

    return successResponse({
      totalTests: stats.totalTests || 0,
      mostCommonType: mostCommonType,
      typeDistribution: Object.entries(typeCounts).map(([code, count]) => ({
        code,
        name: this.getTypeName(code),
        count,
      })),
      avgDuration: 850, // TODO: calculate from actual data
      lastTestAt: stats.lastTestAt,
    });
  }

  /**
   * Helper: Get type name in Chinese
   */
  private getTypeName(code: string): string {
    const typeNames: Record<string, string> = {
      'INTJ': '建筑师',
      'INTP': '逻辑学家',
      'ENTJ': '指挥官',
      'ENTP': '辩论家',
      'INFJ': '提倡者',
      'INFP': '调停者',
      'ENFJ': '主人公',
      'ENFP': '竞选者',
      'ISTJ': '检查员',
      'ISFJ': '守护者',
      'ESTJ': '总经理',
      'ESFJ': '执政官',
      'ISTP': '鉴赏家',
      'ISFP': '探险家',
      'ESTP': '企业家',
      'ESFP': '表演者',
    };
    return typeNames[code] || code;
  }
}

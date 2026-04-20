/**
 * AI Analysis Controller
 * Handles all AI analysis related API endpoints
 */

import { Controller, Post, Get, Body, Param, Query, Req, UseGuards } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { AIAnalysisService } from '../service/ai-analysis.service';
import {
  CreateAnalysisRequestDTO,
  AnalysisTaskResponse,
  AnalysisStatusResponse,
  AIAnalysisResultResponse,
  ListAnalysisQueryDTO,
} from '../dto/create-analysis.dto';
import { successResponse } from '../../../pkg/response/response';

/**
 * Extract session token from Authorization header
 */
function extractSessionToken(authHeader: string | undefined): string {
  if (!authHeader) {
    throw new Error('Authorization header missing');
  }
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    throw new Error('Invalid Authorization header format');
  }
  return parts[1];
}

@Controller('ai')
// @UseGuards(ThrottlerGuard)  // Enable rate limiting in production
export class AIAnalysisController {
  constructor(private readonly aiAnalysisService: AIAnalysisService) {}

  /**
   * Create AI analysis task
   * POST /api/v1/ai/analysis/:reportId
   */
  @Post('analysis/:reportId')
  async createAnalysis(
    @Param('reportId') reportIdStr: string,
    @Body() dto: CreateAnalysisRequestDTO,
    @Req() req: any
  ) {
    const reportId = parseInt(reportIdStr, 10);
    const sessionToken = extractSessionToken(req.headers.authorization);

    const result: AnalysisTaskResponse = await this.aiAnalysisService.createAnalysis(
      reportId,
      sessionToken,
      dto
    );

    return successResponse(result);
  }

  /**
   * Get analysis task status
   * GET /api/v1/ai/analysis/status/:taskId
   */
  @Get('analysis/status/:taskId')
  async getAnalysisStatus(@Param('taskId') taskId: string) {
    const result: AnalysisStatusResponse = await this.aiAnalysisService.getAnalysisStatus(
      taskId
    );

    return successResponse(result);
  }

  /**
   * Get AI analysis result
   * GET /api/v1/ai/result/:reportId
   */
  @Get('result/:reportId')
  async getAnalysisResult(
    @Param('reportId') reportIdStr: string,
    @Req() req: any
  ) {
    const reportId = parseInt(reportIdStr, 10);
    const sessionToken = extractSessionToken(req.headers.authorization);

    const result: AIAnalysisResultResponse = await this.aiAnalysisService.getAnalysisResult(
      reportId,
      sessionToken
    );

    return successResponse(result);
  }

  /**
   * Get user's analysis history
   * GET /api/v1/ai/history
   */
  @Get('history')
  async getUserHistory(
    @Req() req: any,
    @Query() query: ListAnalysisQueryDTO
  ) {
    const sessionToken = extractSessionToken(req.headers.authorization);

    const result = await this.aiAnalysisService.getUserHistory(
      sessionToken,
      query
    );

    return successResponse(result);
  }

  /**
   * Delete analysis record
   * DELETE /api/v1/ai/analysis/:analysisId
   */
  // @Delete('analysis/:analysisId')
  // async deleteAnalysis(
  //   @Param('analysisId') analysisIdStr: string,
  //   @Req() req: any
  // ) {
  //   const analysisId = parseInt(analysisIdStr, 10);
  //   const sessionToken = extractSessionToken(req.headers.authorization);

  //   await this.aiAnalysisService.deleteAnalysis(
  //     analysisId,
  //     sessionToken
  //   );

  //   return successResponse({ deleted: true });
  // }

  /**
   * Get AI usage statistics
   * GET /api/v1/ai/stats
   */
  @Get('stats')
  async getStats(@Req() req: any) {
    const sessionToken = extractSessionToken(req.headers.authorization);

    const result = await this.aiAnalysisService.getStats(sessionToken);

    return successResponse(result);
  }

  /**
   * Health check for AI service
   * GET /api/v1/ai/health
   */
  @Get('health')
  async healthCheck() {
    const isHealthy = await this.aiAnalysisService.healthCheck();

    return successResponse({
      status: isHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
    });
  }
}

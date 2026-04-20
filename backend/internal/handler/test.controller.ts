/**
 * Test Controller
 * Handles all test-related API endpoints
 */

import { Controller, Post, Get, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
// import { ThrottlerGuard } from '@nestjs/throttler';  // Temporarily disabled
import { TestService } from '../service/test.service';
import { successResponse } from '../../pkg/response/response';

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

@Controller('test')
// @UseGuards(ThrottlerGuard)  // Temporarily disabled
export class TestController {
  constructor(private readonly testService: TestService) {}

  /**
   * Create test session
   * POST /api/v1/test/session
   */
  @Post('session')
  async createSession(
    @Body('userId') userId?: number,
    @Body('anonymousId') anonymousId?: string
  ) {
    const result = await this.testService.createSession(userId, anonymousId);
    return successResponse(result);
  }

  /**
   * Get questions
   * GET /api/v1/test/questions
   */
  @Get('questions')
  async getQuestions(
    @Query('start') start: string = '0',
    @Query('count') count: string = '10'
  ) {
    const result = await this.testService.getQuestions(
      parseInt(start),
      parseInt(count)
    );
    return successResponse(result);
  }

  /**
   * Get current question
   * GET /api/v1/test/question/current
   */
  @Get('question/current')
  async getCurrentQuestion(@Req() req: any) {
    const sessionToken = extractSessionToken(req.headers.authorization);
    const result = await this.testService.getCurrentQuestion(sessionToken);
    return successResponse(result);
  }

  /**
   * Submit answer
   * POST /api/v1/test/answer
   */
  @Post('answer')
  async submitAnswer(
    @Req() req: any,
    @Body() body: { questionId: number; selectedOption: number }
  ) {
    const sessionToken = extractSessionToken(req.headers.authorization);
    const result = await this.testService.submitAnswer(
      sessionToken,
      body.questionId,
      body.selectedOption
    );
    return successResponse(result);
  }

  /**
   * Submit answers (batch)
   * POST /api/v1/test/answers/batch
   */
  @Post('answers/batch')
  async submitAnswers(
    @Req() req: any,
    @Body('answers') answers: Array<{ questionId: number; option: number }>
  ) {
    const sessionToken = extractSessionToken(req.headers.authorization);
    const result = await this.testService.submitAnswers(sessionToken, answers);
    return successResponse(result);
  }

  /**
   * Get progress
   * GET /api/v1/test/progress
   */
  @Get('progress')
  async getProgress(@Req() req: any) {
    const sessionToken = extractSessionToken(req.headers.authorization);
    const result = await this.testService.getProgress(sessionToken);
    return successResponse(result);
  }

  /**
   * Complete test
   * POST /api/v1/test/complete
   */
  @Post('complete')
  async completeTest(@Req() req: any) {
    const sessionToken = extractSessionToken(req.headers.authorization);
    const result = await this.testService.completeTest(sessionToken);
    return successResponse(result);
  }
}

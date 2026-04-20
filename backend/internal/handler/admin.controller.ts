/**
 * Admin Controller
 * Handles admin dashboard operations
 */

import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard, Public } from '../guards/jwt.guard';
import { StatisticsService } from '../service/statistics.service';
import { QuestionService } from '../service/question.service';
import { UserService } from '../service/user.service';
import { TestService } from '../service/test.service';
import { CacheService } from '../../pkg/cache/cache.service';

@Controller('admin')
@UseGuards(JwtAuthGuard)
export class AdminController {
  constructor(
    private readonly statisticsService: StatisticsService,
    private readonly questionService: QuestionService,
    private readonly userService: UserService,
    private readonly testService: TestService,
    private readonly cacheService: CacheService,
  ) {}

  /**
   * Get global statistics
   */
  @Get('statistics')
  async getGlobalStatistics(@Query('range') range: '7d' | 'all' | '1d' | '30d' = 'all') {
    return this.statisticsService.getGlobalStatistics(range);
  }

  /**
   * Get daily statistics
   */
  @Get('statistics/daily')
  async getDailyStatistics(@Query('date') date?: string) {
    return this.statisticsService.getDailyStatistics(date);
  }

  /**
   * Get all questions (admin)
   */
  @Get('questions')
  async getAllQuestions() {
    const result = await this.questionService.getAllQuestions();
    const stats = await this.questionService.getQuestionStatistics();

    return {
      total: stats.total,
      active: stats.active,
      inactive: stats.inactive,
      byDimension: stats.byDimension,
      questions: result.questions.map((q) => ({
        id: q.questionId,
        dimension: q.dimension,
        dimensionOrder: q.dimensionOrder,
        question: q.question,
        options: q.options,
        scores: q.scores,
        isActive: q.isActive,
      })),
    };
  }

  /**
   * Get question by ID (admin)
   */
  @Get('questions/:id')
  async getQuestionById(@Param('id') id: string) {
    const question = await this.questionService.getQuestionById(parseInt(id));
    return {
      id: question.questionId,
      dimension: question.dimension,
      dimensionOrder: question.dimensionOrder,
      question: question.question,
      options: question.options,
      scores: question.scores,
      isActive: question.isActive,
    };
  }

  /**
   * Update question (admin)
   */
  @Put('questions/:id')
  async updateQuestion(@Param('id') id: string, @Body() updateDto: any) {
    await this.questionService.updateQuestion(parseInt(id), updateDto);
    return this.getQuestionById(id);
  }

  /**
   * Get all users (admin)
   */
  @Get('users')
  async getAllUsers(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
    @Query('status') status?: string,
  ) {
    return this.userService.getAllUsers(parseInt(page), parseInt(limit), status);
  }

  /**
   * Update user status (admin)
   */
  @Put('users/:id/status')
  async updateUserStatus(@Param('id') id: string, @Body('status') status: string) {
    await this.userService.updateUserStatus(parseInt(id), status);
  }

  /**
   * Get recent test sessions (admin)
   */
  @Get('sessions')
  async getRecentSessions(@Query('limit') limit: string = '50') {
    return this.testService.getRecentSessions(parseInt(limit));
  }

  /**
   * Clear cache
   */
  @Post('cache/clear')
  async clearCache(@Body('type') type: string = 'all') {
    let clearedKeys = 0;

    if (type === 'all' || type === 'questions') {
      await this.cacheService.delPattern('questions:*');
      clearedKeys++;
    }

    if (type === 'all' || type === 'mbti_types') {
      await this.cacheService.delPattern('mbti_types:*');
      clearedKeys++;
    }

    if (type === 'all' || type === 'reports') {
      await this.cacheService.delPattern('report:*');
      clearedKeys++;
    }

    return {
      message: 'Cache cleared successfully',
      clearedKeys,
    };
  }

  /**
   * Get system health
   */
  @Get('health')
  @Public()
  async getHealth() {
    return {
      status: 'healthy',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    };
  }
}

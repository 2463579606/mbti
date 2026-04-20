/**
 * Report Controller
 */

import { Controller, Get, Param, UseGuards } from '@nestjs/common';
// import { ThrottlerGuard } from '@nestjs/throttler';  // Temporarily disabled
import { ReportService } from '../service/report.service';
import { successResponse } from '../../pkg/response/response';

@Controller('report')
// @UseGuards(ThrottlerGuard)  // Temporarily disabled
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  /**
   * Get report by ID
   * GET /api/v1/report/:id
   */
  @Get(':id')
  async getReport(@Param('id') id: string) {
    const result = await this.reportService.getReport(parseInt(id));
    return successResponse(result);
  }

  /**
   * Get shared report (public)
   * GET /api/v1/report/share/:token
   */
  @Get('share/:token')
  async getSharedReport(@Param('token') token: string) {
    const result = await this.reportService.getSharedReport(token);
    return successResponse(result);
  }
}

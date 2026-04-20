/**
 * AI Analysis Repository
 * Data access layer for AI analysis records
 */

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  AIAnalysisRecord,
  AnalysisStatus,
  AnalysisType,
  CreateAnalysisDTO,
  UpdateAnalysisStatusDTO,
  UpdateAnalysisContentDTO,
} from '../entities/ai-analysis.entity';

@Injectable()
export class AIAnalysisRepository {
  constructor(
    @InjectRepository(AIAnalysisRecord)
    private readonly repository: Repository<AIAnalysisRecord>,
  ) {}

  /**
   * Create a new analysis record
   */
  async create(dto: CreateAnalysisDTO): Promise<AIAnalysisRecord> {
    const record = this.repository.create({
      reportId: dto.reportId,
      userId: dto.userId || null,
      analysisType: dto.analysisType,
      inputData: dto.inputData,
      status: AnalysisStatus.PENDING,
    });

    return await this.repository.save(record);
  }

  /**
   * Find analysis record by ID
   */
  async findById(id: number): Promise<AIAnalysisRecord | null> {
    return await this.repository.findOne({
      where: { id },
      relations: ['report', 'user'],
    });
  }

  /**
   * Find analysis record by report ID
   */
  async findByReportId(
    reportId: number,
    analysisType?: AnalysisType
  ): Promise<AIAnalysisRecord | null> {
    const where: any = { reportId };

    if (analysisType) {
      where.analysisType = analysisType;
    }

    return await this.repository.findOne({
      where,
      relations: ['report', 'user'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Find all analysis records for a report
   */
  async findAllByReportId(reportId: number): Promise<AIAnalysisRecord[]> {
    return await this.repository.find({
      where: { reportId },
      relations: ['report', 'user'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Find analysis records by user ID
   */
  async findByUserId(
    userId: number,
    limit: number = 10
  ): Promise<AIAnalysisRecord[]> {
    return await this.repository.find({
      where: { userId },
      relations: ['report'],
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  /**
   * Find analysis records by status
   */
  async findByStatus(
    status: AnalysisStatus,
    limit: number = 50
  ): Promise<AIAnalysisRecord[]> {
    return await this.repository.find({
      where: { status },
      relations: ['report', 'user'],
      order: { createdAt: 'ASC' },
      take: limit,
    });
  }

  /**
   * Find processing records (for timeout checking)
   */
  async findProcessingRecords(olderThanMinutes: number = 30): Promise<AIAnalysisRecord[]> {
    const cutoffTime = new Date(Date.now() - olderThanMinutes * 60 * 1000);

    return await this.repository
      .createQueryBuilder('record')
      .where('record.status = :status', { status: AnalysisStatus.PROCESSING })
      .andWhere('record.updatedAt < :cutoffTime', { cutoffTime })
      .leftJoinAndSelect('record.report', 'report')
      .getMany();
  }

  /**
   * Update analysis status
   */
  async updateStatus(
    id: number,
    dto: UpdateAnalysisStatusDTO
  ): Promise<void> {
    await this.repository.update(id, {
      status: dto.status,
      errorMessage: dto.errorMessage,
      errorDetails: dto.errorDetails,
    });
  }

  /**
   * Update analysis content
   */
  async updateContent(
    id: number,
    dto: UpdateAnalysisContentDTO
  ): Promise<void> {
    const updateData: any = {
      status: dto.status,
      analysisContent: dto.analysisContent,
    };

    if (dto.modelName) updateData.modelName = dto.modelName;
    if (dto.modelVersion) updateData.modelVersion = dto.modelVersion;
    if (dto.tokensUsed !== undefined) updateData.tokensUsed = dto.tokensUsed;
    if (dto.processingTimeMs !== undefined) updateData.processingTimeMs = dto.processingTimeMs;
    if (dto.completedAt) updateData.completedAt = dto.completedAt;

    await this.repository.update(id, updateData);
  }

  /**
   * Delete analysis record
   */
  async delete(id: number): Promise<void> {
    await this.repository.delete(id);
  }

  /**
   * Count analysis records by status
   */
  async countByStatus(status: AnalysisStatus): Promise<number> {
    return await this.repository.count({
      where: { status },
    });
  }

  /**
   * Count analysis records by user
   */
  async countByUser(userId: number): Promise<number> {
    return await this.repository.count({
      where: { userId },
    });
  }

  /**
   * Get usage statistics for a date range
   */
  async getUsageStats(
    startDate: Date,
    endDate: Date
  ): Promise<{
    totalRequests: number;
    completedRequests: number;
    failedRequests: number;
    totalTokens: number;
    averageProcessingTime: number;
  }> {
    const result = await this.repository
      .createQueryBuilder('record')
      .select('COUNT(*)', 'totalRequests')
      .addSelect(
        "SUM(CASE WHEN record.status = 'completed' THEN 1 ELSE 0 END)",
        'completedRequests'
      )
      .addSelect(
        "SUM(CASE WHEN record.status = 'failed' THEN 1 ELSE 0 END)",
        'failedRequests'
      )
      .addSelect('SUM(record.tokensUsed)', 'totalTokens')
      .addSelect('AVG(record.processingTimeMs)', 'averageProcessingTime')
      .where('record.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .getRawOne();

    return {
      totalRequests: parseInt(result.totalRequests) || 0,
      completedRequests: parseInt(result.completedRequests) || 0,
      failedRequests: parseInt(result.failedRequests) || 0,
      totalTokens: parseInt(result.totalTokens) || 0,
      averageProcessingTime: parseFloat(result.averageProcessingTime) || 0,
    };
  }

  /**
   * Find similar analyses (for caching)
   * Based on MBTI type and dimension scores
   */
  async findSimilarAnalysis(
    mbtiType: string,
    dimensionScores: Record<string, number>,
    analysisType: AnalysisType,
    hoursOld: number = 24
  ): Promise<AIAnalysisRecord | null> {
    const cutoffTime = new Date(Date.now() - hoursOld * 60 * 60 * 1000);

    return await this.repository
      .createQueryBuilder('record')
      .where('record.input_data->>"mbtiType" = :mbtiType', { mbtiType })
      .andWhere('record.status = :status', { status: AnalysisStatus.COMPLETED })
      .andWhere('record.analysisType = :analysisType', { analysisType })
      .andWhere('record.createdAt > :cutoffTime', { cutoffTime })
      .andWhere(
        `ABS(
          (record.input_data->>'dimensionScores')::jsonb->>'EI'::int -
          :EI
        ) <= 2`,
        { EI: dimensionScores.EI }
      )
      .andWhere(
        `ABS(
          (record.input_data->>'dimensionScores')::jsonb->>'SN'::int -
          :SN
        ) <= 2`,
        { SN: dimensionScores.SN }
      )
      .orderBy('record.createdAt', 'DESC')
      .getOne();
  }

  /**
   * Clean old completed records
   */
  async cleanOldRecords(daysToKeep: number = 30): Promise<number> {
    const cutoffDate = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000);

    const result = await this.repository
      .createQueryBuilder('record')
      .delete()
      .where('status = :status', { status: AnalysisStatus.COMPLETED })
      .andWhere('createdAt < :cutoffDate', { cutoffDate })
      .execute();

    return result.affected || 0;
  }
}

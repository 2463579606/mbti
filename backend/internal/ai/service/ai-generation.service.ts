/**
 * AI Generation Service
 * Core service for generating AI-powered analysis
 */

import { Injectable, Logger, Inject } from '@nestjs/common';
import { getAIClient } from '../../../pkg/openai/openai-client';
import { AIPromptBuilder } from './ai-prompt.builder';
import { AIAnalysisRepository } from '../repository/ai-analysis.repository';
import { AICacheService } from './ai-cache.service';
import { AIAnalysisRecord, AnalysisStatus, AnalysisType } from '../entities/ai-analysis.entity';
import { AnalysisInputData, AnalysisContent } from '../types/ai-config.types';

@Injectable()
export class AIGenerationService {
  private readonly logger = new Logger(AIGenerationService.name);
  private readonly promptBuilder = new AIPromptBuilder();

  constructor(
    private readonly aiAnalysisRepository: AIAnalysisRepository,
    private readonly aiCacheService: AICacheService,
  ) {}

  /**
   * Generate AI analysis for a record
   */
  async generateAnalysis(analysisId: number): Promise<void> {
    const startTime = Date.now();

    try {
      // 1. Fetch analysis record
      const analysis = await this.aiAnalysisRepository.findById(analysisId);
      if (!analysis) {
        throw new Error(`Analysis record ${analysisId} not found`);
      }

      this.logger.log(`Starting AI generation for analysis ${analysisId}`);

      // 2. Update status to processing
      await this.aiAnalysisRepository.updateStatus(analysisId, {
        status: AnalysisStatus.PROCESSING,
      });

      // 3. Build prompt
      const inputData = analysis.inputData as any;
      const { systemRole, userPrompt } = await this.promptBuilder.buildPrompt(
        inputData.mbtiType,
        inputData,
        analysis.analysisType,
        inputData.userContext
      );

      this.logger.log(`Prompt built for ${analysis.analysisType} analysis`);

      // 4. Call AI API
      const client = getAIClient();
      const response = await client.chat([
        { role: 'system', content: systemRole },
        { role: 'user', content: userPrompt },
      ], {
        temperature: 0.7,
        maxTokens: 3000,
        timeout: 60000, // 60 seconds
      });

      this.logger.log(`AI API call completed, tokens used: ${response.usage.totalTokens}`);

      // 5. Extract JSON from response
      let jsonContent = this.promptBuilder.extractJSON(response.content);

      // 6. Clean up JSON (handle common issues)
      jsonContent = this.cleanJSON(jsonContent);

      // 7. Parse JSON response
      let analysisContent: AnalysisContent;
      try {
        analysisContent = JSON.parse(jsonContent);
      } catch (parseError) {
        this.logger.error(`Failed to parse AI response as JSON: ${parseError}`);
        this.logger.error(`Response preview (first 1000 chars): ${jsonContent.substring(0, 1000)}...`);

        // Try to fix common JSON issues
        analysisContent = this.tryFixJSON(jsonContent);
      }

      // 7. Validate response structure
      this.validateAnalysisContent(analysisContent);

      // 8. Calculate processing time
      const processingTimeMs = Date.now() - startTime;

      // 9. Update record with results
      await this.aiAnalysisRepository.updateContent(analysisId, {
        status: AnalysisStatus.COMPLETED,
        analysisContent,
        modelName: 'glm-4.7',
        tokensUsed: response.usage.totalTokens,
        processingTimeMs,
        completedAt: new Date(),
      });

      // 10. Cache the analysis result
      await this.aiCacheService.cacheAnalysis(
        analysisId,
        analysis.reportId,
        inputData.mbtiType,
        inputData.dimensionScores,
        analysis.analysisType
      );

      this.logger.log(`AI generation completed for analysis ${analysisId} in ${processingTimeMs}ms`);

    } catch (error: any) {
      this.logger.error(`AI generation failed for analysis ${analysisId}: ${error.message}`);

      // Update with error status
      await this.aiAnalysisRepository.updateStatus(analysisId, {
        status: AnalysisStatus.FAILED,
        errorMessage: error.message,
        errorDetails: {
          type: error.name || 'UnknownError',
          stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
        },
      });

      throw error;
    }
  }

  /**
   * Generate analysis synchronously (for testing or immediate requests)
   */
  async generateAnalysisSync(
    reportId: number,
    inputData: AnalysisInputData,
    analysisType: AnalysisType = AnalysisType.COMPREHENSIVE
  ): Promise<AnalysisContent> {
    this.logger.log(`Starting sync analysis for report ${reportId}`);

    // 1. Build prompt
    const { systemRole, userPrompt } = await this.promptBuilder.buildPrompt(
      inputData.mbtiType,
      inputData,
      analysisType,
      inputData.userContext
    );

    // 2. Call AI API
    const client = getAIClient();
    const response = await client.chat([
      { role: 'system', content: systemRole },
      { role: 'user', content: userPrompt },
    ], {
      temperature: 0.7,
      maxTokens: 3000,
    });

    // 3. Extract and parse JSON
    const jsonContent = this.promptBuilder.extractJSON(response.content);
    const analysisContent = JSON.parse(jsonContent) as AnalysisContent;

    // 4. Validate
    this.validateAnalysisContent(analysisContent);

    this.logger.log(`Sync analysis completed, tokens: ${response.usage.totalTokens}`);

    return analysisContent;
  }

  /**
   * Validate analysis content structure
   */
  private validateAnalysisContent(content: any): void {
    const requiredFields = ['overview', 'strengths', 'weaknesses'];

    for (const field of requiredFields) {
      if (!content[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    // Validate overview
    if (!content.overview.title || !content.overview.summary) {
      throw new Error('Invalid overview structure');
    }

    // Validate arrays have at least 3 items
    const arrayFields = ['overview.keyPoints', 'strengths.items', 'weaknesses.improvementStrategies'];
    for (const field of arrayFields) {
      const parts = field.split('.');
      let current = content;
      for (const part of parts) {
        current = current[part];
      }
      if (!Array.isArray(current) || current.length < 3) {
        throw new Error(`Field ${field} must have at least 3 items`);
      }
    }
  }

  /**
   * Retry failed analysis
   */
  async retryAnalysis(analysisId: number): Promise<void> {
    const analysis = await this.aiAnalysisRepository.findById(analysisId);
    if (!analysis) {
      throw new Error(`Analysis ${analysisId} not found`);
    }

    if (analysis.status !== AnalysisStatus.FAILED) {
      throw new Error(`Can only retry failed analyses, current status: ${analysis.status}`);
    }

    this.logger.log(`Retrying analysis ${analysisId}`);

    // Reset to pending and regenerate
    await this.aiAnalysisRepository.updateStatus(analysisId, {
      status: AnalysisStatus.PENDING,
      errorMessage: null,
      errorDetails: null,
    });

    await this.generateAnalysis(analysisId);
  }

  /**
   * Batch generate analyses (for background processing)
   */
  async batchGenerate(analysisIds: number[]): Promise<{
    successful: number;
    failed: number;
    errors: Array<{ id: number; error: string }>;
  }> {
    this.logger.log(`Starting batch generation for ${analysisIds.length} analyses`);

    const results = {
      successful: 0,
      failed: 0,
      errors: [] as Array<{ id: number; error: string }>,
    };

    for (const id of analysisIds) {
      try {
        await this.generateAnalysis(id);
        results.successful++;
      } catch (error: any) {
        results.failed++;
        results.errors.push({
          id,
          error: error.message,
        });
      }
    }

    this.logger.log(`Batch generation completed: ${results.successful} successful, ${results.failed} failed`);

    return results;
  }

  /**
   * Check and process timed-out analyses
   */
  async checkTimedOutAnalyses(timeoutMinutes: number = 30): Promise<void> {
    const timedOutRecords = await this.aiAnalysisRepository.findProcessingRecords(timeoutMinutes);

    this.logger.log(`Found ${timedOutRecords.length} timed-out analyses`);

    for (const record of timedOutRecords) {
      try {
        // Mark as failed
        await this.aiAnalysisRepository.updateStatus(record.id, {
          status: AnalysisStatus.FAILED,
          errorMessage: `Analysis timed out after ${timeoutMinutes} minutes`,
        });

        this.logger.warn(`Analysis ${record.id} marked as failed due to timeout`);
      } catch (error) {
        this.logger.error(`Failed to mark analysis ${record.id} as timed out: ${error}`);
      }
    }
  }

  /**
   * Get generation statistics
   */
  async getStatistics(hours: number = 24) {
    const endDate = new Date();
    const startDate = new Date(Date.now() - hours * 60 * 60 * 1000);

    const stats = await this.aiAnalysisRepository.getUsageStats(startDate, endDate);

    return {
      timeRange: `Last ${hours} hours`,
      ...stats,
      averageTokensPerAnalysis: stats.totalRequests > 0
        ? Math.round(stats.totalTokens / stats.completedRequests)
        : 0,
      averageProcessingTime: `${Math.round(stats.averageProcessingTime / 1000)}s`,
      // For coding plan users
      estimatedCost: 0,
    };
  }

  /**
   * Clean JSON content (fix common issues)
   */
  private cleanJSON(json: string): string {
    // Remove BOM if present
    json = json.replace(/^\uFEFF/, '');

    // Replace problematic control characters (but keep newlines and tabs)
    json = json.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '');

    return json;
  }

  /**
   * Try to fix common JSON issues
   */
  private tryFixJSON(json: string): AnalysisContent {
    this.logger.warn('Attempting to fix JSON formatting issues...');

    // Try to fix unescaped newlines in strings
    let fixed = json.replace(/"([^"\\]*)\\n([^"]*)"/g, '"$1\\\\n$2"');

    // Try to fix unescaped quotes in strings
    fixed = fixed.replace(/"([^"\\]*)\\'([^"]*)"/g, '"$1\\\\\'$2"');

    // Try to fix unescaped backslashes (except \\n, \\t etc)
    fixed = fixed.replace(/\\([^nrt"'\\])/g, '\\\\$1');

    try {
      const result = JSON.parse(fixed);
      this.logger.log('✅ JSON successfully fixed');
      return result;
    } catch {
      // If still fails, throw descriptive error
      this.logger.error('Failed to fix JSON, checking response structure...');

      // Show sample of problematic JSON
      const lines = json.split('\n');
      const errorLine = 129; // From error message
      const start = Math.max(0, errorLine - 3);
      const end = Math.min(lines.length, errorLine + 3);

      for (let i = start; i < end; i++) {
        this.logger.error(`Line ${i + 1}: ${lines[i].substring(0, 100)}`);
      }

      throw new Error('AI response contains invalid JSON format. This may be due to AI not following the output format correctly.');
    }
  }
}

/**
 * AI Analysis DTOs
 * Data transfer objects for AI analysis API
 */

import { IsEnum, IsOptional, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { AnalysisType } from '../entities/ai-analysis.entity';

/**
 * User context for AI analysis
 */
export class UserContextDTO {
  @IsOptional()
  age?: number;

  @IsOptional()
  occupation?: string;

  @IsOptional()
  education?: string;

  @IsOptional()
  goals?: string[];

  @IsOptional()
  challenges?: string[];

  @IsOptional()
  preferences?: Record<string, any>;
}

/**
 * Create analysis request DTO
 */
export class CreateAnalysisRequestDTO {
  @IsOptional()
  @IsEnum(AnalysisType)
  analysisType?: AnalysisType;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => UserContextDTO)
  userContext?: UserContextDTO;

  @IsOptional()
  forceRegenerate?: boolean;
}

/**
 * Analysis task creation response
 */
export interface AnalysisTaskResponse {
  taskId: string;
  reportId: number;
  status: string;
  estimatedTime: number;
  createdAt: string;
}

/**
 * Analysis task status response
 */
export interface AnalysisStatusResponse {
  taskId: string;
  status: string;
  progress?: number;
  stage?: string;
  createdAt: string;
  completedAt?: string;
  error?: string;
}

/**
 * AI analysis content response
 */
export interface AIAnalysisResultResponse {
  reportId: number;
  analysisId: number;
  analysisType: AnalysisType;
  content: any;
  metadata: {
    model: string;
    modelVersion?: string;
    generatedAt?: string;
    tokensUsed?: number;
    processingTimeMs?: number;
  };
}

/**
 * Pagination DTO
 */
export class PaginationDTO {
  @IsOptional()
  page?: number = 1;

  @IsOptional()
  limit?: number = 10;
}

/**
 * Analysis list query DTO
 */
export class ListAnalysisQueryDTO extends PaginationDTO {
  @IsOptional()
  @IsEnum(['pending', 'processing', 'completed', 'failed'])
  status?: string;

  @IsOptional()
  @IsEnum(['comprehensive', 'career', 'relationship', 'growth'])
  type?: AnalysisType;
}

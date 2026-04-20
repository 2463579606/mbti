/**
 * AI Analysis Record Entity
 * TypeORM entity for ai_analysis_records table
 */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../entities/user.entity';
import { TestReport } from '../../entities/test-report.entity';

export enum AnalysisStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export enum AnalysisType {
  COMPREHENSIVE = 'comprehensive',
  CAREER = 'career',
  RELATIONSHIP = 'relationship',
  GROWTH = 'growth',
}

@Entity('ai_analysis_records')
export class AIAnalysisRecord {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number;

  @Column({ type: 'bigint' })
  @Index()
  reportId: number;

  @Column({ type: 'bigint', nullable: true })
  @Index()
  userId: number | null;

  @Column({
    type: 'enum',
    enum: AnalysisStatus,
    default: AnalysisStatus.PENDING,
  })
  @Index()
  status: AnalysisStatus;

  @Column({
    type: 'enum',
    enum: AnalysisType,
    default: AnalysisType.COMPREHENSIVE,
  })
  @Index()
  analysisType: AnalysisType;

  @Column({ type: 'jsonb', nullable: false })
  inputData: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  analysisContent: Record<string, any> | null;

  @Column({ type: 'text', nullable: true })
  errorMessage: string | null;

  @Column({ type: 'jsonb', nullable: true })
  errorDetails: Record<string, any> | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  modelName: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  modelVersion: string | null;

  @Column({ type: 'int', default: 0 })
  tokensUsed: number;

  @Column({ type: 'int', nullable: true })
  processingTimeMs: number | null;

  @CreateDateColumn({ type: 'timestamp' })
  @Index()
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date | null;

  // Relations
  @ManyToOne(() => TestReport, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'report_id' })
  report: TestReport;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'user_id' })
  user: User | null;
}

/**
 * DTO for creating analysis record
 */
export interface CreateAnalysisDTO {
  reportId: number;
  userId?: number;
  analysisType: AnalysisType;
  inputData: Record<string, any>;
}

/**
 * DTO for updating analysis status
 */
export interface UpdateAnalysisStatusDTO {
  status: AnalysisStatus;
  errorMessage?: string;
  errorDetails?: Record<string, any>;
}

/**
 * DTO for updating analysis content
 */
export interface UpdateAnalysisContentDTO {
  status: AnalysisStatus;
  analysisContent: Record<string, any>;
  modelName?: string;
  modelVersion?: string;
  tokensUsed?: number;
  processingTimeMs?: number;
  completedAt?: Date;
}

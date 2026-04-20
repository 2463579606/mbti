/**
 * Test Report Entity (TypeORM)
 * Stores generated test reports
 */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from './user.entity';
import { TestSession } from './test-session.entity';

@Entity('test_reports')
export class TestReport {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number;

  @Column({ type: 'bigint', nullable: true })
  @Index()
  userId: number | null;

  @Column({ type: 'bigint', unique: true })
  @Index()
  sessionId: number;

  @Column({ type: 'varchar', length: 4 })
  @Index()
  mbtiType: string;  // e.g., "INTJ"

  // Dimension scores (percentages 0-100)
  @Column({ type: 'int' })
  eiScore: number;  // 0-100

  @Column({ type: 'int' })
  snScore: number;  // 0-100

  @Column({ type: 'int' })
  tfScore: number;  // 0-100

  @Column({ type: 'int' })
  jpScore: number;  // 0-100

  // Detailed data (JSON)
  @Column({ type: 'jsonb' })
  dimensionDetails: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  personalityAnalysis: Record<string, any> | null;

  // Sharing
  @Column({ type: 'varchar', length: 64, unique: true, nullable: true })
  @Index()
  shareToken: string | null;

  @Column({ type: 'int', default: 0 })
  shareCount: number;

  // Timestamp
  @CreateDateColumn({ type: 'timestamp' })
  @Index()
  createdAt: Date;

  // Relations
  @ManyToOne(() => TestSession, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'session_id' })
  session: TestSession;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'user_id' })
  user: User | null;
}

/**
 * Test Report Entity (TypeORM)
 * Stores generated test reports
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
import { User } from './user.entity';

@Entity('test_reports')
export class TestReport {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number;

  @Column({ type: 'bigint', nullable: true })
  @Index()
  userId: number | null;

  @Column({ type: 'bigint' })
  @Index()
  sessionId: number;

  @Column({ type: 'varchar', length: 4 })
  @Index()
  mbtiType: string;  // e.g., "INTJ"

  @Column({ type: 'jsonb', nullable: true })
  resultScores: Record<string, number> | null;  // { EI: 30, SN: 20, TF: 28, JP: 25 }

  @Column({ type: 'jsonb', nullable: true })
  dimensionDetails: Record<string, any> | null;

  @Column({ type: 'varchar', length: 64, unique: true })
  @Index()
  shareToken: string;

  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date | null;

  @Column({ type: 'int', nullable: true })
  durationSeconds: number | null;

  @CreateDateColumn({ type: 'timestamp' })
  @Index()
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'user_id' })
  user: User | null;
}

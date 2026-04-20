/**
 * Test Session Entity (TypeORM)
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
import { SessionStatus } from '../domain/test-session.entity';
import { User } from './user.entity';

@Entity('test_sessions')
export class TestSession {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number;

  @Column({ type: 'bigint', nullable: true })
  @Index()
  userId: number | null;

  @Column({ type: 'varchar', length: 64, unique: true })
  @Index()
  sessionToken: string;

  // Test state
  @Column({
    type: 'enum',
    enum: SessionStatus,
    default: SessionStatus.IN_PROGRESS,
  })
  @Index()
  status: SessionStatus;

  // Progress tracking
  @Column({ type: 'int', default: 0 })
  currentQuestion: number;

  @Column({ type: 'int', default: 0 })
  answeredCount: number;

  // Time tracking
  @CreateDateColumn({ type: 'timestamp' })
  @Index()
  startedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date | null;

  @Column({ type: 'int', nullable: true })
  durationSeconds: number | null;

  // Results
  @Column({ type: 'varchar', length: 4, nullable: true })
  @Index()
  resultType: string | null; // MBTI 4-letter code

  @Column({ type: 'jsonb', nullable: true })
  resultScores: Record<string, number> | null;

  // System fields
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

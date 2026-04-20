/**
 * All Other Entities (TypeORM)
 */

import {
  Entity,
  PrimaryGeneratedColumn,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
  Index,
} from 'typeorm';
import { TestSession } from './test-session.entity';
export { TestSession } from './test-session.entity';
import { User } from './user.entity';

/**
 * Test Answer Entity
 */
@Entity('test_answers')
@Unique(['sessionId', 'questionId'])
export class TestAnswer {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number;

  @Column({ type: 'bigint' })
  @Index()
  sessionId: number;

  @Column({ type: 'bigint', nullable: true })
  @Index()
  userId: number | null;

  // Question info
  @Column({ type: 'int' })
  @Index()
  questionId: number;

  @Column({ type: 'varchar', length: 2 })
  @Index()
  dimension: string;

  // Answer info
  @Column({ type: 'int' })
  selectedOption: number; // 0 or 1

  @Column({ type: 'int' })
  score: number; // 0 or 2

  // Timestamp
  @CreateDateColumn({ type: 'timestamp' })
  answeredAt: Date;

  // Relations
  @ManyToOne(() => TestSession, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'session_id' })
  session: TestSession;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'user_id' })
  user: User | null;
}

/**
 * Question Entity
 */
@Entity('questions')
export class Question {
  @PrimaryGeneratedColumn('increment', { type: 'int' })
  id: number;

  @Column({ type: 'int', unique: true })
  @Index()
  questionId: number; // 0-59

  @Column({ type: 'varchar', length: 2 })
  @Index()
  dimension: string; // EI, SN, TF, JP

  @Column({ type: 'smallint' })
  dimensionOrder: number; // 1-15

  // Content
  @Column({ type: 'text' })
  questionText: string;

  @Column({ type: 'text' })
  optionA: string;

  @Column({ type: 'text' })
  optionB: string;

  @Column({ type: 'int' })
  scoreA: number;

  @Column({ type: 'int' })
  scoreB: number;

  // Status
  @Column({ type: 'boolean', default: true })
  @Index()
  isActive: boolean;

  @Column({ type: 'int', default: 1 })
  version: number;

  // Timestamps
  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  // Methods
  getOptions() {
    return [
      { label: 'A', text: this.optionA, score: this.scoreA },
      { label: 'B', text: this.optionB, score: this.scoreB },
    ];
  }
}

/**
 * MBTI Type Entity
 */
@Entity('mbti_types')
export class MBTIType {
  @PrimaryColumn({ type: 'varchar', length: 4 })
  code: string; // 4-letter code

  // Basic info
  @Column({ type: 'varchar', length: 50 })
  name: string; // Chinese name

  @Column({ type: 'varchar', length: 10 })
  emoji: string; // Icon emoji

  @Column({ type: 'varchar', length: 20 })
  groupName: string; // 分组

  // Descriptions
  @Column({ type: 'text' })
  headline: string; // One-line description

  @Column({ type: 'text' })
  tagline: string; // Detailed description

  // Arrays (stored as JSONB)
  @Column({ type: 'jsonb' })
  strengths: string[];

  @Column({ type: 'jsonb' })
  weaknesses: string[];

  @Column({ type: 'jsonb' })
  bestMatch: string[];

  @Column({ type: 'jsonb' })
  challengingMatch: string[];

  @Column({ type: 'jsonb' })
  careers: string[];

  @Column({ type: 'jsonb' })
  famousPeople: string[];

  // Timestamps
  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}

/**
 * Test Report Entity
 */
@Entity('test_reports')
export class TestReport {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number;

  @Column({ type: 'bigint', unique: true })
  @Index()
  sessionId: number;

  @Column({ type: 'bigint', nullable: true })
  @Index()
  userId: number | null;

  // Results
  @Column({ type: 'varchar', length: 4 })
  @Index()
  mbtiType: string;

  // Dimension scores (percentages)
  @Column({ type: 'int' })
  eiScore: number; // 0-100

  @Column({ type: 'int' })
  snScore: number; // 0-100

  @Column({ type: 'int' })
  tfScore: number; // 0-100

  @Column({ type: 'int' })
  jpScore: number; // 0-100

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

// Export all entities
export const entities = [
  User,
  TestSession,
  TestAnswer,
  Question,
  MBTIType,
  TestReport,
];

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
export { User } from './user.entity';
import { TestReport } from './test-report.entity';
export { TestReport } from './test-report.entity';

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

// Export all entities
export const entities = [
  User,
  TestSession,
  TestAnswer,
  Question,
  MBTIType,
  TestReport,
];

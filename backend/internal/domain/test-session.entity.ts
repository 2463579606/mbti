/**
 * Test Session Entity
 * Represents a single test attempt by a user
 */

export enum SessionStatus {
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  ABANDONED = 'abandoned',
}

export class TestSession {
  id: number;
  userId: number | null;
  sessionToken: string;

  // Test state
  status: SessionStatus;

  // Progress tracking
  currentQuestion: number;
  answeredCount: number;

  // Time tracking
  startedAt: Date;
  completedAt: Date | null;
  durationSeconds: number | null;

  // Results (populated after completion)
  resultType: string | null; // MBTI 4-letter code
  resultScores: Record<string, number> | null; // Dimension scores

  // System fields
  createdAt: Date;
  updatedAt: Date;

  constructor(props?: Partial<TestSession>) {
    if (props) {
      this.id = props.id || 0;
      this.userId = props.userId || null;
      this.sessionToken = props.sessionToken || '';
      this.status = props.status || SessionStatus.IN_PROGRESS;
      this.currentQuestion = props.currentQuestion || 0;
      this.answeredCount = props.answeredCount || 0;
      this.startedAt = props.startedAt || new Date();
      this.completedAt = props.completedAt || null;
      this.durationSeconds = props.durationSeconds || null;
      this.resultType = props.resultType || null;
      this.resultScores = props.resultScores || null;
      this.createdAt = props.createdAt || new Date();
      this.updatedAt = props.updatedAt || new Date();
    }
  }

  // Helper methods
  isInProgress(): boolean {
    return this.status === SessionStatus.IN_PROGRESS;
  }

  isCompleted(): boolean {
    return this.status === SessionStatus.COMPLETED;
  }

  getProgress(): number {
    return Math.round((this.answeredCount / 60) * 100);
  }

  calculateDuration(): number {
    if (this.completedAt) {
      return Math.floor(
        (this.completedAt.getTime() - this.startedAt.getTime()) / 1000
      );
    }
    return 0;
  }
}

export type CreateSessionDto = {
  userId?: number;
  anonymousId?: string;
};

export type UpdateSessionDto = {
  currentQuestion?: number;
  answeredCount?: number;
  status?: SessionStatus;
  completedAt?: Date;
  durationSeconds?: number;
  resultType?: string;
  resultScores?: Record<string, number>;
};

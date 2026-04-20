/**
 * Scoring Service
 * Calculates MBTI type from answers
 * MUST match UI logic exactly (see ui/index.html lines 1933-1940)
 */

import { TestAnswer } from '../domain/entities';
import { MBTITypeCode } from '../domain/entities';
import { InsufficientAnswersError } from '../../pkg/errors/errors';

export interface DimensionScores {
  EI: number; // Extraversion vs Introversion
  SN: number; // Sensing vs Intuition
  TF: number; // Thinking vs Feeling
  JP: number; // Judging vs Perceiving
}

export interface DimensionPercentages {
  EI: number; // 0-100, E tendency
  SN: number; // 0-100, S tendency
  TF: number; // 0-100, T tendency
  JP: number; // 0-100, J tendency
}

export interface ScoringResult {
  typeCode: string; // 4-letter MBTI type
  percentages: DimensionPercentages;
  dimensionScores: DimensionScores;
}

/**
 * Scoring Service
 * Implements the exact algorithm from the UI
 */
export class ScoringService {
  private readonly MAX_SCORE_PER_DIMENSION = 30; // 15 questions × 2 points
  private readonly DIMENSIONS = ['EI', 'SN', 'TF', 'JP'] as const;
  private readonly QUESTIONS_PER_DIMENSION = 15;

  /**
   * Calculate MBTI type from answers
   * @param answers Array of test answers
   * @returns Scoring result with type code and percentages
   */
  calculateResult(answers: TestAnswer[]): ScoringResult {
    // Validate we have all 60 answers
    if (answers.length !== 60) {
      throw new InsufficientAnswersError(60, answers.length);
    }

    // Calculate dimension scores
    const dimensionScores = this.calculateDimensionScores(answers);

    // Calculate percentages
    const percentages = this.calculatePercentages(dimensionScores);

    // Determine 4-letter type code
    const typeCode = this.determineTypeCode(percentages);

    return {
      typeCode,
      percentages,
      dimensionScores,
    };
  }

  /**
   * Calculate raw scores for each dimension
   */
  private calculateDimensionScores(answers: TestAnswer[]): DimensionScores {
    const scores: DimensionScores = {
      EI: 0,
      SN: 0,
      TF: 0,
      JP: 0,
    };

    for (const answer of answers) {
      scores[answer.dimension as keyof DimensionScores] += answer.score;
    }

    return scores;
  }

  /**
   * Calculate percentages for each dimension
   * Percentage = (score / max_score) × 100
   */
  private calculatePercentages(scores: DimensionScores): DimensionPercentages {
    return {
      EI: Math.round((scores.EI / this.MAX_SCORE_PER_DIMENSION) * 100),
      SN: Math.round((scores.SN / this.MAX_SCORE_PER_DIMENSION) * 100),
      TF: Math.round((scores.TF / this.MAX_SCORE_PER_DIMENSION) * 100),
      JP: Math.round((scores.JP / this.MAX_SCORE_PER_DIMENSION) * 100),
    };
  }

  /**
   * Determine 4-letter MBTI type code from percentages
   * MUST match UI logic exactly:
   * const E = (dimScores.EI / dimMax.EI) >= 0.5;
   * const typeCode = (E?'E':'I') + (S?'S':'N') + (T?'T':'F') + (J?'J':'P');
   */
  private determineTypeCode(percentages: DimensionPercentages): string {
    const E = percentages.EI >= 50;
    const S = percentages.SN >= 50;
    const T = percentages.TF >= 50;
    const J = percentages.JP >= 50;

    const typeCode =
      (E ? 'E' : 'I') +
      (S ? 'S' : 'N') +
      (T ? 'T' : 'F') +
      (J ? 'J' : 'P');

    return typeCode;
  }

  /**
   * Get dimension label pair
   */
  getDimensionLabels(dimension: string): { left: string; right: string } {
    const labels: Record<string, { left: string; right: string }> = {
      EI: { left: '外向 (E)', right: '内向 (I)' },
      SN: { left: '实感 (S)', right: '直觉 (N)' },
      TF: { left: '思考 (T)', right: '情感 (F)' },
      JP: { left: '判断 (J)', right: '感知 (P)' },
    };

    return labels[dimension] || { left: '', right: '' };
  }

  /**
   * Get dimension description
   */
  getDimensionDescription(
    dimension: string,
    percentage: number
  ): string {
    const labels = this.getDimensionLabels(dimension);

    if (percentage >= 50) {
      const leftPercentage = percentage;
      return `${labels.left.split(' ')[0]}倾向 ${leftPercentage}%`;
    } else {
      const rightPercentage = 100 - percentage;
      return `${labels.right.split(' ')[0]}倾向 ${rightPercentage}%`;
    }
  }

  /**
   * Validate answer completeness
   * Returns array of missing question IDs
   */
  validateCompleteness(answers: TestAnswer[]): number[] {
    const answered = new Set(answers.map((a) => a.questionId));
    const missing: number[] = [];

    for (let i = 0; i < 60; i++) {
      if (!answered.has(i)) {
        missing.push(i);
      }
    }

    return missing;
  }

  /**
   * Get expected max score for a dimension
   */
  getMaxScoreForDimension(dimension: string): number {
    return this.MAX_SCORE_PER_DIMENSION;
  }

  /**
   * Get number of questions per dimension
   */
  getQuestionsPerDimension(): number {
    return this.QUESTIONS_PER_DIMENSION;
  }
}

// Export singleton instance
export const scoringService = new ScoringService();

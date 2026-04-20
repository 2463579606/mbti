/**
 * Question Service
 */

import { Injectable, NotFoundException } from '@nestjs/common';
import { Question } from '../entities';
import { QuestionRepository } from '../repository/repositories';
import { UpdateQuestionDto } from '../domain/entities';
import { CacheService } from '../../pkg/cache/cache.service';
import { config } from '../../config/config';
import { ErrorCode } from '../../pkg/errors/errors';

@Injectable()
export class QuestionService {
  constructor(
    private readonly questionRepository: QuestionRepository,
    private readonly cacheService: CacheService
  ) {}

  /**
   * Get all questions
   */
  async getAllQuestions() {
    const cacheKey = `questions:all`;

    // Try cache first
    let questions = await this.cacheService.get<Question[]>(cacheKey);
    if (!questions) {
      questions = await this.questionRepository.findActive();
      await this.cacheService.set(cacheKey, questions, config.cache.questions);
    }

    return {
      total: questions.length,
      questions: questions.map((q) => this.formatQuestion(q)),
    };
  }

  /**
   * Get question by ID
   */
  async getQuestionById(id: number) {
    const question = await this.questionRepository.findById(id);
    if (!question) {
      throw new NotFoundException(ErrorCode.QUESTION_NOT_FOUND);
    }
    return this.formatQuestion(question);
  }

  /**
   * Get questions by dimension
   */
  async getQuestionsByDimension(dimension: string) {
    const questions = await this.questionRepository.findByDimension(dimension);
    return {
      dimension,
      total: questions.length,
      questions: questions.map((q) => this.formatQuestion(q)),
    };
  }

  /**
   * Update question
   */
  async updateQuestion(id: number, dto: UpdateQuestionDto) {
    const question = await this.questionRepository.findById(id);
    if (!question) {
      throw new NotFoundException(ErrorCode.QUESTION_NOT_FOUND);
    }

    // Update fields
    if (dto.questionText !== undefined) {
      question.questionText = dto.questionText;
    }
    if (dto.optionA !== undefined) {
      question.optionA = dto.optionA;
    }
    if (dto.optionB !== undefined) {
      question.optionB = dto.optionB;
    }
    if (dto.scoreA !== undefined) {
      question.scoreA = dto.scoreA;
    }
    if (dto.scoreB !== undefined) {
      question.scoreB = dto.scoreB;
    }
    if (dto.isActive !== undefined) {
      question.isActive = dto.isActive;
    }

    question.updatedAt = new Date();
    const updated = await this.questionRepository.update(question);

    // Clear cache
    await this.cacheService.del('questions:all');
    await this.cacheService.delPattern(`questions:dimension:*`);

    return {
      id: updated.id,
      questionId: updated.questionId,
      version: updated.version,
    };
  }

  /**
   * Get statistics
   */
  async getStatistics() {
    const total = await this.questionRepository.count();
    const active = await this.questionRepository.countActive();

    const byDimension: Record<string, number> = {
      EI: 0,
      SN: 0,
      TF: 0,
      JP: 0,
    };

    const allQuestions = await this.questionRepository.findAll();
    for (const q of allQuestions) {
      byDimension[q.dimension]++;
    }

    return {
      total,
      active,
      inactive: total - active,
      byDimension,
    };
  }

  /**
   * Get question statistics (alias for admin)
   */
  async getQuestionStatistics() {
    return this.getStatistics();
  }

  /**
   * Format question for API response
   */
  private formatQuestion(question: Question) {
    return {
      id: question.id,
      questionId: question.questionId,
      dimension: question.dimension,
      dimensionLabel: this.getDimensionLabel(question.dimension),
      dimensionOrder: question.dimensionOrder,
      question: question.questionText,
      options: question.getOptions ? question.getOptions() : [question.optionA, question.optionB],
      optionLabels: ['A', 'B'],
      scores: [question.scoreA, question.scoreB],
      isActive: question.isActive,
      version: question.version,
    };
  }

  /**
   * Get dimension label
   */
  private getDimensionLabel(dimension: string): string {
    const labels: Record<string, string> = {
      EI: '外向 / 内向',
      SN: '实感 / 直觉',
      TF: '思考 / 情感',
      JP: '判断 / 感知',
    };
    return labels[dimension] || dimension;
  }
}

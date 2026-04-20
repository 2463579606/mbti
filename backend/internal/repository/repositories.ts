/**
 * Other Repositories
 */

export { UserRepository } from './user.repository';
export { TestSessionRepository } from './test-session.repository';

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { TestAnswer, Question, MBTIType, TestReport } from '../entities';
import { CreateAnswerDto } from '../domain/entities';

@Injectable()
export class TestAnswerRepository {
  constructor(
    @InjectRepository(TestAnswer)
    private readonly repository: Repository<TestAnswer>
  ) {}

  async create(dto: CreateAnswerDto): Promise<TestAnswer> {
    const answer = this.repository.create({
      ...dto,
      answeredAt: new Date(),
    });
    return await this.repository.save(answer);
  }

  async createMany(answers: CreateAnswerDto[]): Promise<TestAnswer[]> {
    const entities = answers.map((dto) =>
      this.repository.create({
        ...dto,
        answeredAt: new Date(),
      })
    );
    return await this.repository.save(entities);
  }

  async findBySessionId(sessionId: number): Promise<TestAnswer[]> {
    return await this.repository.find({
      where: { sessionId },
      order: { questionId: 'ASC' },
    });
  }

  async findBySessionIdAndQuestionId(
    sessionId: number,
    questionId: number
  ): Promise<TestAnswer | null> {
    return await this.repository.findOne({
      where: { sessionId, questionId },
    });
  }

  async countBySessionId(sessionId: number): Promise<number> {
    return await this.repository.count({
      where: { sessionId },
    });
  }

  async countBySessionIdAndDimension(
    sessionId: number,
    dimension: string
  ): Promise<number> {
    return await this.repository.count({
      where: { sessionId, dimension },
    });
  }

  async getAnsweredQuestionIds(sessionId: number): Promise<number[]> {
    const answers = await this.repository.find({
      where: { sessionId },
      select: ['questionId'],
    });
    return answers.map((a) => a.questionId);
  }

  async getDimensionScores(sessionId: number): Promise<Record<string, number>> {
    const answers = await this.repository.find({
      where: { sessionId },
    });

    const scores: Record<string, number> = {
      EI: 0,
      SN: 0,
      TF: 0,
      JP: 0,
    };

    for (const answer of answers) {
      scores[answer.dimension] += answer.score;
    }

    return scores;
  }

  async deleteBySessionId(sessionId: number): Promise<void> {
    await this.repository.delete({ sessionId });
  }
}

@Injectable()
export class QuestionRepository {
  constructor(
    @InjectRepository(Question)
    private readonly repository: Repository<Question>
  ) {}

  async findAll(): Promise<Question[]> {
    return await this.repository.find({
      order: { questionId: 'ASC' },
    });
  }

  async findActive(): Promise<Question[]> {
    return await this.repository.find({
      where: { isActive: true },
      order: { questionId: 'ASC' },
    });
  }

  async findByDimension(dimension: string): Promise<Question[]> {
    return await this.repository.find({
      where: { dimension, isActive: true },
      order: { dimensionOrder: 'ASC' },
    });
  }

  async findById(id: number): Promise<Question | null> {
    return await this.repository.findOne({
      where: { id },
    });
  }

  async findByQuestionId(questionId: number): Promise<Question | null> {
    return await this.repository.findOne({
      where: { questionId },
    });
  }

  async findByIds(ids: number[]): Promise<Question[]> {
    return await this.repository.find({
      where: { id: In(ids) },
      order: { questionId: 'ASC' },
    });
  }

  async findByRange(start: number, count: number): Promise<Question[]> {
    return await this.repository.find({
      where: { isActive: true },
      order: { questionId: 'ASC' },
      skip: start,
      take: count,
    });
  }

  async update(question: Question): Promise<Question> {
    return await this.repository.save(question);
  }

  async count(): Promise<number> {
    return await this.repository.count();
  }

  async countActive(): Promise<number> {
    return await this.repository.count({
      where: { isActive: true },
    });
  }
}

@Injectable()
export class MBTITypeRepository {
  constructor(
    @InjectRepository(MBTIType)
    private readonly repository: Repository<MBTIType>
  ) {}

  async findAll(): Promise<MBTIType[]> {
    return await this.repository.find({
      order: { code: 'ASC' },
    });
  }

  async findByCode(code: string): Promise<MBTIType | null> {
    return await this.repository.findOne({
      where: { code },
    });
  }

  async findByCodes(codes: string[]): Promise<MBTIType[]> {
    return await this.repository.find({
      where: { code: In(codes) },
    });
  }

  async findByGroup(groupName: string): Promise<MBTIType[]> {
    return await this.repository.find({
      where: { groupName },
      order: { code: 'ASC' },
    });
  }
}

@Injectable()
export class TestReportRepository {
  constructor(
    @InjectRepository(TestReport)
    private readonly repository: Repository<TestReport>
  ) {}

  async findBySessionId(sessionId: number): Promise<TestReport | null> {
    return await this.repository.findOne({
      where: { sessionId },
      relations: ['session', 'user'],
    });
  }

  async findById(id: number): Promise<TestReport | null> {
    return await this.repository.findOne({
      where: { id },
      relations: ['session', 'user'],
    });
  }

  async findByUserId(userId: number, limit = 10): Promise<TestReport[]> {
    return await this.repository.find({
      where: { userId },
      relations: ['session'],
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async findByShareToken(shareToken: string): Promise<TestReport | null> {
    return await this.repository.findOne({
      where: { shareToken },
    });
  }

  async findByMBTIType(mbtiType: string, limit = 100): Promise<TestReport[]> {
    return await this.repository.find({
      where: { mbtiType },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async create(report: Partial<TestReport>): Promise<TestReport> {
    const entity = this.repository.create(report);
    return await this.repository.save(entity);
  }

  async incrementShareCount(reportId: number): Promise<void> {
    await this.repository.increment({ id: reportId }, 'shareCount', 1);
  }

  async countByMBTIType(mbtiType: string): Promise<number> {
    return await this.repository.count({
      where: { mbtiType },
    });
  }

  async getStatistics(): Promise<Record<string, number>> {
    const reports = await this.repository.find({
      select: ['mbtiType'],
    });

    const stats: Record<string, number> = {};
    for (const report of reports) {
      stats[report.mbtiType] = (stats[report.mbtiType] || 0) + 1;
    }

    return stats;
  }
}

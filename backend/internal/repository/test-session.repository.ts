/**
 * Test Session Repository
 */

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TestSession } from '../entities/test-session.entity';
import { SessionStatus, CreateSessionDto, UpdateSessionDto } from '../domain/test-session.entity';

@Injectable()
export class TestSessionRepository {
  constructor(
    @InjectRepository(TestSession)
    private readonly repository: Repository<TestSession>
  ) {}

  async create(dto: CreateSessionDto & { sessionToken: string }): Promise<TestSession> {
    const session = this.repository.create({
      ...dto,
      status: SessionStatus.IN_PROGRESS,
      currentQuestion: 0,
      answeredCount: 0,
      startedAt: new Date(),
    });
    return await this.repository.save(session);
  }

  async findById(id: number): Promise<TestSession | null> {
    return await this.repository.findOne({
      where: { id },
      relations: ['user'],
    });
  }

  async findByToken(sessionToken: string): Promise<TestSession | null> {
    return await this.repository.findOne({
      where: { sessionToken },
      relations: ['user'],
    });
  }

  async update(session: TestSession): Promise<TestSession> {
    return await this.repository.save(session);
  }

  async updateById(id: number, dto: UpdateSessionDto): Promise<void> {
    await this.repository.update(id, dto);
  }

  async findByUserId(userId: number, limit = 10): Promise<TestSession[]> {
    return await this.repository.find({
      where: { userId, status: SessionStatus.COMPLETED },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async findByUserAndStatus(
    userId: number,
    status: SessionStatus
  ): Promise<TestSession[]> {
    return await this.repository.find({
      where: { userId, status },
      order: { createdAt: 'DESC' },
    });
  }

  async countByUserId(userId: number): Promise<number> {
    return await this.repository.count({
      where: { userId, status: SessionStatus.COMPLETED },
    });
  }

  async findActiveByUserId(userId: number): Promise<TestSession | null> {
    return await this.repository.findOne({
      where: { userId, status: SessionStatus.IN_PROGRESS },
      order: { createdAt: 'DESC' },
    });
  }

  async findRecent(limit: number = 50): Promise<TestSession[]> {
    return await this.repository.find({
      order: { createdAt: 'DESC' },
      take: limit,
      relations: ['user'],
    });
  }
}

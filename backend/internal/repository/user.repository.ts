/**
 * User Repository
 */

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { CreateUserDto } from '../domain/user.entity';

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>
  ) {}

  async create(dto: CreateUserDto): Promise<User> {
    const user = this.repository.create(dto);
    return await this.repository.save(user);
  }

  async findById(id: number): Promise<User | null> {
    return await this.repository.findOne({
      where: { id, deletedAt: null as any },
    });
  }

  async findByAnonymousId(anonymousId: string): Promise<User | null> {
    return await this.repository.findOne({
      where: { anonymousId, deletedAt: null as any },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.repository.findOne({
      where: { email, deletedAt: null as any },
    });
  }

  async findByEmailOrAnonymous(
    email: string | null,
    anonymousId: string | null
  ): Promise<User | null> {
    if (email) {
      return await this.findByEmail(email);
    }
    if (anonymousId) {
      return await this.findByAnonymousId(anonymousId);
    }
    return null;
  }

  async update(user: User): Promise<User> {
    return await this.repository.save(user);
  }

  async incrementTestCount(userId: number): Promise<void> {
    await this.repository.increment({ id: userId }, 'testCount', 1);
  }

  async updateLastTestAt(userId: number): Promise<void> {
    await this.repository.update(userId, { lastTestAt: new Date() });
  }

  async findAll(page: number = 1, limit: number = 20, status?: string) {
    const skip = (page - 1) * limit;
    const where: any = { deletedAt: null as any };
    if (status) {
      where.status = status;
    }

    const [users, total] = await this.repository.findAndCount({
      where,
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
      select: ['id', 'email', 'nickname', 'avatar', 'testCount', 'lastTestAt', 'status', 'createdAt'],
    });

    return {
      total,
      page,
      limit,
      users,
    };
  }

  async countByUserId(userId: number): Promise<number> {
    const user = await this.repository.findOne({
      where: { id: userId },
      select: ['testCount'],
    });
    return user?.testCount || 0;
  }
}

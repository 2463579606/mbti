/**
 * User Service
 */

import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { UserRepository } from '../repository/repositories';
import { User } from '../entities/user.entity';
import { CreateUserDto, UserStatus } from '../domain/user.entity';
import { generateAnonymousId } from '../../pkg/utils/token';
import { ErrorCode } from '../../pkg/errors/errors';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  /**
   * Find or create a user
   */
  async findOrCreate(dto: CreateUserDto): Promise<User> {
    // Try to find existing user by email or anonymous ID
    let user = await this.userRepository.findByEmailOrAnonymous(
      dto.email || null,
      dto.anonymousId || null
    );

    if (!user) {
      // Create new user
      const createDto: CreateUserDto = {
        ...dto,
        anonymousId: dto.anonymousId || generateAnonymousId(),
      };
      user = await this.userRepository.create(createDto);
    }

    return user;
  }

  /**
   * Find user by ID
   */
  async findById(id: number): Promise<User> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException(ErrorCode.USER_NOT_FOUND);
    }
    return user;
  }

  /**
   * Find user by anonymous ID
   */
  async findByAnonymousId(anonymousId: string): Promise<User> {
    const user = await this.userRepository.findByAnonymousId(anonymousId);
    if (!user) {
      throw new NotFoundException(ErrorCode.USER_NOT_FOUND);
    }
    return user;
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new NotFoundException(ErrorCode.USER_NOT_FOUND);
    }
    return user;
  }

  /**
   * Update user
   */
  async update(id: number, dto: Partial<CreateUserDto>): Promise<User> {
    const user = await this.findById(id);

    // Check if email is already taken
    if (dto.email && dto.email !== user.email) {
      const existing = await this.userRepository.findByEmail(dto.email);
      if (existing) {
        throw new ConflictException('Email already exists');
      }
    }

    Object.assign(user, dto);
    return await this.userRepository.update(user);
  }

  /**
   * Increment test count
   */
  async incrementTestCount(userId: number): Promise<void> {
    await this.userRepository.incrementTestCount(userId);
    await this.userRepository.updateLastTestAt(userId);
  }

  /**
   * Get user test history
   */
  async getTestHistory(userId: number, limit = 10) {
    // This will be implemented when we have the session repository
    return [];
  }

  /**
   * Get user statistics
   */
  async getStatistics(userId: number) {
    const userData = await this.findById(userId);
    const testCount = await this.userRepository.countByUserId(userId);

    return {
      totalTests: testCount,
      lastTestAt: userData.lastTestAt,
    };
  }

  /**
   * Get all users (admin)
   */
  async getAllUsers(page: number = 1, limit: number = 20, status?: string) {
    return this.userRepository.findAll(page, limit, status);
  }

  /**
   * Update user status (admin)
   */
  async updateUserStatus(id: number, status: string) {
    const user = await this.findById(id);
    user.status = status as any;
    return await this.userRepository.update(user);
  }
}

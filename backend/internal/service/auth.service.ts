/**
 * Auth Service
 * Handles user registration and authentication
 */

import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserRepository } from '../repository/repositories';
import { User } from '../entities/user.entity';
import { UserStatus } from '../domain/user.entity';
import { generateAnonymousId } from '../../pkg/utils/token';
import { ErrorCode } from '../../pkg/errors/errors';

interface RegisterDto {
  email: string;
  password: string;
  nickname?: string;
}

interface LoginDto {
  email: string;
  password: string;
}

interface JwtPayload {
  sub: number;
  email: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService
  ) {}

  /**
   * Register new user
   */
  async register(dto: RegisterDto) {
    // Check if email already exists
    const existing = await this.userRepository.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // Create user
    const user = await this.userRepository.create({
      email: dto.email,
      nickname: dto.nickname || dto.email.split('@')[0],
      // Don't store plain password
      password: hashedPassword,
      testCount: 0,
      status: UserStatus.ACTIVE,
    } as any);

    // Generate JWT
    const token = await this.generateToken(user);

    return {
      user: this.sanitizeUser(user),
      token,
    };
  }

  /**
   * Login user
   */
  async login(dto: LoginDto) {
    // Find user by email
    const user = await this.userRepository.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException(ErrorCode.UNAUTHORIZED);
    }

    // Verify password
    const isValid = await bcrypt.compare(dto.password, (user as any).password);
    if (!isValid) {
      throw new UnauthorizedException(ErrorCode.UNAUTHORIZED);
    }

    // Check if user is active
    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException(ErrorCode.USER_BANNED);
    }

    // Generate JWT
    const token = await this.generateToken(user);

    return {
      user: this.sanitizeUser(user),
      token,
    };
  }

  /**
   * Validate JWT token
   */
  async validateToken(payload: JwtPayload) {
    const user = await this.userRepository.findById(payload.sub);
    if (!user || user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException(ErrorCode.UNAUTHORIZED);
    }
    return this.sanitizeUser(user);
  }

  /**
   * Get user profile
   */
  async getProfile(userId: number) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UnauthorizedException(ErrorCode.USER_NOT_FOUND);
    }
    return this.sanitizeUser(user);
  }

  /**
   * Update user profile
   */
  async updateProfile(userId: number, updates: Partial<{ nickname: string; avatar: string }>) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UnauthorizedException(ErrorCode.USER_NOT_FOUND);
    }

    if (updates.nickname) {
      user.nickname = updates.nickname;
    }
    if (updates.avatar) {
      user.avatar = updates.avatar;
    }

    await this.userRepository.update(user);
    return this.sanitizeUser(user);
  }

  /**
   * Change password
   */
  async changePassword(userId: number, oldPassword: string, newPassword: string) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UnauthorizedException(ErrorCode.USER_NOT_FOUND);
    }

    // Verify old password
    const isValid = await bcrypt.compare(oldPassword, (user as any).password);
    if (!isValid) {
      throw new UnauthorizedException('Invalid current password');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    (user as any).password = hashedPassword;

    await this.userRepository.update(user);
    return { success: true };
  }

  /**
   * Generate JWT token
   */
  private async generateToken(user: User): Promise<string> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email || '',
    };

    return await this.jwtService.signAsync(payload);
  }

  /**
   * Remove sensitive data from user object
   */
  private sanitizeUser(user: User) {
    const { password, ...sanitized } = user as any;
    return sanitized;
  }
}

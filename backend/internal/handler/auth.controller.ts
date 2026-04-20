/**
 * Auth Controller
 * Handles user authentication endpoints
 */

import { Controller, Post, Get, Body, UseGuards, Req, Put } from '@nestjs/common';
// import { ThrottlerGuard } from '@nestjs/throttler';  // Temporarily disabled
import { AuthService } from '../service/auth.service';
import { JwtService } from '@nestjs/jwt';
import { successResponse } from '../../pkg/response/response';

@Controller('auth')
// @UseGuards(ThrottlerGuard)  // Temporarily disabled
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService
  ) {}

  /**
   * Register new user
   * POST /api/v1/auth/register
   */
  @Post('register')
  async register(
    @Body('email') email: string,
    @Body('password') password: string,
    @Body('nickname') nickname?: string
  ) {
    const result = await this.authService.register({ email, password, nickname });
    return successResponse(result, 'User registered successfully', 201);
  }

  /**
   * Login user
   * POST /api/v1/auth/login
   */
  @Post('login')
  async login(
    @Body('email') email: string,
    @Body('password') password: string
  ) {
    const result = await this.authService.login({ email, password });
    return successResponse(result);
  }

  /**
   * Get current user profile
   * GET /api/v1/auth/me
   */
  @Get('me')
  async getProfile(@Req() req: any) {
    const userId = req.user?.id;
    if (!userId) {
      return successResponse(null, 'Unauthorized', 401);
    }
    const user = await this.authService.getProfile(userId);
    return successResponse(user);
  }

  /**
   * Update user profile
   * PUT /api/v1/auth/profile
   */
  @Put('profile')
  async updateProfile(
    @Req() req: any,
    @Body('nickname') nickname?: string,
    @Body('avatar') avatar?: string
  ) {
    const userId = req.user?.id;
    if (!userId) {
      return successResponse(null, 'Unauthorized', 401);
    }
    const user = await this.authService.updateProfile(userId, { nickname, avatar });
    return successResponse(user);
  }

  /**
   * Change password
   * POST /api/v1/auth/change-password
   */
  @Post('change-password')
  async changePassword(
    @Req() req: any,
    @Body('oldPassword') oldPassword: string,
    @Body('newPassword') newPassword: string
  ) {
    const userId = req.user?.id;
    if (!userId) {
      return successResponse(null, 'Unauthorized', 401);
    }
    const result = await this.authService.changePassword(userId, oldPassword, newPassword);
    return successResponse(result);
  }

  /**
   * Logout (client-side only, invalidate token if needed)
   * POST /api/v1/auth/logout
   */
  @Post('logout')
  async logout() {
    // For JWT, logout is handled client-side by removing the token
    // For session tokens, we could invalidate them in Redis
    return successResponse({ success: true });
  }
}

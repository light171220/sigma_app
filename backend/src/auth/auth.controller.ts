import { Controller, Post, Body, Get, Put, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, RefreshTokenDto, ForgotPasswordDto, ResetPasswordDto, OAuthDto, ChangePasswordDto, UpdateProfileDto } from './auth.dto';
import { JwtAuthGuard } from '../common/guards';

@ApiTags('authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register new user' })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @ApiOperation({ summary: 'User login' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh JWT token' })
  @ApiResponse({ status: 200, description: 'Token refreshed successfully' })
  async refresh(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshToken(refreshTokenDto.refreshToken);
  }

  @Post('oauth/:provider')
  @ApiOperation({ summary: 'OAuth login' })
  @ApiResponse({ status: 200, description: 'OAuth login successful' })
  async oauth(@Body() oauthDto: OAuthDto) {
    return this.authService.oauth(oauthDto.provider, oauthDto.token);
  }

  @Post('forgot-password')
  @ApiOperation({ summary: 'Request password reset' })
  @ApiResponse({ status: 200, description: 'Password reset email sent' })
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto.email);
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Reset password' })
  @ApiResponse({ status: 200, description: 'Password reset successfully' })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto.token, resetPasswordDto.password);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user profile' })
  @ApiResponse({ status: 200, description: 'Profile retrieved successfully' })
  async getProfile(@Request() req) {
    return this.authService.getProfile(req.user.id);
  }

  @Put('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update user profile' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  async updateProfile(@Request() req, @Body() updateProfileDto: UpdateProfileDto) {
    return this.authService.updateProfile(req.user.id, updateProfileDto);
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change password' })
  @ApiResponse({ status: 200, description: 'Password changed successfully' })
  async changePassword(@Request() req, @Body() changePasswordDto: ChangePasswordDto) {
    return this.authService.changePassword(req.user.id, changePasswordDto.currentPassword, changePasswordDto.newPassword);
  }

  @Post('verify-email')
  @ApiOperation({ summary: 'Verify email address' })
  @ApiResponse({ status: 200, description: 'Email verified successfully' })
  async verifyEmail(@Body() body: { token: string }) {
    return this.authService.verifyEmail(body.token);
  }
}
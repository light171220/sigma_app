import { Injectable, BadRequestException, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

import { User } from '../users/user.entity';
import { RegisterDto, LoginDto, UpdateProfileDto } from './auth.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto) {
    const existingUser = await this.userRepository.findOne({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new BadRequestException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 12);
    const verificationToken = crypto.randomBytes(32).toString('hex');

    const user = this.userRepository.create({
      email: registerDto.email,
      passwordHash: hashedPassword,
      firstName: registerDto.firstName,
      lastName: registerDto.lastName,
      emailVerified: false,
      verificationToken,
    });

    await this.userRepository.save(user);

    const tokens = await this.generateTokens(user);

    return {
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.userRepository.findOne({
      where: { email: loginDto.email },
    });

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    user.lastLoginAt = new Date();
    await this.userRepository.save(user);

    const tokens = await this.generateTokens(user);

    return {
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      });

      const user = await this.userRepository.findOne({
        where: { id: payload.sub },
      });

      if (!user) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      return this.generateTokens(user);
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async oauth(provider: string, token: string) {
    let userInfo;
    
    if (provider === 'google') {
      userInfo = await this.verifyGoogleToken(token);
    } else {
      throw new BadRequestException('Unsupported OAuth provider');
    }

    let user = await this.userRepository.findOne({
      where: { email: userInfo.email },
    });

    if (!user) {
      user = this.userRepository.create({
        email: userInfo.email,
        firstName: userInfo.firstName,
        lastName: userInfo.lastName,
        avatarUrl: userInfo.picture,
        oauthProvider: provider,
        oauthId: userInfo.id,
        emailVerified: true,
      });
    } else {
      user.oauthProvider = provider;
      user.oauthId = userInfo.id;
      user.lastLoginAt = new Date();
    }

    await this.userRepository.save(user);

    const tokens = await this.generateTokens(user);

    return {
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  async forgotPassword(email: string) {
    const user = await this.userRepository.findOne({ where: { email } });
    
    if (!user) {
      return { message: 'If email exists, reset link has been sent' };
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000);

    user.resetToken = resetToken;
    user.resetTokenExpiry = resetTokenExpiry;
    await this.userRepository.save(user);

    return { message: 'Password reset link sent to email' };
  }

  async resetPassword(token: string, newPassword: string) {
    const user = await this.userRepository.findOne({
      where: { resetToken: token },
    });

    if (!user || !user.resetTokenExpiry || user.resetTokenExpiry < new Date()) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    user.passwordHash = hashedPassword;
    user.resetToken = null;
    user.resetTokenExpiry = null;
    await this.userRepository.save(user);

    return { message: 'Password reset successfully' };
  }

  async getProfile(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.sanitizeUser(user);
  }

  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    Object.assign(user, updateProfileDto);
    await this.userRepository.save(user);

    return this.sanitizeUser(user);
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user || !user.passwordHash) {
      throw new NotFoundException('User not found');
    }

    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isCurrentPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    user.passwordHash = hashedPassword;
    await this.userRepository.save(user);

    return { message: 'Password changed successfully' };
  }

  async verifyEmail(token: string) {
    const user = await this.userRepository.findOne({
      where: { verificationToken: token },
    });

    if (!user) {
      throw new BadRequestException('Invalid verification token');
    }

    user.emailVerified = true;
    user.verificationToken = null;
    await this.userRepository.save(user);

    return { message: 'Email verified successfully' };
  }

  private async generateTokens(user: User) {
    const payload = { email: user.email, sub: user.id };
    
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN'),
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  private async verifyGoogleToken(token: string) {
    return {
      id: 'google_user_id',
      email: 'user@example.com',
      firstName: 'John',
      lastName: 'Doe',
      picture: 'https://example.com/avatar.jpg',
    };
  }

  private sanitizeUser(user: User) {
    const { passwordHash, resetToken, resetTokenExpiry, verificationToken, ...sanitized } = user;
    return sanitized;
  }
}
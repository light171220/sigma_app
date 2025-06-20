import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from './user.entity';
import { UpdateUserDto } from './user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findAll(): Promise<User[]> {
    return this.userRepository.find({
      select: ['id', 'email', 'firstName', 'lastName', 'subscriptionPlan', 'subscriptionStatus', 'createdAt'],
    });
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      select: ['id', 'email', 'firstName', 'lastName', 'avatarUrl', 'subscriptionPlan', 'subscriptionStatus', 'emailVerified', 'createdAt', 'updatedAt'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findByEmail(email: string): Promise<User> {
    return this.userRepository.findOne({ where: { email } });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);
    
    Object.assign(user, updateUserDto);
    await this.userRepository.save(user);

    return user;
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    await this.userRepository.remove(user);
  }

  async getUserStats(userId: string) {
    const user = await this.findOne(userId);
    
    const appsCount = await this.userRepository
      .createQueryBuilder('user')
      .leftJoin('user.apps', 'app')
      .where('user.id = :userId', { userId })
      .select('COUNT(app.id)', 'count')
      .getRawOne();

    const deploymentsCount = await this.userRepository
      .createQueryBuilder('user')
      .leftJoin('user.apps', 'app')
      .leftJoin('app.deployments', 'deployment')
      .where('user.id = :userId', { userId })
      .select('COUNT(deployment.id)', 'count')
      .getRawOne();

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        subscriptionPlan: user.subscriptionPlan,
        subscriptionStatus: user.subscriptionStatus,
      },
      stats: {
        appsCount: parseInt(appsCount.count) || 0,
        deploymentsCount: parseInt(deploymentsCount.count) || 0,
        memberSince: user.createdAt,
      },
    };
  }
}
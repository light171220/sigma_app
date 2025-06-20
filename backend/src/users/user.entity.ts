import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { App } from '../apps/app.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ name: 'password_hash', nullable: true })
  passwordHash: string;

  @Column({ name: 'first_name', nullable: true })
  firstName: string;

  @Column({ name: 'last_name', nullable: true })
  lastName: string;

  @Column({ name: 'avatar_url', nullable: true })
  avatarUrl: string;

  @Column({ name: 'subscription_plan', default: 'free' })
  subscriptionPlan: string;

  @Column({ name: 'subscription_status', default: 'active' })
  subscriptionStatus: string;

  @Column({ name: 'email_verified', default: false })
  emailVerified: boolean;

  @Column({ name: 'oauth_provider', nullable: true })
  oauthProvider: string;

  @Column({ name: 'oauth_id', nullable: true })
  oauthId: string;

  @Column({ name: 'reset_token', nullable: true })
  resetToken: string;

  @Column({ name: 'reset_token_expiry', nullable: true })
  resetTokenExpiry: Date;

  @Column({ name: 'verification_token', nullable: true })
  verificationToken: string;

  @Column({ name: 'last_login_at', nullable: true })
  lastLoginAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => App, app => app.user)
  apps: App[];
}
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { App } from '../apps/app.entity';

@Entity('deployments')
export class Deployment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'app_id' })
  appId: string;

  @Column({ name: 'deployment_id', nullable: true })
  deploymentId: string;

  @Column({ default: 'all' })
  platform: string;

  @Column({ default: 'pending' })
  status: string;

  @Column({ name: 'build_logs', type: 'text', nullable: true })
  buildLogs: string;

  @Column({ type: 'jsonb', nullable: true })
  artifacts: any;

  @Column({ name: 'started_at' })
  startedAt: Date;

  @Column({ name: 'completed_at', nullable: true })
  completedAt: Date;

  @Column({ name: 'error_message', type: 'text', nullable: true })
  errorMessage: string;

  @ManyToOne(() => App, app => app.deployments)
  @JoinColumn({ name: 'app_id' })
  app: App;
}
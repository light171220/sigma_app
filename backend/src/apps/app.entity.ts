import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Deployment } from '../deployment/deployment.entity';

@Entity('apps')
export class App {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column()
  name: string;

  @Column({ name: 'package_name', unique: true })
  packageName: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  category: string;

  @Column({ name: 'app_config', type: 'jsonb' })
  appConfig: any;

  @Column({ type: 'jsonb', default: '[]' })
  screens: any[];

  @Column({ name: 'database_schema', type: 'jsonb', default: '{"tables": []}' })
  databaseSchema: any;

  @Column({ type: 'jsonb', default: '[]' })
  workflows: any[];

  @Column({ type: 'jsonb', default: '{}' })
  theme: any;

  @Column({ name: 'amplify_app_id', nullable: true })
  amplifyAppId: string;

  @Column({ name: 'github_repo_url', nullable: true })
  githubRepoUrl: string;

  @Column({ name: 'admin_credentials', type: 'jsonb', nullable: true })
  adminCredentials: any;

  @Column({ default: 'draft' })
  status: string;

  @Column({ name: 'build_count', default: 0 })
  buildCount: number;

  @Column({ name: 'last_deployed_at', nullable: true })
  lastDeployedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => User, user => user.apps)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => Deployment, deployment => deployment.app)
  deployments: Deployment[];
}
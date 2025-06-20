import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';

import { DeploymentController } from './deployment.controller';
import { DeploymentService } from './deployment.service';
import { GitHubService } from './github.service';
import { Deployment } from './deployment.entity';
import { AppsModule } from '../apps/apps.module';
import { CodeGenerationModule } from '../code-generation/code-generation.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Deployment]),
    BullModule.registerQueue({
      name: 'deployment',
    }),
    AppsModule,
    CodeGenerationModule,
  ],
  controllers: [DeploymentController],
  providers: [DeploymentService, GitHubService],
  exports: [DeploymentService],
})
export class DeploymentModule {}
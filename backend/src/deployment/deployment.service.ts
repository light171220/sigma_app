import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InjectQueue } from '@nestjs/bull';
import { Repository } from 'typeorm';
import { Queue } from 'bull';
import { ConfigService } from '@nestjs/config';

import { Deployment } from './deployment.entity';
import { AppsService } from '../apps/apps.service';
import { CodeGenerationService } from '../code-generation/code-generation.service';
import { GitHubService } from './github.service';
import { DeployAppDto, StoreSubmissionDto } from './deployment.dto';
import { DeploymentResult } from './deployment.interface';

@Injectable()
export class DeploymentService {
  constructor(
    @InjectRepository(Deployment)
    private deploymentRepository: Repository<Deployment>,
    @InjectQueue('deployment') private deploymentQueue: Queue,
    private appsService: AppsService,
    private codeGenerationService: CodeGenerationService,
    private githubService: GitHubService,
    private configService: ConfigService,
  ) {}

  async deployApp(appId: string, deployDto: DeployAppDto): Promise<{ message: string; deploymentId: string }> {
    const app = await this.appsService.findOne(appId);

    const deployment = this.deploymentRepository.create({
      appId,
      platform: deployDto.platform || 'all',
      status: 'pending',
      startedAt: new Date(),
    });

    await this.deploymentRepository.save(deployment);

    const job = await this.deploymentQueue.add('deploy-app', {
      appId,
      deploymentId: deployment.id,
      options: deployDto.options || {},
    });

    return {
      message: 'Deployment started',
      deploymentId: deployment.id,
    };
  }

  async processDeployment(appId: string, deploymentId: string, options: any): Promise<DeploymentResult> {
    try {
      await this.updateDeploymentStatus(deploymentId, 'building');

      const app = await this.appsService.findOne(appId);
      
      const generatedCode = await this.codeGenerationService.generateCompleteApp(appId);

      const githubRepo = await this.githubService.createRepository(app, generatedCode);

      const amplifyApp = await this.createAmplifyApp(app);

      await this.connectGitHubToAmplify(githubRepo, amplifyApp);

      const deployment = await this.triggerDeployment(amplifyApp, githubRepo);

      const adminCredentials = await this.generateAdminCredentials(app);

      await this.updateDeploymentStatus(deploymentId, 'success', {
        githubRepo: githubRepo.url,
        amplifyApp: amplifyApp.url,
        adminCredentials,
      });

      app.githubRepoUrl = githubRepo.url;
      app.amplifyAppId = amplifyApp.appId;
      app.adminCredentials = adminCredentials;
      app.status = 'deployed';
      app.lastDeployedAt = new Date();
      app.buildCount += 1;
      
      await this.appsService.update(appId, app);

      return {
        githubRepo: githubRepo.url,
        amplifyApp: amplifyApp.url,
        adminCredentials,
        deployment,
      };
    } catch (error) {
      await this.updateDeploymentStatus(deploymentId, 'failed', null, error.message);
      throw error;
    }
  }

  async getDeployments(appId: string) {
    return this.deploymentRepository.find({
      where: { appId },
      order: { startedAt: 'DESC' },
    });
  }

  async getDeployment(appId: string, deploymentId: string) {
    const deployment = await this.deploymentRepository.findOne({
      where: { id: deploymentId, appId },
    });

    if (!deployment) {
      throw new NotFoundException('Deployment not found');
    }

    return deployment;
  }

  async getDeploymentLogs(appId: string, deploymentId: string) {
    const deployment = await this.getDeployment(appId, deploymentId);
    return {
      logs: deployment.buildLogs || 'No logs available',
      deployment: {
        id: deployment.id,
        status: deployment.status,
        startedAt: deployment.startedAt,
        completedAt: deployment.completedAt,
      },
    };
  }

  async retryDeployment(appId: string, deploymentId: string) {
    const deployment = await this.getDeployment(appId, deploymentId);
    
    if (deployment.status === 'pending' || deployment.status === 'building') {
      throw new Error('Deployment is already in progress');
    }

    deployment.status = 'pending';
    deployment.startedAt = new Date();
    deployment.completedAt = null;
    deployment.errorMessage = null;
    await this.deploymentRepository.save(deployment);

    const job = await this.deploymentQueue.add('deploy-app', {
      appId,
      deploymentId: deployment.id,
      options: {},
    });

    return {
      message: 'Deployment retry started',
      jobId: job.id.toString(),
    };
  }

  async cancelDeployment(appId: string, deploymentId: string) {
    const deployment = await this.getDeployment(appId, deploymentId);
    
    if (deployment.status !== 'pending' && deployment.status !== 'building') {
      throw new Error('Cannot cancel completed deployment');
    }

    deployment.status = 'cancelled';
    deployment.completedAt = new Date();
    await this.deploymentRepository.save(deployment);

    return { message: 'Deployment cancelled' };
  }

  async submitToStores(appId: string, storeDto: StoreSubmissionDto) {
    const app = await this.appsService.findOne(appId);
    
    if (app.status !== 'deployed') {
      throw new Error('App must be deployed before store submission');
    }

    const results = [];

    if (storeDto.stores.includes('google-play')) {
      const googlePlayResult = await this.submitToGooglePlay(app);
      results.push(googlePlayResult);
    }

    if (storeDto.stores.includes('app-store')) {
      const appStoreResult = await this.submitToAppStore(app);
      results.push(appStoreResult);
    }

    return {
      message: 'Store submissions initiated',
      results,
    };
  }

  async getStoreStatus(appId: string) {
    const app = await this.appsService.findOne(appId);
    
    return {
      googlePlay: {
        status: 'not_submitted',
        url: null,
      },
      appStore: {
        status: 'not_submitted',
        url: null,
      },
    };
  }

  private async createAmplifyApp(app: any) {
    const appId = `amplify-${app.packageName.replace(/\./g, '-')}`;
    
    return {
      appId,
      url: `https://${appId}.amplifyapp.com`,
    };
  }

  private async connectGitHubToAmplify(githubRepo: any, amplifyApp: any) {
    return true;
  }

  private async triggerDeployment(amplifyApp: any, githubRepo: any) {
    return {
      id: `deploy-${Date.now()}`,
      status: 'started',
      url: amplifyApp.url,
    };
  }

  private async generateAdminCredentials(app: any) {
    return {
      username: 'admin',
      password: this.generateRandomPassword(),
      url: `https://admin.${app.packageName.replace(/\./g, '-')}.amplifyapp.com`,
    };
  }

  private async submitToGooglePlay(app: any) {
    return {
      store: 'google-play',
      status: 'submitted',
      trackingId: `gp-${Date.now()}`,
    };
  }

  private async submitToAppStore(app: any) {
    return {
      store: 'app-store',
      status: 'submitted',
      trackingId: `as-${Date.now()}`,
    };
  }

  private async updateDeploymentStatus(deploymentId: string, status: string, artifacts?: any, errorMessage?: string) {
    const deployment = await this.deploymentRepository.findOne({
      where: { id: deploymentId },
    });

    if (deployment) {
      deployment.status = status;
      deployment.artifacts = artifacts;
      deployment.errorMessage = errorMessage;
      
      if (status === 'success' || status === 'failed' || status === 'cancelled') {
        deployment.completedAt = new Date();
      }

      await this.deploymentRepository.save(deployment);
    }
  }

  private generateRandomPassword(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }
}
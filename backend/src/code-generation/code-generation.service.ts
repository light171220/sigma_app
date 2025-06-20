import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

import { AppsService } from '../apps/apps.service';
import { FlutterGeneratorService } from './flutter-generator.service';
import { AmplifyGeneratorService } from './amplify-generator.service';
import { TemplateService } from './template.service';
import { GeneratedApp, GenerationStatus, GenerationLogs } from './generation.interface';

@Injectable()
export class CodeGenerationService {
  private generationStatus = new Map<string, GenerationStatus>();
  private generationLogs = new Map<string, GenerationLogs>();

  constructor(
    @InjectQueue('code-generation') private codeGenerationQueue: Queue,
    private appsService: AppsService,
    private flutterGenerator: FlutterGeneratorService,
    private amplifyGenerator: AmplifyGeneratorService,
    private templateService: TemplateService,
  ) {}

  async generateCompleteApp(appId: string): Promise<{ message: string; jobId: string }> {
    const app = await this.appsService.findOne(appId);
    
    this.generationStatus.set(appId, {
      status: 'pending',
      progress: 0,
      startedAt: new Date(),
    });

    this.generationLogs.set(appId, {
      logs: ['Generation started...'],
      updatedAt: new Date(),
    });

    const job = await this.codeGenerationQueue.add('generate-app', { appId });

    return {
      message: 'Code generation started',
      jobId: job.id.toString(),
    };
  }

  async processGeneration(appId: string): Promise<GeneratedApp> {
    try {
      this.updateStatus(appId, 'generating', 10);
      this.addLog(appId, 'Fetching app configuration...');

      const app = await this.appsService.findOne(appId);

      this.updateStatus(appId, 'generating', 25);
      this.addLog(appId, 'Generating Flutter application...');

      const flutterCode = await this.flutterGenerator.generate(app);

      this.updateStatus(appId, 'generating', 50);
      this.addLog(appId, 'Generating Amplify backend...');

      const amplifyCode = await this.amplifyGenerator.generate(app);

      this.updateStatus(appId, 'generating', 75);
      this.addLog(appId, 'Generating GitHub Actions workflows...');

      const githubActions = await this.generateGitHubActions(app);

      this.updateStatus(appId, 'generating', 90);
      this.addLog(appId, 'Generating admin dashboard...');

      const adminDashboard = await this.generateAdminDashboard(app);

      this.updateStatus(appId, 'completed', 100);
      this.addLog(appId, 'Code generation completed successfully!');

      const generatedApp: GeneratedApp = {
        flutterCode,
        amplifyCode,
        githubActions,
        adminDashboard,
        generatedAt: new Date(),
      };

      return generatedApp;
    } catch (error) {
      this.updateStatus(appId, 'failed', 0);
      this.addLog(appId, `Generation failed: ${error.message}`);
      throw error;
    }
  }

  async getGenerationStatus(appId: string): Promise<GenerationStatus> {
    const status = this.generationStatus.get(appId);
    if (!status) {
      throw new NotFoundException('Generation status not found');
    }
    return status;
  }

  async getGenerationLogs(appId: string): Promise<GenerationLogs> {
    const logs = this.generationLogs.get(appId);
    if (!logs) {
      throw new NotFoundException('Generation logs not found');
    }
    return logs;
  }

  async generatePreview(appId: string): Promise<{ previewUrl: string }> {
    const app = await this.appsService.findOne(appId);
    
    const flutterCode = await this.flutterGenerator.generateMainScreen(app);
    
    const previewId = `preview_${appId}_${Date.now()}`;
    
    return {
      previewUrl: `https://sigma-preview.com/${previewId}`,
    };
  }

  async getDownloadLink(appId: string): Promise<{ downloadUrl: string }> {
    const status = this.generationStatus.get(appId);
    
    if (!status || status.status !== 'completed') {
      throw new NotFoundException('Generated code not available');
    }

    const downloadId = `download_${appId}_${Date.now()}`;
    
    return {
      downloadUrl: `https://sigma-downloads.s3.amazonaws.com/${downloadId}.zip`,
    };
  }

  private async generateGitHubActions(app: any): Promise<string> {
    return this.templateService.render('github-deploy', {
      appName: app.name,
      packageName: app.packageName,
    });
  }

  private async generateAdminDashboard(app: any): Promise<string> {
    return this.templateService.render('admin-dashboard', {
      appName: app.name,
      databaseSchema: app.databaseSchema,
    });
  }

  private updateStatus(appId: string, status: string, progress: number) {
    const currentStatus = this.generationStatus.get(appId);
    if (currentStatus) {
      currentStatus.status = status;
      currentStatus.progress = progress;
      currentStatus.updatedAt = new Date();
      this.generationStatus.set(appId, currentStatus);
    }
  }

  private addLog(appId: string, message: string) {
    const currentLogs = this.generationLogs.get(appId);
    if (currentLogs) {
      currentLogs.logs.push(`[${new Date().toISOString()}] ${message}`);
      currentLogs.updatedAt = new Date();
      this.generationLogs.set(appId, currentLogs);
    }
  }
}
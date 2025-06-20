import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Octokit } from '@octokit/rest';
import { GitHubRepo } from './deployment.interface';

@Injectable()
export class GitHubService {
  private github: Octokit;
  private orgName: string;

  constructor(private configService: ConfigService) {
    this.github = new Octokit({
      auth: this.configService.get('GITHUB_TOKEN'),
    });
    this.orgName = this.configService.get('GITHUB_ORG') || 'sigma-apps';
  }

  async createRepository(app: any, generatedCode: any): Promise<GitHubRepo> {
    const repoName = `${app.packageName.replace(/\./g, '-')}-app`;
    
    try {
      const repo = await this.github.repos.createInOrg({
        org: this.orgName,
        name: repoName,
        private: true,
        description: `Generated Flutter app: ${app.name}`,
        auto_init: true,
      });

      await this.commitGeneratedCode(repo.data.full_name, generatedCode);
      await this.addDeploymentSecrets(repo.data.full_name, app);

      return {
        name: repo.data.name,
        fullName: repo.data.full_name,
        url: repo.data.html_url,
        cloneUrl: repo.data.clone_url,
        sshUrl: repo.data.ssh_url,
      };
    } catch (error) {
      if (error.status === 422) {
        const existingRepo = await this.github.repos.get({
          owner: this.orgName,
          repo: repoName,
        });

        await this.commitGeneratedCode(existingRepo.data.full_name, generatedCode);
        
        return {
          name: existingRepo.data.name,
          fullName: existingRepo.data.full_name,
          url: existingRepo.data.html_url,
          cloneUrl: existingRepo.data.clone_url,
          sshUrl: existingRepo.data.ssh_url,
        };
      }
      throw error;
    }
  }

  private async commitGeneratedCode(repoFullName: string, generatedCode: any) {
    const [owner, repo] = repoFullName.split('/');

    try {
      const { data: ref } = await this.github.git.getRef({
        owner,
        repo,
        ref: 'heads/main',
      });

      const { data: commit } = await this.github.git.getCommit({
        owner,
        repo,
        commit_sha: ref.object.sha,
      });

      const files = this.prepareFiles(generatedCode);
      const tree = await this.createTree(owner, repo, commit.tree.sha, files);

      const newCommit = await this.github.git.createCommit({
        owner,
        repo,
        message: 'Generated app code',
        tree: tree.sha,
        parents: [ref.object.sha],
      });

      await this.github.git.updateRef({
        owner,
        repo,
        ref: 'heads/main',
        sha: newCommit.data.sha,
      });
    } catch (error) {
      console.error('Error committing code:', error);
      throw error;
    }
  }

  private async createTree(owner: string, repo: string, baseTreeSha: string, files: Array<{ path: string; content: string }>) {
    const tree = files.map(file => ({
      path: file.path,
      mode: '100644' as const,
      type: 'blob' as const,
      content: file.content,
    }));

    const { data } = await this.github.git.createTree({
      owner,
      repo,
      tree,
      base_tree: baseTreeSha,
    });

    return data;
  }

  private prepareFiles(generatedCode: any): Array<{ path: string; content: string }> {
    const files = [];

    if (generatedCode.flutterCode) {
      Object.entries(generatedCode.flutterCode).forEach(([path, content]) => {
        files.push({ path, content: content as string });
      });
    }

    if (generatedCode.amplifyCode) {
      Object.entries(generatedCode.amplifyCode).forEach(([path, content]) => {
        files.push({ path, content: content as string });
      });
    }

    if (generatedCode.githubActions) {
      files.push({
        path: '.github/workflows/deploy.yml',
        content: generatedCode.githubActions,
      });
    }

    if (generatedCode.adminDashboard) {
      files.push({
        path: 'admin/index.html',
        content: generatedCode.adminDashboard,
      });
    }

    files.push({
      path: 'README.md',
      content: this.generateReadme(),
    });

    return files;
  }

  private async addDeploymentSecrets(repoFullName: string, app: any) {
    const [owner, repo] = repoFullName.split('/');

    try {
      const { data: publicKey } = await this.github.actions.getRepoPublicKey({
        owner,
        repo,
      });

      const secrets = {
        AWS_ACCESS_KEY_ID: this.configService.get('AWS_ACCESS_KEY_ID'),
        AWS_SECRET_ACCESS_KEY: this.configService.get('AWS_SECRET_ACCESS_KEY'),
        AMPLIFY_APP_ID: app.amplifyAppId || 'pending',
      };

      for (const [secretName, secretValue] of Object.entries(secrets)) {
        if (secretValue) {
          const encryptedValue = await this.encryptSecret(secretValue, publicKey.key);
          
          await this.github.actions.createOrUpdateRepoSecret({
            owner,
            repo,
            secret_name: secretName,
            encrypted_value: encryptedValue,
            key_id: publicKey.key_id,
          });
        }
      }
    } catch (error) {
      console.error('Error adding secrets:', error);
    }
  }

  private async encryptSecret(secret: string, publicKey: string): Promise<string> {
    const crypto = require('crypto');
    const sodium = require('sodium-native');
    
    const messageBytes = Buffer.from(secret);
    const keyBytes = Buffer.from(publicKey, 'base64');
    const encryptedBytes = Buffer.allocUnsafe(messageBytes.length + sodium.crypto_box_SEALBYTES);
    
    sodium.crypto_box_seal(encryptedBytes, messageBytes, keyBytes);
    
    return encryptedBytes.toString('base64');
  }

  private generateReadme(): string {
    return `# Generated Flutter App

This is an automatically generated Flutter application created by Sigma.

## Getting Started

1. Install Flutter: https://flutter.dev/docs/get-started/install
2. Run \`flutter pub get\` to install dependencies
3. Run \`flutter run\` to start the app

## Deployment

This repository is configured with GitHub Actions for automatic deployment to AWS Amplify.

## Admin Dashboard

Access the admin dashboard at: admin/index.html

## Support

For support, please contact the Sigma team.
`;
  }
}
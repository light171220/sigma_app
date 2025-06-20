import { Injectable } from '@nestjs/common';
import { TemplateService } from './template.service';
import { AmplifyProject, DatabaseTable, DatabaseField } from './generation.interface';

@Injectable()
export class AmplifyGeneratorService {
  constructor(private templateService: TemplateService) {}

  async generate(app: any): Promise<AmplifyProject> {
    const dataSchema = await this.generateDataSchema(app.databaseSchema);
    const authConfig = await this.generateAuthConfig();
    const storageConfig = await this.generateStorageConfig();
    const backendConfig = await this.generateBackendConfig();

    return {
      'amplify/data/resource.ts': dataSchema,
      'amplify/auth/resource.ts': authConfig,
      'amplify/storage/resource.ts': storageConfig,
      'amplify/backend.ts': backendConfig,
    };
  }

  private async generateDataSchema(databaseSchema: any): Promise<string> {
    const models = databaseSchema.tables.map((table: DatabaseTable) => {
      const fields = table.fields
        .filter(field => field.name !== 'id')
        .map(field => {
          const amplifyType = this.mapToAmplifyType(field);
          const constraints = this.generateFieldConstraints(field);
          return `      ${field.name}: a.${amplifyType}()${constraints},`;
        })
        .join('\n');

      return `  ${table.name}: a
    .model({
${fields}
    })
    .authorization(allow => [allow.owner()]),`;
    }).join('\n\n');

    return this.templateService.render('amplify-data', {
      models,
    });
  }

  private async generateAuthConfig(): Promise<string> {
    return this.templateService.render('amplify-auth', {});
  }

  private async generateStorageConfig(): Promise<string> {
    return this.templateService.render('amplify-storage', {});
  }

  private async generateBackendConfig(): Promise<string> {
    return this.templateService.render('amplify-backend', {});
  }

  private mapToAmplifyType(field: DatabaseField): string {
    switch (field.type) {
      case 'string':
        return 'string';
      case 'text':
        return 'string';
      case 'integer':
        return 'integer';
      case 'float':
        return 'float';
      case 'boolean':
        return 'boolean';
      case 'date':
        return 'date';
      case 'datetime':
        return 'datetime';
      case 'email':
        return 'email';
      case 'url':
        return 'url';
      case 'json':
        return 'json';
      default:
        return 'string';
    }
  }

  private generateFieldConstraints(field: DatabaseField): string {
    const constraints = [];

    if (field.required) {
      constraints.push('.required()');
    }

    if (field.unique) {
      constraints.push('.unique()');
    }

    if (field.maxLength) {
      constraints.push(`.maxLength(${field.maxLength})`);
    }

    if (field.minLength) {
      constraints.push(`.minLength(${field.minLength})`);
    }

    if (field.min !== undefined) {
      constraints.push(`.min(${field.min})`);
    }

    if (field.max !== undefined) {
      constraints.push(`.max(${field.max})`);
    }

    if (field.pattern) {
      constraints.push(`.pattern("${field.pattern}")`);
    }

    if (field.default !== undefined) {
      const defaultValue = typeof field.default === 'string' 
        ? `"${field.default}"` 
        : field.default;
      constraints.push(`.default(${defaultValue})`);
    }

    return constraints.join('');
  }
}
import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';

import { CodeGenerationController } from './code-generation.controller';
import { CodeGenerationService } from './code-generation.service';
import { FlutterGeneratorService } from './flutter-generator.service';
import { AmplifyGeneratorService } from './amplify-generator.service';
import { TemplateService } from './template.service';
import { AppsModule } from '../apps/apps.module';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'code-generation',
    }),
    AppsModule,
  ],
  controllers: [CodeGenerationController],
  providers: [
    CodeGenerationService,
    FlutterGeneratorService,
    AmplifyGeneratorService,
    TemplateService,
  ],
  exports: [CodeGenerationService],
})
export class CodeGenerationModule {}
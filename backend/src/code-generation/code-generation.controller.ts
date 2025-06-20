import { Controller, Post, Get, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

import { CodeGenerationService } from './code-generation.service';
import { JwtAuthGuard, AppOwnerGuard } from '../common/guards';

@ApiTags('code-generation')
@Controller('apps')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CodeGenerationController {
  constructor(private readonly codeGenerationService: CodeGenerationService) {}

  @Post(':id/generate')
  @UseGuards(AppOwnerGuard)
  @ApiOperation({ summary: 'Generate app code' })
  @ApiResponse({ status: 200, description: 'Code generation started' })
  async generateApp(@Param('id') id: string) {
    return this.codeGenerationService.generateCompleteApp(id);
  }

  @Get(':id/generate/status')
  @UseGuards(AppOwnerGuard)
  @ApiOperation({ summary: 'Get generation status' })
  @ApiResponse({ status: 200, description: 'Generation status retrieved' })
  async getGenerationStatus(@Param('id') id: string) {
    return this.codeGenerationService.getGenerationStatus(id);
  }

  @Get(':id/generate/logs')
  @UseGuards(AppOwnerGuard)
  @ApiOperation({ summary: 'Get generation logs' })
  @ApiResponse({ status: 200, description: 'Generation logs retrieved' })
  async getGenerationLogs(@Param('id') id: string) {
    return this.codeGenerationService.getGenerationLogs(id);
  }

  @Post(':id/preview')
  @UseGuards(AppOwnerGuard)
  @ApiOperation({ summary: 'Generate app preview' })
  @ApiResponse({ status: 200, description: 'Preview generated successfully' })
  async generatePreview(@Param('id') id: string) {
    return this.codeGenerationService.generatePreview(id);
  }

  @Get(':id/download')
  @UseGuards(AppOwnerGuard)
  @ApiOperation({ summary: 'Download generated code' })
  @ApiResponse({ status: 200, description: 'Code download link generated' })
  async downloadCode(@Param('id') id: string) {
    return this.codeGenerationService.getDownloadLink(id);
  }
}
import { Controller, Post, Get, Param, UseGuards, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

import { DeploymentService } from './deployment.service';
import { DeployAppDto, StoreSubmissionDto } from './deployment.dto';
import { JwtAuthGuard, AppOwnerGuard } from '../common/guards';

@ApiTags('deployment')
@Controller('apps')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DeploymentController {
  constructor(private readonly deploymentService: DeploymentService) {}

  @Post(':id/deploy')
  @UseGuards(AppOwnerGuard)
  @ApiOperation({ summary: 'Deploy app' })
  @ApiResponse({ status: 200, description: 'Deployment started' })
  async deployApp(@Param('id') id: string, @Body() deployDto: DeployAppDto) {
    return this.deploymentService.deployApp(id, deployDto);
  }

  @Get(':id/deployments')
  @UseGuards(AppOwnerGuard)
  @ApiOperation({ summary: 'Get app deployments' })
  @ApiResponse({ status: 200, description: 'Deployments retrieved successfully' })
  async getDeployments(@Param('id') id: string) {
    return this.deploymentService.getDeployments(id);
  }

  @Get(':id/deployments/:deployId')
  @UseGuards(AppOwnerGuard)
  @ApiOperation({ summary: 'Get deployment details' })
  @ApiResponse({ status: 200, description: 'Deployment details retrieved' })
  async getDeployment(@Param('id') id: string, @Param('deployId') deployId: string) {
    return this.deploymentService.getDeployment(id, deployId);
  }

  @Get(':id/deployments/:deployId/logs')
  @UseGuards(AppOwnerGuard)
  @ApiOperation({ summary: 'Get deployment logs' })
  @ApiResponse({ status: 200, description: 'Deployment logs retrieved' })
  async getDeploymentLogs(@Param('id') id: string, @Param('deployId') deployId: string) {
    return this.deploymentService.getDeploymentLogs(id, deployId);
  }

  @Post(':id/deployments/:deployId/retry')
  @UseGuards(AppOwnerGuard)
  @ApiOperation({ summary: 'Retry deployment' })
  @ApiResponse({ status: 200, description: 'Deployment retry started' })
  async retryDeployment(@Param('id') id: string, @Param('deployId') deployId: string) {
    return this.deploymentService.retryDeployment(id, deployId);
  }

  @Post(':id/deployments/:deployId/cancel')
  @UseGuards(AppOwnerGuard)
  @ApiOperation({ summary: 'Cancel deployment' })
  @ApiResponse({ status: 200, description: 'Deployment cancelled' })
  async cancelDeployment(@Param('id') id: string, @Param('deployId') deployId: string) {
    return this.deploymentService.cancelDeployment(id, deployId);
  }

  @Post(':id/stores/submit')
  @UseGuards(AppOwnerGuard)
  @ApiOperation({ summary: 'Submit to app stores' })
  @ApiResponse({ status: 200, description: 'Store submission started' })
  async submitToStores(@Param('id') id: string, @Body() storeDto: StoreSubmissionDto) {
    return this.deploymentService.submitToStores(id, storeDto);
  }

  @Get(':id/stores/status')
  @UseGuards(AppOwnerGuard)
  @ApiOperation({ summary: 'Get store submission status' })
  @ApiResponse({ status: 200, description: 'Store status retrieved' })
  async getStoreStatus(@Param('id') id: string) {
    return this.deploymentService.getStoreStatus(id);
  }
}
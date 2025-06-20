import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body, 
  Param, 
  UseGuards, 
  Request,
  Query 
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

import { AppsService } from './apps.service';
import { 
  CreateAppDto, 
  UpdateAppDto, 
  CreateScreenDto, 
  UpdateScreenDto, 
  CreateComponentDto, 
  UpdateComponentDto,
  UpdateDatabaseSchemaDto,
  DuplicateAppDto
} from './apps.dto';
import { JwtAuthGuard, AppOwnerGuard } from '../common/guards';

@ApiTags('apps')
@Controller('apps')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AppsController {
  constructor(private readonly appsService: AppsService) {}

  @Get()
  @ApiOperation({ summary: 'Get user apps' })
  @ApiResponse({ status: 200, description: 'Apps retrieved successfully' })
  async findAll(@Request() req, @Query('status') status?: string) {
    return this.appsService.findAllByUser(req.user.id, status);
  }

  @Post()
  @ApiOperation({ summary: 'Create new app' })
  @ApiResponse({ status: 201, description: 'App created successfully' })
  async create(@Request() req, @Body() createAppDto: CreateAppDto) {
    return this.appsService.create(req.user.id, createAppDto);
  }

  @Get(':id')
  @UseGuards(AppOwnerGuard)
  @ApiOperation({ summary: 'Get app by ID' })
  @ApiResponse({ status: 200, description: 'App retrieved successfully' })
  async findOne(@Param('id') id: string) {
    return this.appsService.findOne(id);
  }

  @Put(':id')
  @UseGuards(AppOwnerGuard)
  @ApiOperation({ summary: 'Update app' })
  @ApiResponse({ status: 200, description: 'App updated successfully' })
  async update(@Param('id') id: string, @Body() updateAppDto: UpdateAppDto) {
    return this.appsService.update(id, updateAppDto);
  }

  @Delete(':id')
  @UseGuards(AppOwnerGuard)
  @ApiOperation({ summary: 'Delete app' })
  @ApiResponse({ status: 200, description: 'App deleted successfully' })
  async remove(@Param('id') id: string) {
    return this.appsService.remove(id);
  }

  @Post(':id/duplicate')
  @UseGuards(AppOwnerGuard)
  @ApiOperation({ summary: 'Duplicate app' })
  @ApiResponse({ status: 201, description: 'App duplicated successfully' })
  async duplicate(@Param('id') id: string, @Body() duplicateAppDto: DuplicateAppDto) {
    return this.appsService.duplicate(id, duplicateAppDto.name);
  }

  @Get(':id/screens')
  @UseGuards(AppOwnerGuard)
  @ApiOperation({ summary: 'Get app screens' })
  @ApiResponse({ status: 200, description: 'Screens retrieved successfully' })
  async getScreens(@Param('id') id: string) {
    return this.appsService.getScreens(id);
  }

  @Post(':id/screens')
  @UseGuards(AppOwnerGuard)
  @ApiOperation({ summary: 'Create new screen' })
  @ApiResponse({ status: 201, description: 'Screen created successfully' })
  async createScreen(@Param('id') id: string, @Body() createScreenDto: CreateScreenDto) {
    return this.appsService.createScreen(id, createScreenDto);
  }

  @Get(':id/screens/:screenId')
  @UseGuards(AppOwnerGuard)
  @ApiOperation({ summary: 'Get screen by ID' })
  @ApiResponse({ status: 200, description: 'Screen retrieved successfully' })
  async getScreen(@Param('id') id: string, @Param('screenId') screenId: string) {
    return this.appsService.getScreen(id, screenId);
  }

  @Put(':id/screens/:screenId')
  @UseGuards(AppOwnerGuard)
  @ApiOperation({ summary: 'Update screen' })
  @ApiResponse({ status: 200, description: 'Screen updated successfully' })
  async updateScreen(
    @Param('id') id: string, 
    @Param('screenId') screenId: string, 
    @Body() updateScreenDto: UpdateScreenDto
  ) {
    return this.appsService.updateScreen(id, screenId, updateScreenDto);
  }

  @Delete(':id/screens/:screenId')
  @UseGuards(AppOwnerGuard)
  @ApiOperation({ summary: 'Delete screen' })
  @ApiResponse({ status: 200, description: 'Screen deleted successfully' })
  async deleteScreen(@Param('id') id: string, @Param('screenId') screenId: string) {
    return this.appsService.deleteScreen(id, screenId);
  }

  @Get(':id/screens/:screenId/components')
  @UseGuards(AppOwnerGuard)
  @ApiOperation({ summary: 'Get screen components' })
  @ApiResponse({ status: 200, description: 'Components retrieved successfully' })
  async getComponents(@Param('id') id: string, @Param('screenId') screenId: string) {
    return this.appsService.getComponents(id, screenId);
  }

  @Post(':id/screens/:screenId/components')
  @UseGuards(AppOwnerGuard)
  @ApiOperation({ summary: 'Create new component' })
  @ApiResponse({ status: 201, description: 'Component created successfully' })
  async createComponent(
    @Param('id') id: string, 
    @Param('screenId') screenId: string, 
    @Body() createComponentDto: CreateComponentDto
  ) {
    return this.appsService.createComponent(id, screenId, createComponentDto);
  }

  @Put(':id/screens/:screenId/components/:componentId')
  @UseGuards(AppOwnerGuard)
  @ApiOperation({ summary: 'Update component' })
  @ApiResponse({ status: 200, description: 'Component updated successfully' })
  async updateComponent(
    @Param('id') id: string,
    @Param('screenId') screenId: string,
    @Param('componentId') componentId: string,
    @Body() updateComponentDto: UpdateComponentDto
  ) {
    return this.appsService.updateComponent(id, screenId, componentId, updateComponentDto);
  }

  @Delete(':id/screens/:screenId/components/:componentId')
  @UseGuards(AppOwnerGuard)
  @ApiOperation({ summary: 'Delete component' })
  @ApiResponse({ status: 200, description: 'Component deleted successfully' })
  async deleteComponent(
    @Param('id') id: string,
    @Param('screenId') screenId: string,
    @Param('componentId') componentId: string
  ) {
    return this.appsService.deleteComponent(id, screenId, componentId);
  }

  @Get(':id/database')
  @UseGuards(AppOwnerGuard)
  @ApiOperation({ summary: 'Get database schema' })
  @ApiResponse({ status: 200, description: 'Database schema retrieved successfully' })
  async getDatabaseSchema(@Param('id') id: string) {
    return this.appsService.getDatabaseSchema(id);
  }

  @Put(':id/database')
  @UseGuards(AppOwnerGuard)
  @ApiOperation({ summary: 'Update database schema' })
  @ApiResponse({ status: 200, description: 'Database schema updated successfully' })
  async updateDatabaseSchema(@Param('id') id: string, @Body() updateSchemaDto: UpdateDatabaseSchemaDto) {
    return this.appsService.updateDatabaseSchema(id, updateSchemaDto);
  }

  @Post(':id/database/tables')
  @UseGuards(AppOwnerGuard)
  @ApiOperation({ summary: 'Add database table' })
  @ApiResponse({ status: 201, description: 'Table added successfully' })
  async addDatabaseTable(@Param('id') id: string, @Body() tableDto: any) {
    return this.appsService.addDatabaseTable(id, tableDto);
  }

  @Put(':id/database/tables/:tableId')
  @UseGuards(AppOwnerGuard)
  @ApiOperation({ summary: 'Update database table' })
  @ApiResponse({ status: 200, description: 'Table updated successfully' })
  async updateDatabaseTable(@Param('id') id: string, @Param('tableId') tableId: string, @Body() tableDto: any) {
    return this.appsService.updateDatabaseTable(id, tableId, tableDto);
  }

  @Delete(':id/database/tables/:tableId')
  @UseGuards(AppOwnerGuard)
  @ApiOperation({ summary: 'Delete database table' })
  @ApiResponse({ status: 200, description: 'Table deleted successfully' })
  async deleteDatabaseTable(@Param('id') id: string, @Param('tableId') tableId: string) {
    return this.appsService.deleteDatabaseTable(id, tableId);
  }
}
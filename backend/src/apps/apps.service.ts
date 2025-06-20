import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

import { App } from './app.entity';
import { User } from '../users/user.entity';
import { 
  CreateAppDto, 
  UpdateAppDto, 
  CreateScreenDto, 
  UpdateScreenDto, 
  CreateComponentDto, 
  UpdateComponentDto,
  UpdateDatabaseSchemaDto
} from './apps.dto';

@Injectable()
export class AppsService {
  constructor(
    @InjectRepository(App)
    private appRepository: Repository<App>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findAllByUser(userId: string, status?: string): Promise<App[]> {
    const query = this.appRepository.createQueryBuilder('app')
      .where('app.userId = :userId', { userId });

    if (status) {
      query.andWhere('app.status = :status', { status });
    }

    return query.orderBy('app.updatedAt', 'DESC').getMany();
  }

  async create(userId: string, createAppDto: CreateAppDto): Promise<App> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const existingApp = await this.appRepository.findOne({
      where: { userId, name: createAppDto.name },
    });

    if (existingApp) {
      throw new BadRequestException('App with this name already exists');
    }

    const packageName = this.generatePackageName(createAppDto.name);
    
    const app = this.appRepository.create({
      ...createAppDto,
      userId,
      packageName,
      appConfig: createAppDto.appConfig || {},
      screens: createAppDto.screens || [this.createDefaultScreen()],
      databaseSchema: createAppDto.databaseSchema || { tables: [] },
      workflows: createAppDto.workflows || [],
      theme: createAppDto.theme || this.getDefaultTheme(),
      status: 'draft',
      buildCount: 0,
    });

    return this.appRepository.save(app);
  }

  async findOne(id: string): Promise<App> {
    const app = await this.appRepository.findOne({ where: { id } });
    if (!app) {
      throw new NotFoundException('App not found');
    }
    return app;
  }

  async update(id: string, updateAppDto: UpdateAppDto): Promise<App> {
    const app = await this.findOne(id);
    Object.assign(app, updateAppDto);
    return this.appRepository.save(app);
  }

  async remove(id: string): Promise<void> {
    const app = await this.findOne(id);
    await this.appRepository.remove(app);
  }

  async duplicate(id: string, newName: string): Promise<App> {
    const originalApp = await this.findOne(id);
    
    const existingApp = await this.appRepository.findOne({
      where: { userId: originalApp.userId, name: newName },
    });

    if (existingApp) {
      throw new BadRequestException('App with this name already exists');
    }

    const duplicatedApp = this.appRepository.create({
      ...originalApp,
      id: undefined,
      name: newName,
      packageName: this.generatePackageName(newName),
      status: 'draft',
      buildCount: 0,
      amplifyAppId: null,
      githubRepoUrl: null,
      adminCredentials: null,
      lastDeployedAt: null,
      createdAt: undefined,
      updatedAt: undefined,
    });

    return this.appRepository.save(duplicatedApp);
  }

  async getScreens(appId: string) {
    const app = await this.findOne(appId);
    return app.screens;
  }

  async createScreen(appId: string, createScreenDto: CreateScreenDto) {
    const app = await this.findOne(appId);
    const screenId = uuidv4();
    
    const newScreen = {
      id: screenId,
      name: createScreenDto.name,
      isDefault: createScreenDto.isDefault || false,
      components: [],
      navigation: createScreenDto.navigation || {},
    };

    if (newScreen.isDefault) {
      app.screens.forEach(screen => screen.isDefault = false);
    }

    app.screens.push(newScreen);
    await this.appRepository.save(app);
    
    return newScreen;
  }

  async getScreen(appId: string, screenId: string) {
    const app = await this.findOne(appId);
    const screen = app.screens.find(s => s.id === screenId);
    
    if (!screen) {
      throw new NotFoundException('Screen not found');
    }
    
    return screen;
  }

  async updateScreen(appId: string, screenId: string, updateScreenDto: UpdateScreenDto) {
    const app = await this.findOne(appId);
    const screenIndex = app.screens.findIndex(s => s.id === screenId);
    
    if (screenIndex === -1) {
      throw new NotFoundException('Screen not found');
    }

    if (updateScreenDto.isDefault) {
      app.screens.forEach(screen => screen.isDefault = false);
    }

    Object.assign(app.screens[screenIndex], updateScreenDto);
    await this.appRepository.save(app);
    
    return app.screens[screenIndex];
  }

  async deleteScreen(appId: string, screenId: string) {
    const app = await this.findOne(appId);
    const screenIndex = app.screens.findIndex(s => s.id === screenId);
    
    if (screenIndex === -1) {
      throw new NotFoundException('Screen not found');
    }

    if (app.screens.length <= 1) {
      throw new BadRequestException('Cannot delete the last screen');
    }

    app.screens.splice(screenIndex, 1);
    await this.appRepository.save(app);
    
    return { message: 'Screen deleted successfully' };
  }

  async getComponents(appId: string, screenId: string) {
    const screen = await this.getScreen(appId, screenId);
    return screen.components;
  }

  async createComponent(appId: string, screenId: string, createComponentDto: CreateComponentDto) {
    const app = await this.findOne(appId);
    const screenIndex = app.screens.findIndex(s => s.id === screenId);
    
    if (screenIndex === -1) {
      throw new NotFoundException('Screen not found');
    }

    const componentId = uuidv4();
    const newComponent = {
      id: componentId,
      ...createComponentDto,
    };

    app.screens[screenIndex].components.push(newComponent);
    await this.appRepository.save(app);
    
    return newComponent;
  }

  async updateComponent(appId: string, screenId: string, componentId: string, updateComponentDto: UpdateComponentDto) {
    const app = await this.findOne(appId);
    const screenIndex = app.screens.findIndex(s => s.id === screenId);
    
    if (screenIndex === -1) {
      throw new NotFoundException('Screen not found');
    }

    const componentIndex = app.screens[screenIndex].components.findIndex(c => c.id === componentId);
    
    if (componentIndex === -1) {
      throw new NotFoundException('Component not found');
    }

    Object.assign(app.screens[screenIndex].components[componentIndex], updateComponentDto);
    await this.appRepository.save(app);
    
    return app.screens[screenIndex].components[componentIndex];
  }

  async deleteComponent(appId: string, screenId: string, componentId: string) {
    const app = await this.findOne(appId);
    const screenIndex = app.screens.findIndex(s => s.id === screenId);
    
    if (screenIndex === -1) {
      throw new NotFoundException('Screen not found');
    }

    const componentIndex = app.screens[screenIndex].components.findIndex(c => c.id === componentId);
    
    if (componentIndex === -1) {
      throw new NotFoundException('Component not found');
    }

    app.screens[screenIndex].components.splice(componentIndex, 1);
    await this.appRepository.save(app);
    
    return { message: 'Component deleted successfully' };
  }

  async getDatabaseSchema(appId: string) {
    const app = await this.findOne(appId);
    return app.databaseSchema;
  }

  async updateDatabaseSchema(appId: string, updateSchemaDto: UpdateDatabaseSchemaDto) {
    const app = await this.findOne(appId);
    app.databaseSchema = updateSchemaDto.schema;
    await this.appRepository.save(app);
    return app.databaseSchema;
  }

  async addDatabaseTable(appId: string, tableDto: any) {
    const app = await this.findOne(appId);
    const tableId = uuidv4();
    
    const newTable = {
      id: tableId,
      ...tableDto,
    };

    app.databaseSchema.tables.push(newTable);
    await this.appRepository.save(app);
    
    return newTable;
  }

  async updateDatabaseTable(appId: string, tableId: string, tableDto: any) {
    const app = await this.findOne(appId);
    const tableIndex = app.databaseSchema.tables.findIndex(t => t.id === tableId);
    
    if (tableIndex === -1) {
      throw new NotFoundException('Table not found');
    }

    Object.assign(app.databaseSchema.tables[tableIndex], tableDto);
    await this.appRepository.save(app);
    
    return app.databaseSchema.tables[tableIndex];
  }

  async deleteDatabaseTable(appId: string, tableId: string) {
    const app = await this.findOne(appId);
    const tableIndex = app.databaseSchema.tables.findIndex(t => t.id === tableId);
    
    if (tableIndex === -1) {
      throw new NotFoundException('Table not found');
    }

    app.databaseSchema.tables.splice(tableIndex, 1);
    await this.appRepository.save(app);
    
    return { message: 'Table deleted successfully' };
  }

  private generatePackageName(appName: string): string {
    const cleanName = appName.toLowerCase().replace(/[^a-z0-9]/g, '');
    return `com.sigma.${cleanName}`;
  }

  private createDefaultScreen() {
    return {
      id: uuidv4(),
      name: 'Home',
      isDefault: true,
      components: [],
      navigation: {},
    };
  }

  private getDefaultTheme() {
    return {
      primaryColor: '#2196F3',
      secondaryColor: '#FFC107',
      fontFamily: 'Roboto',
      darkMode: false,
    };
  }
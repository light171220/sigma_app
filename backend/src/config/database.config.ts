import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';

import { User } from '../users/user.entity';
import { App } from '../apps/app.entity';
import { Deployment } from '../deployment/deployment.entity';

@Injectable()
export class DatabaseConfig implements TypeOrmOptionsFactory {
  constructor(private configService: ConfigService) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    return {
      type: 'postgres',
      host: this.configService.get('DATABASE_HOST'),
      port: this.configService.get('DATABASE_PORT'),
      username: this.configService.get('DATABASE_USERNAME'),
      password: this.configService.get('DATABASE_PASSWORD'),
      database: this.configService.get('DATABASE_NAME'),
      ssl: this.configService.get('DATABASE_SSL') === 'true' ? {
        rejectUnauthorized: false,
      } : false,
      entities: [User, App, Deployment],
      synchronize: this.configService.get('NODE_ENV') === 'development',
      logging: this.configService.get('NODE_ENV') === 'development',
      migrations: ['dist/database/migrations/*.js'],
      migrationsRun: true,
      retryAttempts: 3,
      retryDelay: 3000,
      autoLoadEntities: true,
      keepConnectionAlive: true,
      extra: {
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
      },
    };
  }
}
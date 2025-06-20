import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { ScheduleModule } from '@nestjs/schedule';

import { AppConfig } from './config/app.config';
import { DatabaseConfig } from './config/database.config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { AppsModule } from './apps/apps.module';
import { CodeGenerationModule } from './code-generation/code-generation.module';
import { DeploymentModule } from './deployment/deployment.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [AppConfig],
    }),
    TypeOrmModule.forRootAsync({
      useClass: DatabaseConfig,
    }),
    BullModule.forRootAsync({
      useFactory: () => ({
        redis: {
          host: process.env.REDIS_HOST || 'localhost',
          port: parseInt(process.env.REDIS_PORT) || 6379,
          password: process.env.REDIS_PASSWORD,
        },
      }),
    }),
    ScheduleModule.forRoot(),
    AuthModule,
    UsersModule,
    AppsModule,
    CodeGenerationModule,
    DeploymentModule,
  ],
})
export class AppModule {}
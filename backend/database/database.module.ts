import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

import { DatabaseConfig } from '../src/config/database.config';
import { User } from '../src/users/user.entity';
import { App } from '../src/apps/app.entity';
import { Deployment } from '../src/deployment/deployment.entity';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forRootAsync({
      useClass: DatabaseConfig,
    }),
    TypeOrmModule.forFeature([User, App, Deployment]),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
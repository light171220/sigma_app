import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppsController } from './apps.controller';
import { AppsService } from './apps.service';
import { App } from './app.entity';
import { User } from '../users/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([App, User])],
  controllers: [AppsController],
  providers: [AppsService],
  exports: [AppsService],
})
export class AppsModule {}
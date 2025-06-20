import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsObject, IsArray, IsIn } from 'class-validator';

export class DeployAppDto {
  @ApiProperty({ example: 'all', required: false })
  @IsOptional()
  @IsString()
  @IsIn(['all', 'ios', 'android', 'web'])
  platform?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  options?: {
    buildMode?: 'debug' | 'release';
    environment?: 'staging' | 'production';
    enableAnalytics?: boolean;
  };
}

export class StoreSubmissionDto {
  @ApiProperty({ example: ['google-play', 'app-store'] })
  @IsArray()
  @IsString({ each: true })
  @IsIn(['google-play', 'app-store'], { each: true })
  stores: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  metadata?: {
    releaseNotes?: string;
    version?: string;
    screenshots?: string[];
  };
}

export class RetryDeploymentDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  options?: any;
}
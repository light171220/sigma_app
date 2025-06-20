import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsObject, IsArray } from 'class-validator';

export class GenerateAppDto {
  @ApiProperty({ example: 'flutter', required: false })
  @IsOptional()
  @IsString()
  platform?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  options?: any;
}

export class GeneratePreviewDto {
  @ApiProperty({ example: 'home', required: false })
  @IsOptional()
  @IsString()
  screenId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  viewport?: {
    width: number;
    height: number;
  };
}

export class CodeValidationDto {
  @ApiProperty()
  @IsString()
  code: string;

  @ApiProperty({ example: 'dart' })
  @IsString()
  language: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsArray()
  rules?: string[];
}
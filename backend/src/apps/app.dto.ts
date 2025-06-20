import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsObject, IsArray, IsBoolean, MaxLength, MinLength } from 'class-validator';

export class CreateAppDto {
  @ApiProperty({ example: 'My Store App' })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name: string;

  @ApiProperty({ example: 'E-commerce mobile application', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiProperty({ example: 'business', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  category?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  appConfig?: any;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsArray()
  screens?: any[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  databaseSchema?: any;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsArray()
  workflows?: any[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  theme?: any;
}

export class UpdateAppDto {
  @ApiProperty({ example: 'My Updated App', required: false })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name?: string;

  @ApiProperty({ example: 'Updated description', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiProperty({ example: 'ecommerce', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  category?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  appConfig?: any;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  theme?: any;
}

export class DuplicateAppDto {
  @ApiProperty({ example: 'My Store App Copy' })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name: string;
}

export class CreateScreenDto {
  @ApiProperty({ example: 'Product List' })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name: string;

  @ApiProperty({ example: false, required: false })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  navigation?: any;
}

export class UpdateScreenDto {
  @ApiProperty({ example: 'Updated Screen Name', required: false })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name?: string;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  navigation?: any;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsArray()
  components?: any[];
}

export class CreateComponentDto {
  @ApiProperty({ example: 'button' })
  @IsString()
  type: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  position?: any;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  size?: any;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  properties?: any;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsArray()
  actions?: any[];
}

export class UpdateComponentDto {
  @ApiProperty({ example: 'text', required: false })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  position?: any;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  size?: any;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  properties?: any;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsArray()
  actions?: any[];
}

export class UpdateDatabaseSchemaDto {
  @ApiProperty()
  @IsObject()
  schema: any;
}
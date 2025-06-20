import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEmail, MaxLength, IsIn } from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({ example: 'John', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  firstName?: string;

  @ApiProperty({ example: 'Doe', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  lastName?: string;

  @ApiProperty({ example: 'https://example.com/avatar.jpg', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  avatarUrl?: string;

  @ApiProperty({ example: 'pro', required: false })
  @IsOptional()
  @IsString()
  @IsIn(['free', 'pro', 'enterprise'])
  subscriptionPlan?: string;

  @ApiProperty({ example: 'active', required: false })
  @IsOptional()
  @IsString()
  @IsIn(['active', 'inactive', 'cancelled'])
  subscriptionStatus?: string;
}
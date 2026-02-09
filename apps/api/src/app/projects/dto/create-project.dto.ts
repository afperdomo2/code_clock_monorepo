import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ProjectCategory,
  ProjectPriority,
  ProjectStatus,
} from '@prisma/client';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsDateString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateProjectDto {
  @ApiProperty({ example: 'Redisenio Web Corporativo' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name!: string;

  @ApiPropertyOptional({ example: 'TechCorp Inc.' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  client?: string | null;

  @ApiProperty({ enum: ProjectCategory })
  @IsEnum(ProjectCategory)
  category!: ProjectCategory;

  @ApiProperty({ enum: ProjectPriority })
  @IsEnum(ProjectPriority)
  priority!: ProjectPriority;

  @ApiProperty({ enum: ProjectStatus })
  @IsEnum(ProjectStatus)
  status!: ProjectStatus;

  @ApiPropertyOptional({ minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  hours_estimated?: number | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  deadline?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string | null;
}

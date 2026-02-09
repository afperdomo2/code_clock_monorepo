import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import {
  ProjectCategory,
  ProjectPriority,
  ProjectStatus,
} from '@prisma/client';

export class ProjectResponseDto {
  @ApiProperty({ format: 'uuid' })
  @Expose()
  id!: string;

  @ApiProperty()
  @Expose()
  name!: string;

  @ApiProperty({ required: false, nullable: true })
  @Expose()
  client!: string | null;

  @ApiProperty({ enum: ProjectCategory })
  @Expose()
  category!: ProjectCategory;

  @ApiProperty({ enum: ProjectPriority })
  @Expose()
  priority!: ProjectPriority;

  @ApiProperty({ enum: ProjectStatus })
  @Expose()
  status!: ProjectStatus;

  @ApiProperty()
  @Expose()
  hours_spent!: number;

  @ApiProperty({ required: false, nullable: true })
  @Expose()
  hours_estimated?: number | null;

  @ApiProperty({ required: false, nullable: true })
  @Expose()
  deadline?: Date | null;

  @ApiProperty({ required: false, nullable: true })
  @Expose()
  description?: string | null;

  @ApiProperty()
  @Expose()
  created_at!: Date;

  @ApiProperty({ required: false, nullable: true })
  @Expose()
  updated_at?: Date | null;
}

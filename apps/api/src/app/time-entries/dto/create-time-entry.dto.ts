import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateTimeEntryDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID('4')
  project_id!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  activity_type!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  description!: string;

  @ApiProperty()
  @IsDateString()
  date!: string;

  @ApiProperty({ description: 'Duration in seconds' })
  @IsInt()
  @Min(1)
  duration!: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  end_time?: string | null;
}

import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches } from 'class-validator';

export class QueryTimeEntriesMonthDto {
  @ApiProperty({
    description: 'Month in YYYY-MM or MM-YYYY format',
    example: '2026-08',
  })
  @IsString()
  @Matches(/^(\d{4}-\d{2}|\d{2}-\d{4})$/, {
    message: 'month must be in YYYY-MM or MM-YYYY format',
  })
  month!: string;
}

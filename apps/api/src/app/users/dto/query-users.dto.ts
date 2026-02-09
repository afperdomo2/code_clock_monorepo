import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export class QueryUsersDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Busqueda por email o nombre' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  search?: string;
}

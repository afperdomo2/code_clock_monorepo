import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CreateTimeEntryDto } from './dto/create-time-entry.dto';
import { QueryTimeEntriesMonthDto } from './dto/query-time-entries-month.dto';
import { QueryTimeEntriesDto } from './dto/query-time-entries.dto';
import { TimeEntryResponseDto } from './dto/time-entry-response.dto';
import { TimeEntriesService } from './time-entries.service';

@ApiTags('time-entries')
@ApiBearerAuth('access-token')
@Controller('time-entries')
export class TimeEntriesController {
  constructor(private readonly timeEntriesService: TimeEntriesService) {}

  @Post()
  @ApiOperation({ summary: 'Crear entrada de tiempo para el usuario autenticado' })
  @ApiResponse({ status: 201, type: TimeEntryResponseDto })
  async create(@CurrentUser('id') userId: string, @Body() dto: CreateTimeEntryDto) {
    const entry = await this.timeEntriesService.create(dto, userId);
    return plainToInstance(TimeEntryResponseDto, entry, {
      excludeExtraneousValues: true,
    });
  }

  @Get()
  @ApiOperation({ summary: 'Listar entradas de tiempo del usuario autenticado' })
  @ApiResponse({ status: 200 })
  async findAll(@CurrentUser('id') userId: string, @Query() query: QueryTimeEntriesDto) {
    const result = await this.timeEntriesService.findAll(query, userId);
    return {
      data: result.data.map((entry) =>
        plainToInstance(TimeEntryResponseDto, entry, {
          excludeExtraneousValues: true,
        }),
      ),
      meta: result.meta,
    };
  }

  @Get('by-month')
  @ApiOperation({
    summary: 'Listar entradas de tiempo por mes del usuario autenticado (sin paginación)',
  })
  @ApiResponse({ status: 200, type: TimeEntryResponseDto, isArray: true })
  async findByMonth(@CurrentUser('id') userId: string, @Query() query: QueryTimeEntriesMonthDto) {
    const entries = await this.timeEntriesService.findByMonth(query.month, userId);
    return entries.map((entry) =>
      plainToInstance(TimeEntryResponseDto, entry, {
        excludeExtraneousValues: true,
      }),
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener entrada de tiempo por ID (del usuario autenticado)' })
  @ApiResponse({ status: 200, type: TimeEntryResponseDto })
  @ApiResponse({ status: 404, description: 'Entrada de tiempo no encontrada' })
  async findOne(@CurrentUser('id') userId: string, @Param('id', ParseUUIDPipe) id: string) {
    const entry = await this.timeEntriesService.findOne(id, userId);
    return plainToInstance(TimeEntryResponseDto, entry, {
      excludeExtraneousValues: true,
    });
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar entrada de tiempo (solo propietario)' })
  @ApiResponse({ status: 200, type: TimeEntryResponseDto })
  async remove(@CurrentUser('id') userId: string, @Param('id', ParseUUIDPipe) id: string) {
    const entry = await this.timeEntriesService.remove(id, userId);
    return plainToInstance(TimeEntryResponseDto, entry, {
      excludeExtraneousValues: true,
    });
  }
}

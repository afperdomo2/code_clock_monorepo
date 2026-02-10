import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { CreateTimeEntryDto } from './dto/create-time-entry.dto';
import { QueryTimeEntriesDto } from './dto/query-time-entries.dto';
import { TimeEntryResponseDto } from './dto/time-entry-response.dto';
import { TimeEntriesService } from './time-entries.service';

@ApiTags('time-entries')
@ApiBearerAuth('access-token')
@Controller('time-entries')
export class TimeEntriesController {
  constructor(private readonly timeEntriesService: TimeEntriesService) {}

  @Post()
  @ApiOperation({ summary: 'Create time entry' })
  @ApiResponse({ status: 201, type: TimeEntryResponseDto })
  async create(@Body() dto: CreateTimeEntryDto) {
    const entry = await this.timeEntriesService.create(dto);
    return plainToInstance(TimeEntryResponseDto, entry, {
      excludeExtraneousValues: true,
    });
  }

  @Get()
  @ApiOperation({ summary: 'List time entries' })
  @ApiResponse({ status: 200 })
  async findAll(@Query() query: QueryTimeEntriesDto) {
    const result = await this.timeEntriesService.findAll(query);
    return {
      data: result.data.map((entry) =>
        plainToInstance(TimeEntryResponseDto, entry, {
          excludeExtraneousValues: true,
        }),
      ),
      meta: result.meta,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get time entry by id' })
  @ApiResponse({ status: 200, type: TimeEntryResponseDto })
  @ApiResponse({ status: 404, description: 'Time entry not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const entry = await this.timeEntriesService.findOne(id);
    return plainToInstance(TimeEntryResponseDto, entry, {
      excludeExtraneousValues: true,
    });
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete time entry' })
  @ApiResponse({ status: 200, type: TimeEntryResponseDto })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    const entry = await this.timeEntriesService.remove(id);
    return plainToInstance(TimeEntryResponseDto, entry, {
      excludeExtraneousValues: true,
    });
  }
}

import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { DeliverablesService } from './deliverables.service';
import { CreateDeliverableDto } from './dto/create-deliverable.dto';
import { DeliverableResponseDto } from './dto/deliverable-response.dto';
import { QueryDeliverablesDto } from './dto/query-deliverables.dto';
import { UpdateDeliverableDto } from './dto/update-deliverable.dto';

@ApiTags('deliverables')
@ApiBearerAuth('access-token')
@Controller('deliverables')
export class DeliverablesController {
  constructor(private readonly deliverablesService: DeliverablesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a deliverable for the authenticated user' })
  @ApiResponse({ status: 201, type: DeliverableResponseDto })
  async create(@CurrentUser('id') userId: string, @Body() dto: CreateDeliverableDto) {
    const deliverable = await this.deliverablesService.create(dto, userId);
    return plainToInstance(DeliverableResponseDto, deliverable, {
      excludeExtraneousValues: true,
    });
  }

  @Get()
  @ApiOperation({ summary: 'List deliverables for the authenticated user' })
  @ApiResponse({ status: 200 })
  async findAll(@CurrentUser('id') userId: string, @Query() query: QueryDeliverablesDto) {
    const result = await this.deliverablesService.findAll(query, userId);
    return {
      data: result.data.map((deliverable) =>
        plainToInstance(DeliverableResponseDto, deliverable, {
          excludeExtraneousValues: true,
        }),
      ),
      meta: result.meta,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get deliverable by id (owned by the authenticated user)' })
  @ApiResponse({ status: 200, type: DeliverableResponseDto })
  @ApiResponse({ status: 404, description: 'Deliverable not found' })
  async findOne(@CurrentUser('id') userId: string, @Param('id', ParseUUIDPipe) id: string) {
    const deliverable = await this.deliverablesService.findOne(id, userId);
    return plainToInstance(DeliverableResponseDto, deliverable, {
      excludeExtraneousValues: true,
    });
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update deliverable (owner only)' })
  @ApiResponse({ status: 200, type: DeliverableResponseDto })
  async update(
    @CurrentUser('id') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateDeliverableDto,
  ) {
    const deliverable = await this.deliverablesService.update(id, dto, userId);
    return plainToInstance(DeliverableResponseDto, deliverable, {
      excludeExtraneousValues: true,
    });
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete deliverable (owner only)' })
  @ApiResponse({ status: 200, type: DeliverableResponseDto })
  async remove(@CurrentUser('id') userId: string, @Param('id', ParseUUIDPipe) id: string) {
    const deliverable = await this.deliverablesService.remove(id, userId);
    return plainToInstance(DeliverableResponseDto, deliverable, {
      excludeExtraneousValues: true,
    });
  }
}

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
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { CreateDeliverableDto } from './dto/create-deliverable.dto';
import { DeliverableResponseDto } from './dto/deliverable-response.dto';
import { QueryDeliverablesDto } from './dto/query-deliverables.dto';
import { UpdateDeliverableDto } from './dto/update-deliverable.dto';
import { DeliverablesService } from './deliverables.service';

@ApiTags('deliverables')
@Controller('deliverables')
export class DeliverablesController {
  constructor(private readonly deliverablesService: DeliverablesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a deliverable' })
  @ApiResponse({ status: 201, type: DeliverableResponseDto })
  async create(@Body() dto: CreateDeliverableDto) {
    const deliverable = await this.deliverablesService.create(dto);
    return plainToInstance(DeliverableResponseDto, deliverable, {
      excludeExtraneousValues: true,
    });
  }

  @Get()
  @ApiOperation({ summary: 'List deliverables' })
  @ApiResponse({ status: 200 })
  async findAll(@Query() query: QueryDeliverablesDto) {
    const result = await this.deliverablesService.findAll(query);
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
  @ApiOperation({ summary: 'Get deliverable by id' })
  @ApiResponse({ status: 200, type: DeliverableResponseDto })
  @ApiResponse({ status: 404, description: 'Deliverable not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const deliverable = await this.deliverablesService.findOne(id);
    return plainToInstance(DeliverableResponseDto, deliverable, {
      excludeExtraneousValues: true,
    });
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update deliverable' })
  @ApiResponse({ status: 200, type: DeliverableResponseDto })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateDeliverableDto,
  ) {
    const deliverable = await this.deliverablesService.update(id, dto);
    return plainToInstance(DeliverableResponseDto, deliverable, {
      excludeExtraneousValues: true,
    });
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete deliverable' })
  @ApiResponse({ status: 200, type: DeliverableResponseDto })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    const deliverable = await this.deliverablesService.remove(id);
    return plainToInstance(DeliverableResponseDto, deliverable, {
      excludeExtraneousValues: true,
    });
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateDeliverableDto } from './dto/create-deliverable.dto';
import { QueryDeliverablesDto } from './dto/query-deliverables.dto';
import { UpdateDeliverableDto } from './dto/update-deliverable.dto';
import { PaginationMetaDto } from '../common/dto/pagination-meta.dto';

@Injectable()
export class DeliverablesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateDeliverableDto) {
    return this.prisma.deliverable.create({
      data: {
        project_id: dto.project_id,
        title: dto.title,
        deadline: dto.deadline ? new Date(dto.deadline) : null,
        completed: dto.completed ?? false,
      },
    });
  }

  async findAll(query: QueryDeliverablesDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;
    const where = {
      project_id: query.project_id,
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.deliverable.findMany({
        where,
        orderBy: { deadline: 'asc' },
        skip,
        take: limit,
      }),
      this.prisma.deliverable.count({ where }),
    ]);

    return {
      data,
      meta: new PaginationMetaDto(page, limit, total),
    };
  }

  async findOne(id: string) {
    const deliverable = await this.prisma.deliverable.findUnique({
      where: { id },
    });

    if (!deliverable) {
      throw new NotFoundException(`Deliverable with ID ${id} not found`);
    }

    return deliverable;
  }

  async update(id: string, dto: UpdateDeliverableDto) {
    await this.findOne(id);

    return this.prisma.deliverable.update({
      where: { id },
      data: {
        title: dto.title,
        deadline: dto.deadline ? new Date(dto.deadline) : undefined,
        completed: dto.completed,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.deliverable.delete({ where: { id } });
  }
}

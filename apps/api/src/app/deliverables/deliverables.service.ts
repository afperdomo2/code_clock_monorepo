import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@code-clock-mono/prisma-client';
import { CreateDeliverableDto } from './dto/create-deliverable.dto';
import { QueryDeliverablesDto } from './dto/query-deliverables.dto';
import { UpdateDeliverableDto } from './dto/update-deliverable.dto';

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
    return this.prisma.deliverable.findMany({
      where: {
        project_id: query.project_id,
      },
      orderBy: { deadline: 'asc' },
    });
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

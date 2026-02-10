import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateDeliverableDto } from './dto/create-deliverable.dto';
import { QueryDeliverablesDto } from './dto/query-deliverables.dto';
import { UpdateDeliverableDto } from './dto/update-deliverable.dto';
import { PaginationMetaDto } from '../common/dto/pagination-meta.dto';

@Injectable()
export class DeliverablesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateDeliverableDto, userId: string) {
    await this.ensureProjectOwnership(dto.project_id, userId);
    return this.prisma.deliverable.create({
      data: {
        user_id: userId,
        project_id: dto.project_id,
        title: dto.title,
        deadline: dto.deadline ? new Date(dto.deadline) : null,
        completed: dto.completed ?? false,
      },
    });
  }

  async findAll(query: QueryDeliverablesDto, userId: string) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;
    const where = {
      user_id: userId,
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

  async findOne(id: string, userId: string) {
    const deliverable = await this.prisma.deliverable.findFirst({
      where: { id, user_id: userId },
    });

    if (!deliverable) {
      throw new NotFoundException(`Deliverable with ID ${id} not found`);
    }

    return deliverable;
  }

  async update(id: string, dto: UpdateDeliverableDto, userId: string) {
    await this.findOne(id, userId);

    return this.prisma.deliverable.update({
      where: { id },
      data: {
        title: dto.title,
        deadline: dto.deadline ? new Date(dto.deadline) : undefined,
        completed: dto.completed,
      },
    });
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId);
    return this.prisma.deliverable.delete({ where: { id } });
  }

  private async ensureProjectOwnership(projectId: string, userId: string) {
    const project = await this.prisma.project.findFirst({
      where: { id: projectId, user_id: userId },
      select: { id: true },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found`);
    }
  }
}

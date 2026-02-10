import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CreateProjectDto } from './dto/create-project.dto';
import { QueryProjectsDto } from './dto/query-projects.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { PaginationMetaDto } from '../common/dto/pagination-meta.dto';

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateProjectDto, userId: string) {
    return this.prisma.project.create({
      data: {
        user_id: userId,
        name: dto.name,
        client: dto.client ?? null,
        category: dto.category,
        priority: dto.priority,
        status: dto.status,
        hours_estimated: dto.hours_estimated ?? null,
        deadline: dto.deadline ? new Date(dto.deadline) : null,
        description: dto.description ?? null,
        hours_spent: 0,
      },
    });
  }

  async findAll(query: QueryProjectsDto, userId: string) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;
    const where = {
      user_id: userId,
      status: query.status,
      client: query.client,
      name: query.search
        ? {
            contains: query.search,
            mode: Prisma.QueryMode.insensitive,
          }
        : undefined,
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.project.findMany({
        where,
        orderBy: { created_at: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.project.count({ where }),
    ]);

    return {
      data,
      meta: new PaginationMetaDto(page, limit, total),
    };
  }

  async findOne(id: string, userId: string) {
    const project = await this.prisma.project.findFirst({
      where: { id, user_id: userId },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    return project;
  }

  async update(id: string, dto: UpdateProjectDto, userId: string) {
    await this.findOne(id, userId);

    return this.prisma.project.update({
      where: { id },
      data: {
        name: dto.name,
        client: dto.client ?? undefined,
        category: dto.category,
        priority: dto.priority,
        status: dto.status,
        hours_estimated: dto.hours_estimated ?? undefined,
        hours_spent: dto.hours_spent ?? undefined,
        deadline: dto.deadline ? new Date(dto.deadline) : undefined,
        description: dto.description ?? undefined,
      },
    });
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId);
    return this.prisma.project.delete({ where: { id } });
  }
}

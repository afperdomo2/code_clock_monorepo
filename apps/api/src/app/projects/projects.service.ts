import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@code-clock-mono/prisma-client';
import { CreateProjectDto } from './dto/create-project.dto';
import { QueryProjectsDto } from './dto/query-projects.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateProjectDto) {
    return this.prisma.project.create({
      data: {
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

  async findAll(query: QueryProjectsDto) {
    return this.prisma.project.findMany({
      where: {
        status: query.status,
        client: query.client,
        name: query.search
          ? {
              contains: query.search,
              mode: 'insensitive',
            }
          : undefined,
      },
      orderBy: { created_at: 'desc' },
    });
  }

  async findOne(id: string) {
    const project = await this.prisma.project.findUnique({
      where: { id },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    return project;
  }

  async update(id: string, dto: UpdateProjectDto) {
    await this.findOne(id);

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

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.project.delete({ where: { id } });
  }
}

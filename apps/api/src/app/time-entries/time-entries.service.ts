import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTimeEntryDto } from './dto/create-time-entry.dto';
import { QueryTimeEntriesDto } from './dto/query-time-entries.dto';
import { PaginationMetaDto } from '../common/dto/pagination-meta.dto';

@Injectable()
export class TimeEntriesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateTimeEntryDto) {
    return this.prisma.timeEntry.create({
      data: {
        project_id: dto.project_id,
        activity_type: dto.activity_type,
        description: dto.description,
        date: new Date(dto.date),
        duration: dto.duration,
        end_time: dto.end_time ? new Date(dto.end_time) : null,
      },
    });
  }

  async findAll(query: QueryTimeEntriesDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;
    const where = {
      project_id: query.project_id,
      date:
        query.from || query.to
          ? {
              gte: query.from ? new Date(query.from) : undefined,
              lte: query.to ? new Date(query.to) : undefined,
            }
          : undefined,
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.timeEntry.findMany({
        where,
        orderBy: { date: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.timeEntry.count({ where }),
    ]);

    return {
      data,
      meta: new PaginationMetaDto(page, limit, total),
    };
  }

  async findOne(id: string) {
    const entry = await this.prisma.timeEntry.findUnique({
      where: { id },
    });

    if (!entry) {
      throw new NotFoundException(`Time entry with ID ${id} not found`);
    }

    return entry;
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.timeEntry.delete({ where: { id } });
  }

  async findByMonth(month: string) {
    const { year, monthIndex } = this.parseMonth(month);
    if (Number.isNaN(year) || Number.isNaN(monthIndex) || monthIndex < 0 || monthIndex > 11) {
      throw new BadRequestException('Invalid month');
    }
    const start = new Date(Date.UTC(year, monthIndex, 1, 0, 0, 0));
    const end = new Date(Date.UTC(year, monthIndex + 1, 0, 23, 59, 59, 999));

    return this.prisma.timeEntry.findMany({
      where: {
        date: {
          gte: start,
          lte: end,
        },
      },
      orderBy: { date: 'desc' },
    });
  }

  private parseMonth(value: string) {
    const [partA, partB] = value.split('-');
    if (!partA || !partB) {
      return { year: NaN, monthIndex: NaN };
    }

    if (partA.length === 4) {
      const year = Number(partA);
      const month = Number(partB);
      return { year, monthIndex: month - 1 };
    }

    const year = Number(partB);
    const month = Number(partA);
    return { year, monthIndex: month - 1 };
  }
}

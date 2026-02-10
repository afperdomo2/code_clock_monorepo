import { Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma, User as PrismaUser } from '@prisma/client';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import { QueryUsersDto } from './dto/query-users.dto';
import { PaginationMetaDto } from '../common/dto/pagination-meta.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const data = await this.buildUserCreateData(createUserDto, false);
    return this.prisma.user.create({
      data,
    }) as unknown as Promise<User>;
  }

  async createInitialAdmin(createUserDto: CreateUserDto): Promise<User> {
    const data = await this.buildUserCreateData(createUserDto, true);
    return this.prisma.user.create({ data }) as unknown as Promise<User>;
  }

  async findAll(query: QueryUsersDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where = query.search
      ? {
          OR: [
            {
              email: {
                contains: query.search,
                mode: Prisma.QueryMode.insensitive,
              },
            },
            {
              name: {
                contains: query.search,
                mode: Prisma.QueryMode.insensitive,
              },
            },
          ],
        }
      : undefined;

    const [data, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: data as unknown as User[],
      meta: new PaginationMetaDto(page, limit, total),
    };
  }

  async findByEmail(email: string): Promise<PrismaUser | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findById(id: string): Promise<PrismaUser | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async hasUsers(): Promise<boolean> {
    const count = await this.prisma.user.count();
    return count > 0;
  }

  async findOne(id: string): Promise<User> {
    const user = (await this.prisma.user.findUnique({
      where: { id },
    })) as unknown as User | null;

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async updatePassword(id: string, password_hash: string) {
    return this.prisma.user.update({
      where: { id },
      data: { password_hash },
    }) as unknown as Promise<User>;
  }

  async updateRefreshToken(id: string, refresh_token_hash: string, refresh_token_expires_at: Date) {
    return this.prisma.user.update({
      where: { id },
      data: { refresh_token_hash, refresh_token_expires_at },
    });
  }

  async clearRefreshToken(id: string) {
    return this.prisma.user.update({
      where: { id },
      data: { refresh_token_hash: null, refresh_token_expires_at: null },
    });
  }

  async findByRefreshTokenHash(refresh_token_hash: string) {
    return this.prisma.user.findFirst({
      where: {
        refresh_token_hash,
        refresh_token_expires_at: { gt: new Date() },
      },
    });
  }

  async clearRefreshTokenByHash(refresh_token_hash: string) {
    return this.prisma.user.updateMany({
      where: { refresh_token_hash },
      data: { refresh_token_hash: null, refresh_token_expires_at: null },
    });
  }

  private async buildUserCreateData(
    createUserDto: CreateUserDto,
    isAdmin: boolean,
  ): Promise<Prisma.UserCreateInput> {
    const { password, ...rest } = createUserDto;
    const password_hash = await bcrypt.hash(password, 10);
    return {
      ...rest,
      password_hash,
      is_admin: isAdmin,
    };
  }
}

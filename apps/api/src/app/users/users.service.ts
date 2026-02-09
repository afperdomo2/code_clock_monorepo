import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@code-clock-mono/prisma-client';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const { password, ...rest } = createUserDto;
    // In a real app, hash the password here
    const password_hash = password; // PLACEHOLDER

    return this.prisma.user.create({
      data: {
        ...rest,
        password_hash,
      },
    }) as unknown as Promise<User>;
  }

  async findAll(): Promise<User[]> {
    return this.prisma.user.findMany() as unknown as Promise<User[]>;
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
}

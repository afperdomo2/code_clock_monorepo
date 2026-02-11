import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseUUIDPipe,
  Query,
  Patch,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateUserAdminDto } from './dto/update-user-admin.dto';
import { User } from './entities/user.entity';
import { QueryUsersDto } from './dto/query-users.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AdminGuard } from '../auth/guards/admin.guard';

@ApiTags('users')
@ApiBearerAuth('access-token')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Crear un nuevo usuario' })
  @ApiResponse({
    status: 201,
    description: 'El usuario ha sido creado exitosamente.',
    type: User,
  })
  async create(@Body() createUserDto: CreateUserDto) {
    const user = await this.usersService.create(createUserDto);
    return plainToInstance(User, user, { excludeExtraneousValues: true });
  }

  @Get()
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Obtener todos los usuarios' })
  @ApiResponse({ status: 200, description: 'Retorna todos los usuarios.' })
  async findAll(@Query() query: QueryUsersDto) {
    const result = await this.usersService.findAll(query);
    return {
      data: result.data.map((user) =>
        plainToInstance(User, user, { excludeExtraneousValues: true }),
      ),
      meta: result.meta,
    };
  }

  @Get('me')
  @ApiOperation({ summary: 'Obtener perfil del usuario autenticado' })
  @ApiResponse({ status: 200, description: 'Retorna el usuario.', type: User })
  async getProfile(@CurrentUser('id') userId: string) {
    const user = await this.usersService.findOne(userId);
    return plainToInstance(User, user, { excludeExtraneousValues: true });
  }

  @Patch('me')
  @ApiOperation({ summary: 'Actualizar perfil del usuario autenticado' })
  @ApiResponse({ status: 200, description: 'Retorna el usuario actualizado.', type: User })
  async updateProfile(@CurrentUser('id') userId: string, @Body() dto: UpdateUserDto) {
    const user = await this.usersService.updateProfile(userId, dto);
    return plainToInstance(User, user, { excludeExtraneousValues: true });
  }

  @Get(':id')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Obtener un usuario por ID' })
  @ApiResponse({ status: 200, description: 'Retorna el usuario.', type: User })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado.' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const user = await this.usersService.findOne(id);
    return plainToInstance(User, user, { excludeExtraneousValues: true });
  }

  @Patch(':id')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Actualizar usuario (solo administradores)' })
  @ApiResponse({ status: 200, description: 'Retorna el usuario actualizado.', type: User })
  async update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateUserAdminDto) {
    const user = await this.usersService.updateByAdmin(id, dto);
    return plainToInstance(User, user, { excludeExtraneousValues: true });
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Eliminar usuario (solo administradores)' })
  @ApiResponse({ status: 200, description: 'Retorna el usuario eliminado.', type: User })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    const user = await this.usersService.removeByAdmin(id);
    return plainToInstance(User, user, { excludeExtraneousValues: true });
  }
}

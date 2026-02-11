import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { AllowFirstRun } from './decorators/allow-first-run.decorator';
import { SetupService } from './setup.service';

@ApiTags('setup')
@Controller('setup')
export class SetupController {
  constructor(private readonly setupService: SetupService) {}

  @Get()
  @Public()
  @AllowFirstRun()
  @ApiOperation({ summary: 'Verificar estado de configuración inicial' })
  @ApiResponse({ status: 200 })
  status() {
    return this.setupService.status();
  }

  @Post('register')
  @Public()
  @AllowFirstRun()
  @ApiOperation({ summary: 'Crear el primer usuario (una sola vez)' })
  @ApiResponse({ status: 201 })
  register(@Body() dto: CreateUserDto) {
    return this.setupService.register(dto);
  }
}

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
  @ApiOperation({ summary: 'Check first-run setup status' })
  @ApiResponse({ status: 200 })
  status() {
    return this.setupService.status();
  }

  @Post('register')
  @Public()
  @AllowFirstRun()
  @ApiOperation({ summary: 'Create the first user (one-time)' })
  @ApiResponse({ status: 201 })
  register(@Body() dto: CreateUserDto) {
    return this.setupService.register(dto);
  }
}

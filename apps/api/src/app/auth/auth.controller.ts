import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { ChangePasswordDto } from './dto/change-password.dto';
import { LoginDto } from './dto/login.dto';
import { Public } from './decorators/public.decorator';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @Throttle({ short: { limit: 5, ttl: 60_000 } })
  @ApiOperation({ summary: 'Login' })
  @ApiResponse({ status: 200 })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  @Throttle({ short: { limit: 5, ttl: 60_000 } })
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Change password' })
  @ApiResponse({ status: 200 })
  changePassword(
    @Req() req: Request & { user?: { id: string } },
    @Body() dto: ChangePasswordDto,
  ) {
    const user = req.user as { id: string };
    return this.authService.changePassword(user.id, dto);
  }

  @Public()
  @Post('logout')
  @ApiOperation({ summary: 'Logout (client-side token discard)' })
  @ApiResponse({ status: 200 })
  logout() {
    return { success: true };
  }
}

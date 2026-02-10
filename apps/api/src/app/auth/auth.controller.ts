import {
  Body,
  Controller,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Request, Response, type CookieOptions } from 'express';
import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorator';
import { ChangePasswordDto } from './dto/change-password.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  private getRefreshCookieOptions(): CookieOptions {
    const isProd = this.configService.get('NODE_ENV') === 'production';
    const sameSite: CookieOptions['sameSite'] = isProd ? 'none' : 'lax';
    return {
      httpOnly: true,
      sameSite,
      secure: isProd,
      path: '/api/auth',
      maxAge: 1000 * 60 * 60 * 24 * 30,
    };
  }

  @Public()
  @Post('login')
  @Throttle({ short: { limit: 5, ttl: 60_000 } })
  @ApiOperation({ summary: 'Login' })
  @ApiResponse({ status: 200 })
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const { refresh_token, ...payload } = await this.authService.login(dto);
    res.cookie('refresh_token', refresh_token, this.getRefreshCookieOptions());
    return payload;
  }

  @Public()
  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ status: 200 })
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies?.refresh_token;
    if (!refreshToken) {
      throw new UnauthorizedException('Missing refresh token');
    }
    const { refresh_token, ...payload } = await this.authService.refresh(
      refreshToken,
    );
    res.cookie('refresh_token', refresh_token, this.getRefreshCookieOptions());
    return payload;
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
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies?.refresh_token ?? null;
    const result = await this.authService.logout(refreshToken);
    res.clearCookie('refresh_token', this.getRefreshCookieOptions());
    return result;
  }
}

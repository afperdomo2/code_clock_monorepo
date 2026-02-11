import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { createHash, randomUUID } from 'crypto';
import { UsersService } from '../users/users.service';
import { ChangePasswordDto } from './dto/change-password.dto';
import { LoginDto } from './dto/login.dto';

const ACCESS_TOKEN_TTL_SECONDS = 15 * 60;
const REFRESH_TOKEN_TTL_DAYS = 30;

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isValid = await bcrypt.compare(dto.password, user.password_hash);

    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user.id, email: user.email, is_admin: user.is_admin };
    const access_token = await this.jwtService.signAsync(payload);

    const refresh_token = randomUUID();
    const refresh_token_hash = this.hashRefreshToken(refresh_token);
    const refresh_token_expires_at = this.getRefreshTokenExpiresAt();
    await this.usersService.updateRefreshToken(
      user.id,
      refresh_token_hash,
      refresh_token_expires_at,
    );

    return {
      access_token,
      is_admin: user.is_admin,
      refresh_token,
      token_type: 'Bearer',
      expires_in: ACCESS_TOKEN_TTL_SECONDS,
    };
  }

  async refresh(refresh_token: string) {
    const refresh_token_hash = this.hashRefreshToken(refresh_token);
    const user = await this.usersService.findByRefreshTokenHash(refresh_token_hash);

    if (!user) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const payload = { sub: user.id, email: user.email, is_admin: user.is_admin };
    const access_token = await this.jwtService.signAsync(payload);

    const new_refresh_token = randomUUID();
    const new_refresh_token_hash = this.hashRefreshToken(new_refresh_token);
    const refresh_token_expires_at = this.getRefreshTokenExpiresAt();
    await this.usersService.updateRefreshToken(
      user.id,
      new_refresh_token_hash,
      refresh_token_expires_at,
    );

    return {
      access_token,
      is_admin: user.is_admin,
      refresh_token: new_refresh_token,
      token_type: 'Bearer',
      expires_in: ACCESS_TOKEN_TTL_SECONDS,
    };
  }

  async logout(refresh_token: string | null) {
    if (!refresh_token) {
      return { success: true };
    }

    const refresh_token_hash = this.hashRefreshToken(refresh_token);
    await this.usersService.clearRefreshTokenByHash(refresh_token_hash);

    return { success: true };
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.usersService.findById(userId);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const isValid = await bcrypt.compare(dto.current_password, user.password_hash);

    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const newHash = await bcrypt.hash(dto.new_password, 10);
    await this.usersService.updatePassword(userId, newHash);

    return { success: true };
  }

  private hashRefreshToken(token: string) {
    return createHash('sha256').update(token).digest('hex');
  }

  private getRefreshTokenExpiresAt() {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_TTL_DAYS);
    return expiresAt;
  }
}

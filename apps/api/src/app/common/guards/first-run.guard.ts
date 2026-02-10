import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { UsersService } from '../../users/users.service';
import { ALLOW_FIRST_RUN_KEY } from '../../setup/decorators/allow-first-run.decorator';

@Injectable()
export class FirstRunGuard implements CanActivate {
  constructor(
    private readonly usersService: UsersService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (context.getType() !== 'http') {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const path = request?.url ?? '';

    if (path.startsWith('/api/docs')) {
      return true;
    }

    const allowFirstRun = this.reflector.getAllAndOverride<boolean>(
      ALLOW_FIRST_RUN_KEY,
      [context.getHandler(), context.getClass()],
    );

    const hasUsers = await this.usersService.hasUsers();

    if (hasUsers) {
      return true;
    }

    if (allowFirstRun) {
      return true;
    }

    throw new ServiceUnavailableException({
      message: 'Setup required',
      code: 'FIRST_RUN_REQUIRED',
      setup_url: '/api/setup',
    });
  }
}

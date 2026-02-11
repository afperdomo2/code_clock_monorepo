import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { UsersService } from '../../users/users.service';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly usersService: UsersService) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<{ user?: { id?: string } }>();
    const userId = request.user?.id;

    if (!userId) {
      throw new ForbiddenException('Missing authenticated user');
    }

    const user = await this.usersService.findById(userId);

    if (!user?.is_admin) {
      throw new ForbiddenException('Admin access required');
    }

    return true;
  }
}

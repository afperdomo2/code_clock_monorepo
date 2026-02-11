import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common';

export type AuthUser = {
  id: string;
  email?: string;
  isAdmin?: boolean;
};

export const CurrentUser = createParamDecorator(
  (field: keyof AuthUser | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<{ user?: AuthUser }>();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('Missing authenticated user');
    }

    return field ? user[field] : user;
  },
);

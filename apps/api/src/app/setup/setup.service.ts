import { ConflictException, Injectable } from '@nestjs/common';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class SetupService {
  constructor(private readonly usersService: UsersService) {}

  async status() {
    const hasUsers = await this.usersService.hasUsers();
    return { needsSetup: !hasUsers };
  }

  async register(dto: CreateUserDto) {
    const hasUsers = await this.usersService.hasUsers();

    if (hasUsers) {
      throw new ConflictException('Setup already completed');
    }

    const user = await this.usersService.createInitialAdmin(dto);
    const { password_hash: _passwordHash, ...safe } = user as {
      password_hash?: string;
    };
    void _passwordHash;

    return safe;
  }
}

import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    description: 'The email of the user',
    example: 'user@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'The password of the user',
    example: 'strongPassword123',
  })
  password: string;

  @ApiProperty({
    description: 'The name of the user',
    required: false,
    example: 'John Doe',
  })
  name?: string;
}

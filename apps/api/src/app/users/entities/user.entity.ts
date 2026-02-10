import { ApiProperty } from '@nestjs/swagger';

export class User {
  @ApiProperty({
    description: 'The unique identifier of the user',
    format: 'uuid',
  })
  id: string;

  @ApiProperty({
    description: 'The email of the user',
    example: 'user@example.com',
  })
  email: string;

  @ApiProperty({ description: 'The name of the user', required: false })
  name?: string;

  @ApiProperty({ description: 'Whether the user is an admin' })
  is_admin: boolean;

  @ApiProperty({ description: 'The date when the user was created' })
  created_at: Date;

  @ApiProperty({
    description: 'The date when the user was last updated',
    required: false,
  })
  updated_at?: Date;
}

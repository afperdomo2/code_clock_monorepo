import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class User {
  @ApiProperty({
    description: 'The unique identifier of the user',
    format: 'uuid',
  })
  @Expose()
  id!: string;

  @ApiProperty({
    description: 'The email of the user',
    example: 'user@example.com',
  })
  @Expose()
  email!: string;

  @ApiProperty({ description: 'The name of the user', required: false })
  @Expose()
  name?: string;

  @ApiProperty({ description: 'Whether the user is an admin' })
  @Expose({ name: 'is_admin' })
  isAdmin!: boolean;

  @ApiProperty({ description: 'The date when the user was created' })
  @Expose({ name: 'created_at' })
  createdAt!: Date;

  @ApiProperty({
    description: 'The date when the user was last updated',
    required: false,
  })
  @Expose({ name: 'updated_at' })
  updatedAt?: Date;
}

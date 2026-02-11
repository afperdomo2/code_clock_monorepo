import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class User {
  @ApiProperty({
    description: 'El identificador único del usuario',
    format: 'uuid',
  })
  @Expose()
  id!: string;

  @ApiProperty({
    description: 'El correo electrónico del usuario',
    example: 'user@example.com',
  })
  @Expose()
  email!: string;

  @ApiProperty({ description: 'El nombre del usuario', required: false })
  @Expose()
  name?: string;

  @ApiProperty({ description: 'Si el usuario es administrador' })
  @Expose({ name: 'is_admin' })
  isAdmin!: boolean;

  @ApiProperty({ description: 'La fecha en que se creó el usuario' })
  @Expose({ name: 'created_at' })
  createdAt!: Date;

  @ApiProperty({
    description: 'La fecha de la última actualización del usuario',
    required: false,
  })
  @Expose({ name: 'updated_at' })
  updatedAt?: Date;
}

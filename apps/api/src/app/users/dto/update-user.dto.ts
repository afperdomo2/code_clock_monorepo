import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({
    description: 'El correo electronico del usuario',
    required: false,
    example: 'user@example.com',
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({
    description: 'El nombre del usuario',
    required: false,
    example: 'John Doe',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;
}

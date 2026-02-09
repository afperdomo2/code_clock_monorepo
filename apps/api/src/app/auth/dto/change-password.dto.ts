import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({ example: 'currentPassword' })
  @IsString()
  @MinLength(6)
  @MaxLength(100)
  current_password!: string;

  @ApiProperty({ example: 'newSecurePassword' })
  @IsString()
  @MinLength(8)
  @MaxLength(100)
  new_password!: string;
}

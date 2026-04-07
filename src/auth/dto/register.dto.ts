import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../../common/enums/roles.enum';

export class RegisterDto {
  @ApiProperty({
    example: 'nenu@viajes.com',
    description: 'El email del usuario',
  })
  @IsEmail({}, { message: 'El email no es válido' })
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: '123456',
    description: 'Contraseña (mínimo 6 caracteres)',
  })
  @IsString()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  @IsNotEmpty()
  password: string;

  @ApiProperty({
    example: 'Fernando Mendez',
    description: 'Nombre completo',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    enum: Role,
    default: Role.USER,
    required: false,
    description: 'Nivel de acceso del usuario',
  })
  @IsEnum(Role)
  @IsOptional()
  role?: Role;
}

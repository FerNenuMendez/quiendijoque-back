import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsBoolean, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({
    example: 'Música de los 80',
    description: 'Nombre visible de la categoría',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'musica-80', description: 'Slug único para la URL' })
  @IsString()
  @IsNotEmpty()
  slug: string;

  @ApiProperty({
    example: false,
    description: 'Si es true, solo los VIP pueden jugarla',
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  requiresPremium?: boolean;
}

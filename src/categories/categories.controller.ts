/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../common/enums/roles.enum';
import type { Request } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiCookieAuth,
} from '@nestjs/swagger';
import { CreateCategoryDto } from './dto/create-category.dto';

@ApiTags('Categorias')
@ApiCookieAuth()
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Obtener todas las categorías con su estado de bloqueo (candado)',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de categorías evaluadas según el rol del usuario.',
  })
  @Get()
  findAll(@Req() req: Request) {
    const userRole = (req.user as any).role as Role;
    return this.categoriesService.findAllForUser(userRole);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: 'Crear una nueva categoría (Acceso exclusivo para Admin)',
  })
  @ApiResponse({
    status: 201,
    description: 'La categoría fue creada exitosamente.',
  })
  @ApiResponse({
    status: 403,
    description: 'Prohibido. Se requiere rol de Administrador.',
  })
  @Post()
  create(@Body() createCategoryDto: CreateCategoryDto) {
    // Usamos el DTO
    return this.categoriesService.create(createCategoryDto);
  }
}

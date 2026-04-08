/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../common/enums/roles.enum';
import type { Request } from 'express';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('Categorias')
@ApiBearerAuth()
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  // Endpoint público para los jugadores logueados
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Obtener todas las categorías con estado de bloqueo',
  })
  @Get()
  findAll(@Req() req: Request) {
    const userRole = (req.user as any).role as Role;
    return this.categoriesService.findAllForUser(userRole);
  }

  // Endpoint restringido solo para que vos (Admin) puedas crear categorías
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Crear una nueva categoría (Solo Admin)' })
  @Post()
  create(@Body() createCategoryDto: any) {
    // Idealmente acá usarías un DTO validado con class-validator
    return this.categoriesService.create(createCategoryDto);
  }
}

/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { UsersService } from '../users/users.service'; // 🔥 Inyectamos el servicio de usuarios
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../common/enums/roles.enum';
import type { Request } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CreateCategoryDto } from './dto/create-category.dto';

@ApiTags('Categorias')
@ApiBearerAuth() // 🔥 Cambiado a BearerAuth ya que estás usando tokens JWT móviles
@Controller('categories')
export class CategoriesController {
  constructor(
    private readonly categoriesService: CategoriesService,
    private readonly usersService: UsersService, // 🔥 Lo agregamos al constructor
  ) {}

  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Obtener todas las categorías con su estado de bloqueo (candado)',
  })
  @ApiResponse({
    status: 200,
    description:
      'Lista de categorías evaluadas según el rol y compras del usuario.',
  })
  @Get()
  async findAll(@Req() req: Request) {
    const userPayload = req.user as any;
    const userRole = userPayload.role as Role;
    const userId = userPayload.userId;

    // 🔥 Buscamos al usuario en la BD para ver qué llaves tiene compradas
    const fullUser = await this.usersService.findById(userId);
    const unlockedCategories = fullUser?.unlockedCategories || [];

    // Le pasamos el array al servicio
    return this.categoriesService.findAllForUser(userRole, unlockedCategories);
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
    return this.categoriesService.create(createCategoryDto);
  }
}

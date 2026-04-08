import { Controller, Get, UseGuards, Req, Patch, Body } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { Request } from 'express';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../common/enums/roles.enum';
import { UsersService } from './users.service';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiBearerAuth()
@ApiTags('Usuarios')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Obtener el perfil del usuario autenticado' })
  @ApiResponse({ status: 200, description: 'Perfil obtenido correctamente.' })
  @Get('me')
  async getProfile(@Req() req: Request) {
    // req.user tiene el payload del JWT (userId, email, role)
    // Buscamos el usuario en la BD para devolver sus puntos y datos actualizados
    const userId = (req.user as any).userId;
    const user = await this.usersService.findById(userId);

    return {
      message: 'Perfil obtenido correctamente',
      user,
    };
  }

  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Sumar puntos al usuario tras ganar una ronda' })
  @Patch('me/score')
  async updateScore(@Req() req: Request, @Body('points') points: number) {
    const userId = (req.user as any).userId;

    // Validación rápida de seguridad (evita que manden puntos negativos o una locura de puntos)
    if (!points || points < 0 || points > 10) {
      return { message: 'Puntaje inválido' };
    }

    const updatedUser = await this.usersService.addPoints(userId, points);

    return {
      message: 'Puntos sumados correctamente',
      totalPoints: updatedUser.totalPoints,
    };
  }

  @ApiOperation({ summary: 'Panel de control para administradores' })
  @ApiResponse({ status: 200, description: 'Acceso concedido.' })
  @ApiResponse({ status: 401, description: 'No autorizado (Token inválido).' })
  @ApiResponse({
    status: 403,
    description: 'Prohibido: No tienes permisos suficientes.',
  })
  @Get('admin-dashboard')
  @Roles(Role.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  getAdminData() {
    return { message: 'Bienvenido al panel de control, jefe' };
  }
}

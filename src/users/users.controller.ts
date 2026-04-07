import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { Request } from 'express';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../common/enums/roles.enum';
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
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Obtener el perfil del usuario autenticado' })
  @ApiResponse({ status: 200, description: 'Perfil obtenido correctamente.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  @Get('me')
  getProfile(@Req() req: Request) {
    return {
      message: 'Token válido, bienvenido al perfil',
      user: req.user,
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

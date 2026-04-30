import {
  Controller,
  Get,
  UseGuards,
  Req,
  Patch,
  Body,
  Post,
} from '@nestjs/common';
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

  // ====================================================================
  // 🔥 NUEVO: Ranking Global (Top 50)
  // ====================================================================
  @UseGuards(JwtAuthGuard)
  @Get('ranking')
  @ApiOperation({ summary: 'Obtener el Top 50 de jugadores globales' })
  async getRanking() {
    return this.usersService.getTopPlayers();
  }

  // ====================================================================
  // PERFIL DE USUARIO
  // ====================================================================
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Obtener el perfil del usuario autenticado' })
  @ApiResponse({ status: 200, description: 'Perfil obtenido correctamente.' })
  @Get('me')
  async getProfile(@Req() req: Request) {
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

    if (!points || points < 0 || points > 100) {
      return { message: 'Puntaje inválido' };
    }

    const updatedUser = await this.usersService.addPoints(userId, points);

    return {
      message: 'Puntos sumados correctamente',
      totalPoints: updatedUser.totalPoints,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('me/unlock')
  @ApiOperation({ summary: 'Desbloquear una categoría Premium usando puntos' })
  async unlockCategory(
    @Req() req: Request,
    @Body('categoryId') categoryId: string,
  ) {
    const userId = (req.user as any).userId;
    return this.usersService.unlockCategory(userId, categoryId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Actualizar el nombre de usuario' })
  @Patch('me/username')
  async updateUsername(
    @Req() req: Request,
    @Body('username') username: string,
  ) {
    const userId = (req.user as any).userId;

    if (!username || username.trim().length < 3) {
      return { message: 'El nombre debe tener al menos 3 caracteres' };
    }

    const updatedUser = await this.usersService.updateUsername(
      userId,
      username,
    );

    return {
      message: 'Nombre actualizado con éxito',
      user: updatedUser,
    };
  }

  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Actualizar foto de perfil' })
  @Patch('me/avatar')
  async updateAvatar(@Req() req: Request, @Body('avatar') avatar: string) {
    const userId = (req.user as any).userId;
    const updatedUser = await this.usersService.updateAvatar(userId, avatar);
    return { message: 'Avatar actualizado con éxito', user: updatedUser };
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me/password')
  @ApiOperation({ summary: 'Cambiar la contraseña del usuario' })
  async changePassword(@Req() req: Request, @Body() body: any) {
    const userId = (req.user as any).userId;
    return this.usersService.changePassword(
      userId,
      body.oldPassword,
      body.newPassword,
    );
  }

  // ====================================================================
  // ADMIN DASHBOARD
  // ====================================================================
  @ApiOperation({ summary: 'Panel de control para administradores' })
  @ApiResponse({ status: 200, description: 'Acceso concedido.' })
  @ApiResponse({ status: 401, description: 'No autorizado (Token inválido).' })
  @ApiResponse({
    status: 403,
    description: 'Prohibido: No tienes permisos suficientes.',
  })
  @Get('admin-dashboard')
  @Roles(Role.USER) // Tech Lead Note: ¿Seguro que es Role.USER acá? Ojo con esto si es de admin.
  @UseGuards(JwtAuthGuard, RolesGuard)
  getAdminData() {
    return { message: 'Bienvenido al panel de control, jefe' };
  }
}

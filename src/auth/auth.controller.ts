/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Controller,
  Get,
  Post,
  Body,
  Res,
  Req,
  UseGuards,
  Param,
  BadRequestException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import * as express from 'express';
import { UsersService } from '../users/users.service';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ConfigService } from '@nestjs/config';

@ApiTags('Autenticación')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
  ) {}

  @ApiOperation({ summary: 'Redirigir a Google para autenticación' })
  @ApiResponse({
    status: 302,
    description: 'Redirige a la pantalla de login de Google.',
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado (Falla en el Guard).',
  })
  @Get('google')
  @UseGuards(GoogleAuthGuard)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async googleAuth(@Req() _req: any) {
    // El Guard redirige automáticamente a Google
  }

  @ApiOperation({ summary: 'Callback de Google OAuth' })
  @ApiResponse({
    status: 200,
    description: 'Login exitoso mediante Google y cookie establecida.',
  })
  @ApiResponse({
    status: 400,
    description: 'No se recibió el usuario desde Google.',
  })
  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleAuthRedirect(
    @Req() req: any,
    @Res({ passthrough: true }) res: express.Response,
  ) {
    return this.authService.googleLogin(req.user, res);
  }

  @ApiOperation({ summary: 'Login tradicional con email y contraseña' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'Login exitoso y cookie de sesión establecida.',
  })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos.' })
  @ApiResponse({ status: 401, description: 'Credenciales inválidas.' })
  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: express.Response,
  ) {
    const authData = await this.authService.login(
      loginDto.email,
      loginDto.password,
    );

    const isProduction =
      this.configService.get<string>('NODE_ENV') === 'production';

    res.cookie('access_token', authData.access_token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'strict',
      maxAge: 1000 * 60 * 60 * 24,
    });

    return {
      message: 'Login exitoso',
      user: authData.user,
    };
  }

  @ApiOperation({ summary: 'Cerrar sesión' })
  @ApiResponse({
    status: 201,
    description: 'Cookie eliminada correctamente. Sesión cerrada.',
  })
  @Post('logout')
  logout(@Res({ passthrough: true }) res: express.Response) {
    res.clearCookie('access_token');
    return { message: 'Sesión cerrada correctamente' };
  }

  @ApiOperation({ summary: 'Registrar un nuevo jugador' })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({
    status: 201,
    description:
      'Usuario registrado con éxito. Se envió correo de verificación.',
  })
  @ApiResponse({
    status: 400,
    description: 'Error de validación en los datos enviados.',
  })
  @ApiResponse({
    status: 409,
    description: 'El email ya se encuentra registrado.',
  })
  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    await this.usersService.create(registerDto);
    return {
      message:
        'Registro exitoso. Por favor, revisá tu correo para activar la cuenta.',
    };
  }

  @ApiOperation({
    summary: 'Verificar cuenta mediante token enviado por email',
  })
  @ApiParam({
    name: 'token',
    description: 'Token único de 64 caracteres enviado al correo del usuario',
  })
  @ApiResponse({ status: 200, description: 'Cuenta activada correctamente.' })
  @ApiResponse({ status: 400, description: 'Falta el token de verificación.' })
  @ApiResponse({
    status: 404,
    description: 'Token inválido o cuenta ya verificada.',
  })
  @Get('verify/:token')
  async verifyEmail(@Param('token') token: string) {
    if (!token) {
      throw new BadRequestException('Falta el token de verificación');
    }
    await this.usersService.verifyUserEmail(token);
    return {
      message: 'Cuenta activada correctamente. Ya podés iniciar sesión.',
    };
  }
}

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

  // ====================================================================
  // GOOGLE LOGIN (WEB CLÁSICO)
  // ====================================================================
  @ApiOperation({ summary: 'Redirigir a Google para autenticación' })
  @ApiResponse({ status: 302, description: 'Redirige a la pantalla de login.' })
  @Get('google')
  @UseGuards(GoogleAuthGuard)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async googleAuth(@Req() _req: any) {
    // El Guard redirige automáticamente a Google
  }

  @ApiOperation({ summary: 'Callback de Google OAuth' })
  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleAuthRedirect(@Req() req: any) {
    return this.authService.googleLogin(req.user);
  }

  // ====================================================================
  // 🔥 NUEVO: GOOGLE LOGIN (MOBILE / EXPO) 🔥
  // ====================================================================
  @ApiOperation({ summary: 'Login con Google desde la App Móvil' })
  @ApiBody({ schema: { properties: { token: { type: 'string' } } } })
  @ApiResponse({ status: 200, description: 'Login exitoso desde móvil.' })
  @Post('google/mobile')
  async googleLoginMobile(@Body('token') token: string) {
    if (!token) {
      throw new BadRequestException('Falta el token de Google');
    }
    return this.authService.verifyGoogleMobileToken(token);
  }

  // ====================================================================
  // LOGIN TRADICIONAL WEB (Cookies)
  // ====================================================================
  @ApiOperation({ summary: 'Login tradicional con email y contraseña' })
  @ApiBody({ type: LoginDto })
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    const authData = await this.authService.login(
      loginDto.email,
      loginDto.password,
    );

    return {
      message: 'Login exitoso',
      token: authData.access_token,
      user: authData.user,
    };
  }

  @ApiOperation({ summary: 'Cerrar sesión' })
  @Post('logout')
  logout() {
    return { message: 'Sesión cerrada correctamente' };
  }

  // ====================================================================
  // LOGIN MOBILE (Para la app en Expo)
  // ====================================================================
  @ApiOperation({ summary: 'Login exclusivo para la App Móvil' })
  @Post('login/mobile')
  async loginMobile(@Body() loginDto: LoginDto) {
    // Reutilizamos tu misma lógica de validación
    const authData = await this.authService.login(
      loginDto.email,
      loginDto.password,
    );

    // Acá NO usamos res.cookie. Mandamos el token directamente en la respuesta.
    return {
      message: 'Login móvil exitoso',
      user: authData.user,
      token: authData.access_token, // El "Pase VIP" para el celular
    };
  }

  // ====================================================================
  // REGISTRO Y VERIFICACIÓN
  // ====================================================================
  @ApiOperation({ summary: 'Registrar un nuevo jugador' })
  @ApiBody({ type: RegisterDto })
  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    await this.usersService.create(registerDto);
    return {
      message: 'Registro exitoso. Por favor, revisá tu correo.',
    };
  }

  @ApiOperation({ summary: 'Verificar cuenta mediante token' })
  @ApiParam({ name: 'token', description: 'Token único' })
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

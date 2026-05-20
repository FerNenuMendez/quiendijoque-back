import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { Response } from 'express';
import { Role } from '../common/enums/roles.enum';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';

interface GoogleUser {
  email: string;
  firstName: string;
  lastName: string;
  picture?: string;
}

@Injectable()
export class AuthService {
  // Limpiamos el constructor (TypeScript ya no va a llorar)
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  // ====================================================================
  // LOGIN CLÁSICO (EMAIL Y CLAVE)
  // ====================================================================
  async login(email: string, pass: string) {
    const user = await this.usersService.findByEmail(email);

    if (user && user.password && (await bcrypt.compare(pass, user.password))) {
      if (!user.isVerified) {
        throw new UnauthorizedException(
          'Por favor, verificá tu correo antes de iniciar sesión.',
        );
      }
      const payload = { sub: user.id, email: user.email, role: user.role };
      return {
        access_token: this.jwtService.sign(payload),
        user: {
          name: user.name,
          username: user.username,
          email: user.email,
          role: user.role,
        },
      };
    }

    throw new UnauthorizedException('Credenciales incorrectas');
  }

  // ====================================================================
  // 🔥 VERIFICACIÓN DEL TOKEN MÓVIL (EXPO) 🔥
  // ====================================================================
  async verifyGoogleMobileToken(idToken: string) {
    try {
      // 1. Instanciamos el cliente acá mismo en el momento de la petición (Solución al Error 1)
      const googleClient = new OAuth2Client(
        this.configService.get<string>('GOOGLE_CLIENT_ID'),
      );

      // 2. Verificamos la firma del token con Google
      const ticket = await googleClient.verifyIdToken({
        idToken: idToken,
        audience: [this.configService.get<string>('GOOGLE_CLIENT_ID')!],
      });

      const payload = ticket.getPayload();
      if (!payload || !payload.email) {
        throw new BadRequestException(
          'El token de Google no contiene un email válido',
        );
      }

      // 3. Buscamos o creamos el usuario
      let userInDb = await this.usersService.findByEmail(payload.email);

      if (!userInDb) {
        const randomPassword = Math.random().toString(36).slice(-10);
        const baseUsername = payload.email.split('@')[0];
        const randomSuffix = Math.floor(Math.random() * 10000);

        userInDb = await this.usersService.create({
          email: payload.email,
          username: `${baseUsername}_${randomSuffix}`,
          name: payload.name || `${payload.given_name} ${payload.family_name}`,
          password: randomPassword,
          // (Solución al Error 2: Eliminamos la propiedad isVerified)
        });
      }

      // 4. Generamos tu JWT de NestJS
      const jwtPayload = {
        sub: userInDb.id,
        email: userInDb.email,
        role: userInDb.role,
      };
      const accessToken = this.jwtService.sign(jwtPayload);

      // 5. Devolvemos el usuario y el token explícitamente para el frontend
      return {
        message: 'Login móvil con Google exitoso',
        user: {
          id: userInDb.id,
          email: userInDb.email,
          name: userInDb.name,
          username: userInDb.username,
          role: userInDb.role,
        },
        token: accessToken, // El "Pase VIP" devuelto explícitamente en el JSON
      };
    } catch (error) {
      console.error(
        'Error verificando token de Google desde el celular:',
        error,
      );
      throw new UnauthorizedException('Token de Google inválido o expirado');
    }
  }

  // ====================================================================
  // GOOGLE LOGIN (WEB CLÁSICO)
  // ====================================================================
  async googleLogin(user: GoogleUser) {
    if (!user) {
      throw new BadRequestException('No se recibió el usuario de Google');
    }

    let userInDb = await this.usersService.findByEmail(user.email);

    if (!userInDb) {
      const randomPassword = Math.random().toString(36).slice(-10);
      const baseUsername = user.email.split('@')[0];
      const randomSuffix = Math.floor(Math.random() * 10000);

      userInDb = await this.usersService.create({
        email: user.email,
        username: `${baseUsername}_${randomSuffix}`,
        name: `${user.firstName} ${user.lastName}`,
        password: randomPassword,
        // (Solución al Error 2 también aplicada acá)
      });
    }

    const payload = {
      sub: userInDb.id,
      email: userInDb.email,
      role: userInDb.role,
    };
    const accessToken = this.jwtService.sign(payload);

    return {
      message: 'Login con Google exitoso',
      token: accessToken,
      user: {
        _id: userInDb.id,
        email: userInDb.email,
        name: userInDb.name,
        username: userInDb.username,
        role: userInDb.role,
      },
    };
  }
}

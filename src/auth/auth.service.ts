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

interface GoogleUser {
  email: string;
  firstName: string;
  lastName: string;
  picture?: string;
}
@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async login(email: string, pass: string) {
    const user = await this.usersService.findByEmail(email);

    if (user && user.password && (await bcrypt.compare(pass, user.password))) {
      // ---> NUEVA VALIDACIÓN: Revisar si está verificado <---
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
          email: user.email,
          role: user.role,
        },
      };
    }

    throw new UnauthorizedException('Credenciales incorrectas');
  }

  async googleLogin(user: GoogleUser, res: Response) {
    if (!user) {
      throw new BadRequestException('No se recibió el usuario de Google');
    }

    // 1. Buscamos si el usuario ya existe por email
    let userInDb = await this.usersService.findByEmail(user.email);

    // 2. Si no existe, lo registramos automáticamente
    if (!userInDb) {
      const randomPassword = Math.random().toString(36).slice(-10);
      userInDb = await this.usersService.create({
        email: user.email,
        name: `${user.firstName} ${user.lastName}`,
        password: randomPassword,
        role: Role.USER,
      });
    }

    // 3. Generamos nuestro JWT
    const payload = {
      sub: userInDb.id,
      email: userInDb.email,
      role: userInDb.role,
    };
    const accessToken = this.jwtService.sign(payload);

    const isProduction =
      this.configService.get<string>('NODE_ENV') === 'production';

    // 4. Seteamos la cookie
    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'strict',
      maxAge: 1000 * 60 * 60 * 24, // 1 día
    });

    return {
      message: 'Login con Google exitoso',
      user: {
        _id: userInDb.id,
        email: userInDb.email,
        name: userInDb.name,
        role: userInDb.role,
      },
    };
  }
}

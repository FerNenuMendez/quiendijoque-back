/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  // Este método maneja qué pasa cuando termina la validación del token
  handleRequest(err: any, user: any, info: any) {
    // Si hay un error, el token expiró o simplemente no hay usuario en la cookie...
    if (err || !user) {
      throw (
        err ||
        new UnauthorizedException(
          'No tenés permiso para pasar. Logueate primero.',
        )
      );
    }
    // Si todo está ok, devuelve el usuario (que se inyectará en req.user)
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return user;
  }
}

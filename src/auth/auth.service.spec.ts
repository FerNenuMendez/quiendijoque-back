/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Role } from '../common/enums/roles.enum';

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  // 1. Creamos los Mocks (Simulaciones)
  const mockUsersService = {
    findByEmail: jest.fn(),
    create: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn().mockReturnValue('mock-token'),
  };

  const mockConfigService = {
    get: jest.fn().mockReturnValue('development'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
  });

  // Limpiar los mocks después de cada test
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('debería estar definido', () => {
    expect(authService).toBeDefined();
  });

  describe('login', () => {
    it('debería retornar un access_token si las credenciales son válidas y el mail está verificado', async () => {
      // Arrange (Preparar)
      const plainPassword = 'password123';
      const hashedPassword = await bcrypt.hash(plainPassword, 10);
      const mockUser = {
        id: 'user-id',
        email: 'fer@test.com',
        password: hashedPassword,
        name: 'Fer',
        role: Role.USER,
        isVerified: true, // El usuario validó su correo
      };

      mockUsersService.findByEmail.mockResolvedValue(mockUser);

      // Act (Actuar)
      const result = await authService.login('fer@test.com', plainPassword);

      // Assert (Afirmar)
      expect(result).toHaveProperty('access_token');
      expect(result.user.email).toBe('fer@test.com');
      expect(mockJwtService.sign).toHaveBeenCalled();
    });

    it('debería lanzar UnauthorizedException si el correo NO está verificado', async () => {
      // Arrange
      const plainPassword = 'password123';
      const hashedPassword = await bcrypt.hash(plainPassword, 10);

      mockUsersService.findByEmail.mockResolvedValue({
        id: 'user-id',
        email: 'fer@test.com',
        password: hashedPassword,
        name: 'Fer',
        role: Role.USER,
        isVerified: false, // El usuario NO validó su correo
      });

      // Act & Assert
      await expect(
        authService.login('fer@test.com', plainPassword),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('debería lanzar UnauthorizedException si la contraseña es incorrecta', async () => {
      // Arrange
      mockUsersService.findByEmail.mockResolvedValue({
        email: 'fer@test.com',
        password: 'password-en-db',
        isVerified: true,
      });

      // Act & Assert
      await expect(
        authService.login('fer@test.com', 'wrong-pass'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('debería lanzar UnauthorizedException si el usuario no existe', async () => {
      // Arrange
      mockUsersService.findByEmail.mockResolvedValue(null);

      // Act & Assert
      await expect(authService.login('nadie@test.com', 'pass')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('googleLogin', () => {
    it('debería lanzar BadRequestException si no se provee usuario', async () => {
      const mockRes = { cookie: jest.fn() } as any;
      await expect(
        authService.googleLogin(null as any, mockRes),
      ).rejects.toThrow(BadRequestException);
    });
  });
});

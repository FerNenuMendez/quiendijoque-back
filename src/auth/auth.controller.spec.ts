/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  // 1. Creamos los Mocks de los 3 servicios que usa el controlador
  const mockAuthService = {
    login: jest.fn(),
    googleLogin: jest.fn(),
  };

  const mockUsersService = {
    create: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn().mockReturnValue('development'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: UsersService, useValue: mockUsersService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('debería estar definido', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('debería llamar a authService.login y setear una cookie', async () => {
      // Arrange
      const loginDto = { email: 'fer@test.com', password: 'password123' };
      const mockAuthData = {
        access_token: 'fake-jwt',
        user: { name: 'Fer', email: 'fer@test.com', role: 'TRAVELER' },
      };

      // Simulamos la respuesta de Express (el objeto res)
      const mockRes = {
        cookie: jest.fn(),
      } as unknown as Response;

      mockAuthService.login.mockResolvedValue(mockAuthData);

      // Act
      const result = await controller.login(loginDto, mockRes);

      // Assert
      expect(authService.login).toHaveBeenCalledWith(
        loginDto.email,
        loginDto.password,
      );
      expect(mockRes.cookie).toHaveBeenCalled(); // Verificamos que se intentó setear la cookie
      expect(result.message).toBe('Login exitoso');
    });
  });

  describe('register', () => {
    it('debería llamar a usersService.create', async () => {
      const registerDto = {
        email: 'nuevo@test.com',
        password: 'pass',
        name: 'Nuevo Usuario',
      };

      await controller.register(registerDto);

      expect(mockUsersService.create).toHaveBeenCalledWith(registerDto);
    });
  });
});

/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getModelToken } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import {
  ConflictException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

describe('UsersService', () => {
  let service: UsersService;
  let model: any;
  let mailerService: any;

  // 1. Mock del Modelo de Mongoose adaptado para soportar "new model()" y métodos estáticos
  class MockUserModel {
    constructor(public dto: any) {
      Object.assign(this, dto);
    }
    save = jest.fn().mockResolvedValue({ id: 'new-id', ...this.dto });

    static findOne = jest.fn();
    static findById = jest.fn();
    static findByIdAndDelete = jest.fn();
  }

  // 2. Mock del servicio de Mailer
  const mockMailerService = {
    sendMail: jest.fn(),
  };

  // Función auxiliar para simular el .exec() de Mongoose
  const mockExec = (value: any) => ({
    exec: jest.fn().mockResolvedValue(value),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getModelToken(User.name),
          useValue: MockUserModel,
        },
        {
          provide: MailerService,
          useValue: mockMailerService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    model = module.get(getModelToken(User.name));
    mailerService = module.get(MailerService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('debería estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('findByEmail', () => {
    it('debería retornar un usuario si el email existe', async () => {
      const mockUser = { email: 'test@test.com', name: 'Fer' };
      model.findOne.mockReturnValue(mockExec(mockUser));

      const result = await service.findByEmail('test@test.com');
      expect(result).toEqual(mockUser);
    });
  });

  describe('create (Registro de usuario)', () => {
    const mockUserDto = {
      email: 'test@test.com',
      name: 'Fer',
      password: '123',
    };

    it('debería crear un usuario y enviar el correo de verificación', async () => {
      model.findOne.mockReturnValue(mockExec(null));
      mockMailerService.sendMail.mockResolvedValue(true);

      const result = await service.create(mockUserDto);

      expect(result.email).toEqual(mockUserDto.email);
      expect(result.isVerified).toBe(false);
      expect(result.verificationToken).toBeDefined();
      expect(mockMailerService.sendMail).toHaveBeenCalledTimes(1);
    });

    it('debería lanzar ConflictException si el email ya existe', async () => {
      model.findOne.mockReturnValue(mockExec({ email: 'existe@test.com' }));

      await expect(
        service.create({
          email: 'existe@test.com',
          name: 'Fer',
          password: '123',
        }),
      ).rejects.toThrow(ConflictException);

      expect(mockMailerService.sendMail).not.toHaveBeenCalled();
    });

    it('debería borrar el usuario (rollback) y lanzar InternalServerErrorException si falla el correo', async () => {
      model.findOne.mockReturnValue(mockExec(null));
      mockMailerService.sendMail.mockRejectedValue(new Error('Fallo SMTP'));

      await expect(service.create(mockUserDto)).rejects.toThrow(
        InternalServerErrorException,
      );

      expect(model.findByIdAndDelete).toHaveBeenCalledTimes(1);
    });
  });

  describe('verifyUserEmail', () => {
    it('debería activar la cuenta si el token es válido', async () => {
      const mockUserInDb = {
        isVerified: false,
        verificationToken: 'token-valido-123',
        save: jest.fn().mockResolvedValue(true),
      };

      model.findOne.mockReturnValue(mockExec(mockUserInDb));

      const result = await service.verifyUserEmail('token-valido-123');

      expect(result).toBe(true);
      expect(mockUserInDb.isVerified).toBe(true);
      expect(mockUserInDb.verificationToken).toBeUndefined();
      expect(mockUserInDb.save).toHaveBeenCalledTimes(1);
    });

    it('debería lanzar NotFoundException si el token es inválido', async () => {
      model.findOne.mockReturnValue(mockExec(null));

      await expect(service.verifyUserEmail('token-invalido')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findById', () => {
    it('debería lanzar NotFoundException si el usuario no existe', async () => {
      model.findById.mockReturnValue(mockExec(null));

      await expect(service.findById('id-inexistente')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});

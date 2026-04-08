import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';
import { Role } from '../common/enums/roles.enum';
import type { Request } from 'express';

describe('CategoriesController', () => {
  let controller: CategoriesController;
  let service: CategoriesService;

  // 1. Mockeamos el servicio. No queremos que ejecute la lógica real.
  const mockCategoriesService = {
    findAllForUser: jest
      .fn()
      .mockResolvedValue([{ name: 'Series', isLocked: false }]),
    create: jest
      .fn()
      .mockImplementation((dto) => Promise.resolve({ id: '123', ...dto })),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoriesController],
      providers: [
        {
          provide: CategoriesService,
          useValue: mockCategoriesService,
        },
      ],
    }).compile();

    controller = module.get<CategoriesController>(CategoriesController);
    service = module.get<CategoriesService>(CategoriesService);
  });

  it('debería estar definido', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('debería extraer el rol del request y llamar al servicio', async () => {
      // Simulamos el objeto Request de Express con el payload que dejaría tu JwtAuthGuard
      const mockRequest = {
        user: { role: Role.USER },
      } as unknown as Request;

      const result = await controller.findAll(mockRequest);

      // Verificamos que se haya llamado al servicio con el rol correcto
      expect(service.findAllForUser).toHaveBeenCalledWith(Role.USER);
      expect(result).toEqual([{ name: 'Series', isLocked: false }]);
    });
  });
});

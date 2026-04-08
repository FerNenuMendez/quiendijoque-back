import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesService } from './categories.service';
import { getModelToken } from '@nestjs/mongoose';
import { Category } from './schemas/category.schema';
import { Role } from '../common/enums/roles.enum';

// 1. Creamos un Mock de la Base de Datos (Mongoose)
// Simulamos lo que devolvería MongoDB al hacer un .find().exec()
const mockCategoriesDB = [
  {
    toJSON: () => ({
      name: 'Películas',
      slug: 'peliculas',
      requiresPremium: false,
    }),
  },
  {
    toJSON: () => ({
      name: 'Rock Internacional',
      slug: 'rock-internacional',
      requiresPremium: true,
    }),
  },
];

// Para soportar "new this.categoryModel()" y "this.categoryModel.find()"
class MockCategoryModel {
  constructor(private data: any) {}
  save = jest.fn().mockResolvedValue(this.data);
  static find = jest.fn().mockReturnValue({
    exec: jest.fn().mockResolvedValue(mockCategoriesDB),
  });
}

describe('CategoriesService', () => {
  let service: CategoriesService;

  beforeEach(async () => {
    // 2. Armamos el módulo de prueba falso
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        {
          provide: getModelToken(Category.name),
          useValue: MockCategoryModel, // Inyectamos nuestro Mock en lugar de Mongoose real
        },
      ],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
  });

  it('debería estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('findAllForUser', () => {
    it('debería bloquear categorías premium para un usuario FREE', async () => {
      // Ejecutamos el método simulando un usuario normal
      const result = await service.findAllForUser(Role.USER);

      expect(result).toHaveLength(2);
      // La categoría free no debe estar bloqueada
      expect(result[0].isLocked).toBe(false);
      // La categoría premium DEBE estar bloqueada
      expect(result[1].isLocked).toBe(true);
    });

    it('debería liberar todas las categorías para un usuario USERPLUS', async () => {
      // Ejecutamos el método simulando un usuario de pago
      const result = await service.findAllForUser(Role.USERPLUS);

      expect(result).toHaveLength(2);
      expect(result[0].isLocked).toBe(false);
      expect(result[1].isLocked).toBe(false); // La premium ahora está liberada
    });

    it('debería liberar todas las categorías para un ADMIN', async () => {
      const result = await service.findAllForUser(Role.ADMIN);
      expect(result[1].isLocked).toBe(false);
    });
  });
});

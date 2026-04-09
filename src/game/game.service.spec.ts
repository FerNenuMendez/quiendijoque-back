import { Test, TestingModule } from '@nestjs/testing';
import { GameService } from './game.service';
import { getModelToken } from '@nestjs/mongoose';
import { Quote } from '../quotes/schemas/quote.schema';
import { Author } from '../quotes/schemas/author.schema';
import { Types } from 'mongoose';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('GameService', () => {
  let service: GameService;

  // Creamos IDs falsos pero con formato válido de Mongo para los tests
  const mockCategoryId = new Types.ObjectId().toString();
  const mockQuoteId = new Types.ObjectId().toString();
  const mockRealAuthorId = new Types.ObjectId();
  const mockSelectedAuthorId = mockRealAuthorId.toString();

  // Mock de lo que devolvería el Aggregation Pipeline
  const mockAggregationResult = [
    {
      _id: new Types.ObjectId(mockQuoteId),
      text: 'Frase de prueba',
      authorId: mockRealAuthorId,
      categoryId: new Types.ObjectId(mockCategoryId),
      correctAuthor: {
        _id: mockRealAuthorId,
        name: 'Autor Real',
        avatarUrl: 'url',
      },
      distractors: [
        { _id: new Types.ObjectId(), name: 'Falso 1', avatarUrl: 'url1' },
        { _id: new Types.ObjectId(), name: 'Falso 2', avatarUrl: 'url2' },
        { _id: new Types.ObjectId(), name: 'Falso 3', avatarUrl: 'url3' },
      ],
    },
  ];

  // Mock del modelo Quote (Frases)
  const mockQuoteModel = {
    aggregate: jest.fn(),
    findById: jest.fn(),
  };

  // Mock del modelo Author (Autores) - No lo usamos directo en el código, pero el constructor lo pide
  const mockAuthorModel = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GameService,
        { provide: getModelToken(Quote.name), useValue: mockQuoteModel },
        { provide: getModelToken(Author.name), useValue: mockAuthorModel },
      ],
    }).compile();

    service = module.get<GameService>(GameService);
  });

  afterEach(() => {
    jest.clearAllMocks(); // Limpiamos los mocks después de cada test
  });

  it('debería estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('generateRound', () => {
    it('debería lanzar NotFoundException si el categoryId es inválido', async () => {
      await expect(service.generateRound('id-roto')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('debería retornar las preguntas mapeadas y mezcladas', async () => {
      mockQuoteModel.aggregate.mockResolvedValueOnce(mockAggregationResult);

      const result = await service.generateRound(mockCategoryId);

      expect(result).toHaveLength(1);
      expect(result[0].text).toBe('Frase de prueba');
      // Tienen que haber 4 opciones (1 correcta + 3 distractores)
      expect(result[0].options).toHaveLength(4);
      expect(mockQuoteModel.aggregate).toHaveBeenCalled();
    });

    it('debería lanzar NotFoundException si la categoría no tiene frases', async () => {
      mockQuoteModel.aggregate.mockResolvedValueOnce([]); // Array vacío simulando que no hay datos
      await expect(service.generateRound(mockCategoryId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('checkAnswer', () => {
    it('debería lanzar BadRequestException si los IDs son inválidos', async () => {
      await expect(service.checkAnswer('id-roto', 'id-roto2')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('debería devolver true si el autor seleccionado es el correcto', async () => {
      mockQuoteModel.findById.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValueOnce({ authorId: mockRealAuthorId }),
      });

      const result = await service.checkAnswer(
        mockQuoteId,
        mockSelectedAuthorId,
      );

      expect(result.isCorrect).toBe(true);
      expect(result.correctAuthorId).toBe(mockSelectedAuthorId);
    });

    it('debería devolver false si el autor seleccionado es incorrecto', async () => {
      const wrongAuthorId = new Types.ObjectId().toString();
      mockQuoteModel.findById.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValueOnce({ authorId: mockRealAuthorId }),
      });

      const result = await service.checkAnswer(mockQuoteId, wrongAuthorId);

      expect(result.isCorrect).toBe(false);
      expect(result.correctAuthorId).toBe(mockRealAuthorId.toString());
    });
  });
});

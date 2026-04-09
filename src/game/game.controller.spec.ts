import { Test, TestingModule } from '@nestjs/testing';
import { GameController } from './game.controller';
import { GameService } from './game.service';
import { BadRequestException } from '@nestjs/common';

describe('GameController', () => {
  let controller: GameController;
  let service: GameService;

  const mockGameService = {
    generateRound: jest.fn(),
    checkAnswer: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GameController],
      providers: [
        {
          provide: GameService,
          useValue: mockGameService,
        },
      ],
    }).compile();

    controller = module.get<GameController>(GameController);
    service = module.get<GameService>(GameService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('debería estar definido', () => {
    expect(controller).toBeDefined();
  });

  describe('getRound', () => {
    it('debería llamar al servicio y devolver la ronda estructurada', async () => {
      const mockQuestions = [{ quoteId: '1', text: 'Hola', options: [] }];
      mockGameService.generateRound.mockResolvedValueOnce(mockQuestions);

      const result = await controller.getRound('cat-123');

      expect(service.generateRound).toHaveBeenCalledWith('cat-123');
      expect(result).toEqual({
        message: 'Ronda generada con éxito',
        totalQuestions: 1,
        questions: mockQuestions,
      });
    });
  });

  describe('submitAnswer', () => {
    // Eliminamos el test del BadRequestException manual porque ahora
    // esa validación la hace automáticamente el ValidationPipe de NestJS.

    it('debería llamar al servicio y devolver el veredicto', async () => {
      const mockVerdict = { isCorrect: true, correctAuthorId: 'abc' };
      mockGameService.checkAnswer.mockResolvedValueOnce(mockVerdict);

      // Ahora le pasamos un único objeto (el DTO) en lugar de dos strings separados
      const submitDto = { quoteId: '123', selectedAuthorId: 'abc' };

      const result = await controller.submitAnswer(submitDto);

      expect(service.checkAnswer).toHaveBeenCalledWith('123', 'abc');
      expect(result).toEqual(mockVerdict);
    });
  });
});

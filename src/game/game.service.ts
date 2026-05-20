/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Quote } from '../quotes/schemas/quote.schema';
import { Author } from '../quotes/schemas/author.schema';
import { UsersService } from '../users/users.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class GameService {
  constructor(
    @InjectModel(Quote.name) private quoteModel: Model<Quote>,
    @InjectModel(Author.name) private authorModel: Model<Author>,
    private usersService: UsersService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async getNextQuestion(userId: string, categoryId: string) {
    if (!Types.ObjectId.isValid(categoryId)) {
      throw new NotFoundException('Categoría no válida');
    }

    const categoryObjectId = new Types.ObjectId(categoryId);

    const validAuthorIds = await this.quoteModel.distinct('authorId', {
      categoryId: categoryObjectId,
    });

    const questions = await this.quoteModel.aggregate([
      { $match: { categoryId: categoryObjectId } },
      // Agarramos 1 sola frase al azar
      { $sample: { size: 1 } },
      {
        $lookup: {
          from: 'game_authors',
          localField: 'authorId',
          foreignField: '_id',
          as: 'correctAuthor',
        },
      },
      { $unwind: '$correctAuthor' },
      {
        $lookup: {
          from: 'game_authors',
          let: { realAuthorId: '$authorId' },
          pipeline: [
            {
              $match: {
                _id: { $in: validAuthorIds },
                $expr: { $ne: ['$_id', '$$realAuthorId'] },
              },
            },
            { $sample: { size: 3 } },
          ],
          as: 'distractors',
        },
      },
    ]);

    if (!questions || questions.length === 0) {
      throw new NotFoundException(
        'No hay suficientes frases para esta categoría',
      );
    }

    const q = questions[0];
    const allOptions = [
      {
        id: q.correctAuthor._id,
        name: q.correctAuthor.name,
        avatar: q.correctAuthor.avatarUrl,
      },
      ...q.distractors.map((d) => ({
        id: d._id,
        name: d.name,
        avatar: d.avatarUrl,
      })),
    ];

    // Iniciamos o recuperamos la sesión en caché
    const cacheKey = `game_session_${userId}`;
    const existingSession = await this.cacheManager.get<{ currentStreak: number }>(cacheKey);
    const currentStreak = existingSession ? existingSession.currentStreak : 0;

    await this.cacheManager.set(cacheKey, {
      startTime: Date.now(),
      currentStreak: currentStreak
    }, 15000); // 15 segundos TTL en milisegundos

    return {
      quoteId: q._id,
      text: q.text,
      options: this.shuffleArray(allOptions),
    };
  }

  // Función auxiliar de Fisher-Yates para mezclar arrays de forma aleatoria perfecta
  private shuffleArray(array: any[]) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  async checkAnswer(
    userId: string,
    quoteId: string,
    selectedAuthorId: string,
  ) {
    if (!Types.ObjectId.isValid(quoteId)) {
      throw new BadRequestException('Formato de ID inválido');
    }

    const cacheKey = `game_session_${userId}`;
    const session = await this.cacheManager.get<{ startTime: number, currentStreak: number }>(cacheKey);

    // Si no hay sesión o no tiene startTime, asumimos Time Out o Trampa
    if (!session || !session.startTime) {
      const user = await this.usersService.findById(userId);
      await this.cacheManager.del(cacheKey); // Limpiamos racha

      const quote = await this.quoteModel.findById(quoteId).exec();
      return {
        isCorrect: false,
        correctAuthorId: quote ? quote.authorId.toString() : null,
        pointsEarned: 0,
        newTotalScore: user ? user.totalPoints : 0,
        currentStreak: 0,
        message: '¡Se acabó el tiempo!',
      };
    }

    const elapsedTime = Date.now() - session.startTime;

    // Borramos el startTime para que no se pueda reutilizar en la misma pregunta, pero mantenemos la racha pendiente
    await this.cacheManager.set(cacheKey, { currentStreak: session.currentStreak }, 15000);

    const quote = await this.quoteModel.findById(quoteId).exec();
    if (!quote) {
      throw new NotFoundException('La frase solicitada no existe');
    }

    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const isCorrect = quote.authorId.toString() === selectedAuthorId;

    let pointsEarned = 0;
    let newStreak = session.currentStreak || 0;

    if (isCorrect) {
      newStreak += 1;

      // Calculamos tiempo restante real basado en 10s máximo
      const timeLeftReal = Math.max(0, 10000 - elapsedTime);
      const isSpeedBonus = timeLeftReal >= 8000;
      
      let activeMultiplier = 1;
      if (newStreak >= 3 || isSpeedBonus) {
        activeMultiplier = 2;
      }

      pointsEarned = 10 * activeMultiplier;
      user.totalPoints = (user.totalPoints || 0) + pointsEarned;
      
      await user.save();
      await this.cacheManager.set(cacheKey, { currentStreak: newStreak }, 15000);
    } else {
      newStreak = 0;
      await this.cacheManager.del(cacheKey); // Borramos racha
    }

    return {
      isCorrect,
      correctAuthorId: quote.authorId.toString(),
      pointsEarned,
      newTotalScore: user.totalPoints,
      currentStreak: newStreak,
    };
  }
}

/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Quote } from '../quotes/schemas/quote.schema';
import { Author } from '../quotes/schemas/author.schema';

@Injectable()
export class GameService {
  constructor(
    @InjectModel(Quote.name) private quoteModel: Model<Quote>,
    @InjectModel(Author.name) private authorModel: Model<Author>,
  ) {}

  async generateRound(categoryId: string) {
    // 1. Validamos que el ID sea un ObjectId válido de Mongo
    if (!Types.ObjectId.isValid(categoryId)) {
      throw new NotFoundException('Categoría no válida');
    }

    // 2. El Aggregation Pipeline
    const questions = await this.quoteModel.aggregate([
      // Paso A: Filtramos las frases por la categoría elegida
      { $match: { categoryId: new Types.ObjectId(categoryId) } },

      // Paso B: Agarramos 10 frases al azar ($sample es el rey acá)
      { $sample: { size: 10 } },

      // Paso C: Traemos los datos del autor real
      {
        $lookup: {
          from: 'game_authors', // Nombre de la colección en la BD
          localField: 'authorId',
          foreignField: '_id',
          as: 'correctAuthor',
        },
      },

      // Paso D: Como $lookup devuelve un array, lo desarmamos para que sea un objeto
      { $unwind: '$correctAuthor' },

      // Paso E: El truco maestro. Buscamos 3 autores al azar que NO sean el autor real
      {
        $lookup: {
          from: 'game_authors',
          let: { realAuthorId: '$authorId' }, // Definimos una variable temporal
          pipeline: [
            // Filtramos para que el ID del distractor no sea igual al realAuthorId
            { $match: { $expr: { $ne: ['$_id', '$$realAuthorId'] } } },
            // Agarramos 3 al azar
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

    // 3. Formateamos la respuesta para el Frontend (y escondemos la respuesta correcta)
    return questions.map((q) => {
      // Unimos el autor real con los distractores
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

      return {
        quoteId: q._id,
        text: q.text,
        // Mezclamos el array para que la correcta no esté siempre primera
        options: this.shuffleArray(allOptions),
      };
    });
  }

  // Función auxiliar de Fisher-Yates para mezclar arrays de forma aleatoria perfecta
  private shuffleArray(array: any[]) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  async checkAnswer(quoteId: string, selectedAuthorId: string) {
    // 1. Validamos que nos manden IDs con formato correcto de Mongo
    if (
      !Types.ObjectId.isValid(quoteId) ||
      !Types.ObjectId.isValid(selectedAuthorId)
    ) {
      throw new BadRequestException('Formato de ID inválido');
    }

    // 2. Buscamos la frase original en la base de datos
    const quote = await this.quoteModel.findById(quoteId).exec();

    if (!quote) {
      throw new NotFoundException('La frase solicitada no existe');
    }

    // 3. Comparamos el autor real con el que eligió el jugador
    const isCorrect = quote.authorId.toString() === selectedAuthorId;

    // 4. Devolvemos el veredicto y el ID correcto (para que el frontend pinte el botón de verde/rojo)
    return {
      isCorrect,
      correctAuthorId: quote.authorId.toString(),
    };
  }
}

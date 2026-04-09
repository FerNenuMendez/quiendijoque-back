import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GameService } from './game.service';
import { GameController } from './game.controller';
import { Quote, QuoteSchema } from '../quotes/schemas/quote.schema';
import { Author, AuthorSchema } from '../quotes/schemas/author.schema';

@Module({
  imports: [
    // Registramos los esquemas en este módulo para que el GameService los pueda usar
    MongooseModule.forFeature([
      { name: Quote.name, schema: QuoteSchema },
      { name: Author.name, schema: AuthorSchema },
    ]),
  ],
  controllers: [GameController],
  providers: [GameService],
})
export class GameModule {}

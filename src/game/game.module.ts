import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GameService } from './game.service';
import { GameController } from './game.controller';
import { Quote, QuoteSchema } from '../quotes/schemas/quote.schema';
import { Author, AuthorSchema } from '../quotes/schemas/author.schema';
import { UsersModule } from '../users/users.module';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [
    CacheModule.register({
      ttl: 15000, // 15 segundos en milisegundos (NestJS v10+)
    }),
    MongooseModule.forFeature([
      { name: Quote.name, schema: QuoteSchema },
      { name: Author.name, schema: AuthorSchema },
    ]),
    UsersModule, // Inyectamos el módulo de usuarios para usar UsersService
  ],
  controllers: [GameController],
  providers: [GameService],
})
export class GameModule {}

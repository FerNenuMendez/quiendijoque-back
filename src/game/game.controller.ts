import { Controller, Get, Post, Body, Param, UseGuards, Req } from '@nestjs/common';
import type { Request } from 'express';
import { GameService } from './game.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiCookieAuth,
} from '@nestjs/swagger';
import { SubmitAnswerDto } from './dto/submit-answer.dto';

@ApiTags('Juego')
@ApiCookieAuth()
@Controller('game')
export class GameController {
  constructor(private readonly gameService: GameService) {}

  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Obtener una pregunta aleatoria y activar el temporizador en el servidor',
  })
  @ApiParam({
    name: 'categoryId',
    description: 'El ID de la categoría elegida',
    example: '65f1...',
  })
  @ApiResponse({
    status: 200,
    description: 'Pregunta generada con éxito.',
  })
  @Get('next-question/:categoryId')
  async getNextQuestion(
    @Param('categoryId') categoryId: string,
    @Req() req: Request,
  ) {
    const userId = (req.user as any).userId;
    const question = await this.gameService.getNextQuestion(userId, categoryId);
    return {
      message: 'Pregunta generada con éxito',
      question,
    };
  }

  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Validar la respuesta elegida por el jugador' })
  @ApiResponse({
    status: 200,
    description: 'Devuelve si acertó y cuál era el autor correcto.',
  })
  @Post('answer')
  async submitAnswer(
    @Body() submitAnswerDto: SubmitAnswerDto,
    @Req() req: Request,
  ) {
    const userId = (req.user as any).userId;
    return this.gameService.checkAnswer(
      userId,
      submitAnswerDto.quoteId,
      submitAnswerDto.selectedAuthorId,
    );
  }
}

import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
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
@ApiCookieAuth() // Cambiamos ApiBearerAuth por esto
@Controller('game')
export class GameController {
  constructor(private readonly gameService: GameService) {}

  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Generar una ronda de 10 preguntas para una categoría',
  })
  @ApiParam({
    name: 'categoryId',
    description: 'El ID de la categoría elegida',
    example: '65f1...',
  })
  @ApiResponse({
    status: 200,
    description: 'Ronda generada con las opciones mezcladas.',
  })
  @ApiResponse({
    status: 404,
    description: 'Categoría no válida o sin frases.',
  })
  @Get('round/:categoryId')
  async getRound(@Param('categoryId') categoryId: string) {
    const questions = await this.gameService.generateRound(categoryId);
    return {
      message: 'Ronda generada con éxito',
      totalQuestions: questions.length,
      questions,
    };
  }

  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Validar la respuesta elegida por el jugador' })
  @ApiResponse({
    status: 200,
    description: 'Devuelve si acertó y cuál era el autor correcto.',
  })
  @ApiResponse({
    status: 400,
    description: 'Faltan IDs o tienen formato inválido.',
  })
  @Post('answer')
  async submitAnswer(@Body() submitAnswerDto: SubmitAnswerDto) {
    // Usamos el DTO
    return this.gameService.checkAnswer(
      submitAnswerDto.quoteId,
      submitAnswerDto.selectedAuthorId,
    );
  }
}

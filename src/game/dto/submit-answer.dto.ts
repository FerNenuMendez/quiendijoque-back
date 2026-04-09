import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsNotEmpty } from 'class-validator';

export class SubmitAnswerDto {
  @ApiProperty({
    example: '65f1...abc',
    description: 'El ID de la frase que se está jugando',
  })
  @IsMongoId()
  @IsNotEmpty()
  quoteId: string;

  @ApiProperty({
    example: '65f1...def',
    description: 'El ID del autor que el usuario tocó',
  })
  @IsMongoId()
  @IsNotEmpty()
  selectedAuthorId: string;
}

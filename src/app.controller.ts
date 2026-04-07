import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
@ApiTags('Estado del Sistema')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @ApiOperation({ summary: 'Verificar que la API está online' })
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}

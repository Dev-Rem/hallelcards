import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { AppService } from './app.service';

@Controller('api/v1')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('hello')
  getHello(@Req() req: Request): string {
    console.log(req.headers);

    return this.appService.getHello();
  }
  @Post('hello/create')
  createHello(@Body() body: any): string {
    console.log(body);

    return 'Hello World Created';
  }
  @Get('hello/get')
  async getHello2(): Promise<any[]> {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return [{ id: 1, name: 'Hello World' }];
  }
}

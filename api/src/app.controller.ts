import { Controller, Get, HttpCode, Redirect } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('favicon.ico')
  @HttpCode(204)
  getFavicon(): void {
    return;
  }

  @Get('docs')
  @Redirect('/api/docs', 302)
  getDocs(): void {
    return;
  }

  @Get('reference')
  @Redirect('/api/reference', 302)
  getReference(): void {
    return;
  }
}

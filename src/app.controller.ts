import { Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get()
  tasks(): string {
    return this.appService.tasks();
  }

  @Get()
  taskQuery(): string {
    return this.appService.taskQuery();
  }

  @Post()
  text2Image(): string {
    return this.appService.text2Image();
  }

  @Post()
  img2Image(): string {
    return this.appService.img2Image();
  }
}

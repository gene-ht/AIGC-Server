import { Controller, Get, Post } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  getHello(): string {
    return this.userService.getHello();
  }

  @Get('login')
  async login() {
    return {
      token: await this.userService.getToken()
    };
  }

  @Get()
  getUser() {
    return this.userService.user({ id: 1 });
  }
}

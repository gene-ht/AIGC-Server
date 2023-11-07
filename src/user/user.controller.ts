import { Body, Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { PrismaService } from '@/common/prisma.service';
import { AuthGuard } from '@/auth.guard';
import { Response } from 'express';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService){}

  @Get('profile')
  @UseGuards(AuthGuard)
  async profile(@Req() req: Request & { user: any }) {
    const { password, ...user } = await this.userService.findOne({ id: req.user.sub })
    return {
      code: 0,
      data: user
    }
  }
  
  @Post('login')
  async login(@Res({ passthrough: true }) response: Response, @Body() body: { username: string; password: string }) {
    const { access_token } = await this.userService.signIn(body.username, body.password)
    response.cookie('access_token', access_token)
    return {
      code: 0,
      data: 'ok'
    }
  }

  @Post('register')
  async register(@Res({ passthrough: true }) response: Response, @Body() body: { username: string; password: string }) {
    const { access_token, errorMsg } = await this.userService.register(body.username, body.password)
    if (errorMsg) {
      return {
        code : -1,
        msg: errorMsg
      }
    }
    response.cookie('access_token', access_token)
    return {
      code: 0,
      data: 'ok'
    }
  }
}

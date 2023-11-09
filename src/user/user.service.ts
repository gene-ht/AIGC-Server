import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '@/common/prisma.service';
import { User, Prisma } from '@prisma/client';
import { md5Hash } from '@utils/tools/crypto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService, private readonly jwtService: JwtService) {}

  getHello(): string {
    return 'Hello World!';
  }

  login() {
    return {
      user: 'user',
      pwd: '123'
    }
  }

  // async findOne(username: string) {
  //   return this.prisma.user.findFirst({
  //     where: {
  //       name: username
  //     }
  //   })
  // }

  async findOne(
    postWhereUniqueInput: Prisma.UserWhereUniqueInput,
  ): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: postWhereUniqueInput,
    });
  }

  async users(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.UserWhereUniqueInput;
    where?: Prisma.UserWhereInput;
    orderBy?: Prisma.UserOrderByWithRelationInput;
  }): Promise<User[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.user.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
    });
  }

  async register(name: string, pwd: string) {
    const info = await this.prisma.user.findFirst({
      where: {
        name
      }
    })
    if (info) {
      return {
        errorMsg: 'user already exists.'
      }
    }

    const user = await this.prisma.user.create({
      data: {
        name,
        password: md5Hash(pwd),
      }
    })

    const payload = { username: user.name, sub: user.id }

    return {
      access_token: await this.jwtService.signAsync(payload)
    }
  }

  async signIn(name: string, pwd: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        name
      }
    })

    if (md5Hash(pwd) !== user?.password) {
      throw new UnauthorizedException()
    }

    const payload = { username: user.name, sub: user.id }

    return {
      access_token: await this.jwtService.signAsync(payload)
    }
  }
}

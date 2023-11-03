import { Module } from '@nestjs/common';
import { UserController } from '@/user/user.controller';
import { UserService } from '@/user/user.service';
import { PrismaService } from '@/common/prisma.service';
import { FetchService } from '@/common/fetch.service';

@Module({
  imports: [],
  controllers: [UserController],
  providers: [UserService, PrismaService, FetchService],
})
export class UserModule {}

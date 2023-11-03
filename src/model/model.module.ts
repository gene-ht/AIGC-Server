import { Module } from '@nestjs/common';
import { ModelController } from '@/model/model.controller';
import { ModelService } from '@/model/model.service';
import { PrismaService } from '@/common/prisma.service'
import { FetchService } from '@/common/fetch.service'

@Module({
  imports: [],
  controllers: [ModelController],
  providers: [ModelService, PrismaService, FetchService],
})
export class ModelModule {}

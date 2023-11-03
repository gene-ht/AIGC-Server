import { Module } from '@nestjs/common';
import { TaskController } from '@/task/task.controller';
import { TaskService } from '@/task/task.service';
import { PrismaService } from '@/common/prisma.service'
import { MediaService } from '@/common/media.service'
import { FetchService } from '@/common/fetch.service'

@Module({
  imports: [],
  controllers: [TaskController],
  providers: [TaskService, PrismaService, FetchService, MediaService],
})
export class TaskModule {}

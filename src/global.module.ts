import { Global, Module } from '@nestjs/common';

import { PrismaService } from '@/common/prisma.service'
import { WorkerService } from '@/common/worker.service'
import { MediaService } from '@/common/media.service'

@Global()
@Module({
  providers: [PrismaService, WorkerService, MediaService],
  exports: [PrismaService, WorkerService, MediaService]
})
export class GlobalModule {}

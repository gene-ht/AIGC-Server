import { Global, Module } from '@nestjs/common';

import { PrismaService } from '@/common/prisma.service'
import { FetchService } from '@/common/fetch.service'
import { MediaService } from '@/common/media.service'

@Global()
@Module({
  providers: [PrismaService, FetchService, MediaService],
  exports: [PrismaService, FetchService, MediaService]
})
export class GlobalModule {}

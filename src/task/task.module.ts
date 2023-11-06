import { Module } from '@nestjs/common';
import { TaskController } from '@/task/task.controller';
import { TaskService } from '@/task/task.service';
import { MulterModule } from '@nestjs/platform-express';
import * as path from 'path'

const dest = path.resolve(__dirname, '../../../_uploads')

@Module({
  imports: [MulterModule.register({
    dest
  })],
  controllers: [TaskController],
  providers: [TaskService],
  exports: [TaskService]
})
export class TaskModule {}

import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { UserModule } from '@/user/user.module'
import { ModelModule } from '@/model/model.module'
import { TaskModule } from '@/task/task.module'

@Module({
  imports: [UserModule, ModelModule, TaskModule],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}

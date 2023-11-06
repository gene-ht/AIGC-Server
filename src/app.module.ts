import { Global, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { UserModule } from '@/user/user.module'
import { ModelModule } from '@/model/model.module'
import { TaskModule } from '@/task/task.module'

import { GlobalModule } from './global.module';

@Module({
  imports: [UserModule, ModelModule, TaskModule, GlobalModule],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}

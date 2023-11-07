import { Global, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { UserModule } from '@/user/user.module'
import { ModelModule } from '@/model/model.module'
import { TaskModule } from '@/task/task.module'
import { AuthGuard } from './auth.guard'

import { GlobalModule } from './global.module';

@Module({
  imports: [UserModule, ModelModule, TaskModule, GlobalModule],
  controllers: [AppController],
  providers: [
    // global guards
    // {
    //   provide: APP_GUARD,
    //   useClass: AuthGuard,
    // }
  ],
})
export class AppModule {}
// export class AppModule implements NestModule {
//   configure(consumer: MiddlewareConsumer) {
//     consumer.apply(AuthMiddleware).forRoutes('/');
//   }
// }

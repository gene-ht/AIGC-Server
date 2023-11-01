import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  tasks(): string {
    return 'tasks';
  }

  taskQuery(): string {
    return 'taskQuery';
  }

  text2Image(): string {
    return 'text2Image';
  }

  img2Image(): string {
    return 'img2Image';
  }
}

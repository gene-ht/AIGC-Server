import { Test, TestingModule } from '@nestjs/testing';
import { TaskController } from '@/task/task.controller';
import { TaskService } from '@/task/task.service';

describe('taskController', () => {
  let taskController: TaskController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [TaskController],
      providers: [TaskService],
    }).compile();

    taskController = app.get<TaskController>(TaskController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(taskController.getHello()).toBe('Hello World!');
    });
  });
});

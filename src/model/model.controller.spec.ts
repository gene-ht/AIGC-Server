import { Test, TestingModule } from '@nestjs/testing';
import { ModelController } from '@/model/model.controller';
import { ModelService } from '@/model/model.service';

describe('ModelController', () => {
  let modelController: ModelController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [ModelController],
      providers: [ModelService],
    }).compile();

    modelController = app.get<ModelController>(ModelController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(modelController.getHello()).toBe('Hello World!');
    });
  });
});

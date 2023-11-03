import { Controller, Get, Post } from '@nestjs/common';
import { ModelService } from './model.service';

@Controller('model')
export class ModelController {
  constructor(private readonly modelService: ModelService) {}

  @Get('loras')
  getLoras() {
    return this.modelService.getLoras();
  }

  @Get('cn')
  getCNModels() {
    return this.modelService.getCNModels();
  }

  @Get('checkpoints')
  getCheckpoints() {
    return this.modelService.getCheckpoints();
  }

  @Get('upscalers')
  getUpscalers() {
    return this.modelService.getUpscalers();
  }

  @Get('samplers')
  getSamplers() {
    return this.modelService.getSamplers();
  }

  @Get('vaes')
  getVaes() {
    return this.modelService.getVaes();
  }

  @Get('hello')
  getHello(): string {
    return this.modelService.getHello();
  }

  @Get()
  getModel(): string {
    return this.modelService.getModel();
  }
}

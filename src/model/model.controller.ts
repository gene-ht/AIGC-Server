import { Query, Body, Controller, Get, Post } from '@nestjs/common';
import { ModelService } from './model.service';
import { SDOptions } from '@ctypes/sdapi';

@Controller('model')
export class ModelController {
  constructor(private readonly modelService: ModelService) {}

  @Get('loras')
  getLoras() {
    return this.modelService.getLoras();
  }

  // @Get('cn')
  // getCNModels() {
  //   return this.modelService.getCNModels();
  // }

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

  @Get('options')
  getOptions() {
    return this.modelService.getOptions();
  }

  @Post('options')
  updateOptions(@Body() payload: Partial<SDOptions>) {
    return this.modelService.updateOptions(payload)
  }

  @Get('hello')
  getHello(): string {
    return this.modelService.getHello();
  }

  @Get('list')
  async getModels() {
    return {
      code: 0,
      data: await this.modelService.getModels()
    }
  }

  @Get('query')
  async getModel(@Query() query: { id: number }) {
    return {
      code: 0,
      data: await this.modelService.getModel(query.id)
    }
  }
}

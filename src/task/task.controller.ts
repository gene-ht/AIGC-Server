import { Body, Controller, Get, Header, Post, Query, Res, StreamableFile, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { TaskService } from '@/task/task.service';

import { InputImg2ImgPayload, InputText2ImagePayload } from '@ctypes/sdapi';

@Controller('task')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Get('read')
  @Header('Content-Type', 'image/png')
  async read(@Query() query: { name: string }, @Res({ passthrough: true }) response: Response ): Promise<StreamableFile> {
    const stream = this.taskService.read(query.name)
    return new StreamableFile(stream)
  }

  // @Get('download')
  // download() {
  //   return this.taskService.download();
  // }

  @Get('list')
  async tasks(@Query() query: { pn: number; ps: number }) {
    return {
      code: 0,
      data: await this.taskService.tasks(query)
    }
  }

  @Get('query')
  taskQuery(@Query() query: { taskId: string }) {
    return this.taskService.taskQuery(query.taskId);
  }

  @Post('text2Image')
  text2Image(@Body() body: InputText2ImagePayload & { modelId: number }) {
    return this.taskService.text2Image(body, body.modelId);
  }

  @Post('img2Image')
  img2Image(@Body() body: InputImg2ImgPayload & { modelId: number }) {
    return this.taskService.img2Image(body, body.modelId);
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('image'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    console.log('---- file', file)
    const { path, filename } = file
    const newPath = `${path}.png`
    await this.taskService.renameFile(path, newPath)
    return {
      dest: `_uploads/${filename}.png`
    }
  }
}

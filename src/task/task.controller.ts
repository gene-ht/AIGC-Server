import { Req, UseGuards } from '@nestjs/common';
import { Body, Controller, Get, Header, Post, Query, Res, StreamableFile, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { TaskService } from '@/task/task.service';

import { InputImg2ImgPayload, InputText2ImagePayload } from '@ctypes/sdapi';
import { AuthGuard } from '@/auth.guard';

@Controller('task')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Get('read')
  @Header('Content-Type', 'image/png')
  @UseGuards(AuthGuard)
  async read(@Query() query: { name: string }, @Res({ passthrough: true }) response: Response ): Promise<StreamableFile> {
    const stream = this.taskService.read(query.name)
    return new StreamableFile(stream)
  }

  // @Get('download')
  // download() {
  //   return this.taskService.download();
  // }

  @Get('list')
  @UseGuards(AuthGuard)
  async tasks(@Req() req: Request & { user: any }, @Query() query: { pn: number; ps: number }) {
    return {
      code: 0,
      data: await this.taskService.tasks({ ...query, where: { userId: req.user.sub } })
    }
  }

  @Get('query')
  @UseGuards(AuthGuard)
  async taskQuery(@Query() query: { taskId: string }) {
    return {
      code: 0,
      data: await this.taskService.taskQuery(query.taskId)
    }
  }

  @Post('text2Image')
  @UseGuards(AuthGuard)
  async text2Image(@Req() req: Request & { user: any }, @Body() body: InputText2ImagePayload & { modelId: number }) {
    console.log('==== body', body)
    return {
      code: 0,
      data: await this.taskService.text2Image(body, body.modelId, req.user.sub)
    }
  }

  @Post('img2Image')
  @UseGuards(AuthGuard)
  async img2Image(@Req() req: Request & { user: any }, @Body() body: InputImg2ImgPayload & { modelId: number }) {
    return {
      code: 0,
      data: await this.taskService.img2Image(body, body.modelId, req.user.sub)
    }
  }

  @Post('upload')
  @UseGuards(AuthGuard)
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

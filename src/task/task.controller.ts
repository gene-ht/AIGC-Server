import { Body, Controller, Get, Header, Post, Query, Res, StreamableFile } from '@nestjs/common';
import { TaskService } from '@/task/task.service';

@Controller('task')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Get()
  getHello(): string {
    return this.taskService.getHello();
  }

  @Get('read')
  @Header('Content-Type', 'image/png')
  async read(@Query() query: { name: string }, @Res({ passthrough: true }) response: Response ): Promise<StreamableFile> {
    const stream = this.taskService.read(query.name)
    return new StreamableFile(stream)
  }

  @Get('download')
  download(): string {
    return this.taskService.download();
  }

  @Get('list')
  tasks() {
    return this.taskService.tasks({});
  }

  @Get('query')
  taskQuery(): string {
    return this.taskService.taskQuery();
  }

  @Post('text2Image')
  text2Image(@Body() body: { prompt: string }) {
    const { prompt } = body;
    return this.taskService.text2Image({ prompt });
  }

  @Post('img2Image')
  img2Image(): string {
    return this.taskService.img2Image();
  }
}

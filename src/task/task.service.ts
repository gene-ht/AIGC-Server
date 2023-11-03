import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/common/prisma.service'
import { MediaService } from '@/common/media.service'
import { FetchService } from '@/common/fetch.service'
import { Task, Prisma } from '@prisma/client';

@Injectable()
export class TaskService {
  constructor(private readonly prisma: PrismaService, private readonly fetch: FetchService, private readonly media: MediaService) {}

  getHello(): string {
    return 'Hello World!';
  }

  read(name: string) {
    return this.media.readFile(name)
  }

  download(): string {
    this.media.downloadFile('https://w.wallhaven.cc/full/jx/wallhaven-jxlrgq.png')
    return 'download';
  }

  taskQuery(): string {
    return 'taskQuery';
  }

  async text2Image(payload: Parameters<typeof this.fetch.text2img>[0]) {
    const { images, parameters, info } = await this.fetch.text2img(payload)
    const dest = await this.media.base64ToImageFile(images[0])
    console.log('--- dest', dest)
    return {
      images,
      parameters,
      info
    }
  }

  img2Image(): string {
    return 'img2Image';
  }

  async task(
    postWhereUniqueInput: Prisma.TaskWhereUniqueInput,
  ): Promise<Task | null> {
    return this.prisma.task.findUnique({
      where: postWhereUniqueInput,
    });
  }

  async tasks(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.TaskWhereUniqueInput;
    where?: Prisma.TaskWhereInput;
    orderBy?: Prisma.TaskOrderByWithRelationInput;
  }): Promise<Task[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.task.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
    });
  }

  async createTask(data: Prisma.TaskCreateInput): Promise<Task> {
    return this.prisma.task.create({
      data,
    });
  }

  async updateTask(params: {
    where: Prisma.TaskWhereUniqueInput;
    data: Prisma.TaskUpdateInput;
  }): Promise<Task> {
    const { data, where } = params;
    return this.prisma.task.update({
      data,
      where,
    });
  }

  async deleteTask(where: Prisma.TaskWhereUniqueInput): Promise<Task> {
    return this.prisma.task.delete({
      where,
    });
  }
}

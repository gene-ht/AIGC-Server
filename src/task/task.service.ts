import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/common/prisma.service'
import { MediaService } from '@/common/media.service'
import { FetchService } from '@/common/fetch.service'
import { ManagerService } from '@/common/manager.service'
import { Task, Prisma } from '@prisma/client';

import { FetchWroker, Status } from '@utils/sdapi/worker';
import { Customer } from '@utils/tools/customer';
import { Productor } from '@utils/tools/productor';

import { InputImg2ImgPayload, InputText2ImagePayload } from '@ctypes/sdapi';
import { TaskStatus } from '@ctypes/prisma';

@Injectable()
export class TaskService {
  constructor(private readonly prisma: PrismaService, private readonly fetch: FetchService,  private readonly media: MediaService) {
    this.init()
  }

  private async init() {
    this.fetch.productor.on('consume', async ({ key, workerId, progressInfo }) => {
      await this.prisma.task.update({
        where: {
          taskId: key
        },
        data: {
          status: TaskStatus.working,
          workerId,
          progressInfo
        }
      });
    })

    this.fetch.productor.on('success', async ({ key, result, value }) => {
      if (!result?.images) return
      
      const { parameters, info, progressInfo } = result
      const { all_prompts, all_seeds, all_subseeds, extra_generation_params } = info
      const dests = await this.uploadImages(result.images)
      const generations = all_prompts.map((prompt, index) => {
        return {
          prompt,
          image: dests[index].dest,
          seed: all_seeds[index],
          subseed: all_subseeds[index],
          lora: extra_generation_params['Lora hashes'],
        }
      })
      await this.prisma.task.update({
        where: {
          taskId: key
        },
        data: {
          status: TaskStatus.done,
          parameters: parameters,
          taskInfo: info,
          generations: {
            results: generations
          },
          progressInfo
        }
      });
    })

    await this.initWorkers()
  }

  private async initWorkers() {
    await Promise.all(this.fetch.workers.map(worker => worker.init()))
    const workersConfigurations = this.fetch.workers.map(worker => {
      return {
        id: worker.id,
        checkpoints: worker.SDCheckpoints
      }
    })

    // load all checkpoints to db
    await Promise.all(
      workersConfigurations.map(({ id, checkpoints }) => {
        return checkpoints.map(async checkpoint => {
          const model = await this.prisma.model.findFirst({
            where: {
              workerId: id,
              name: checkpoint.title
            }
          })
          if (model) {
            return this.prisma.model.update({
              where: {
                id: model.id
              },
              data: {
                info: checkpoint as any
              }
            })
          }

          return this.prisma.model.create({
            data: {
              workerId: id,
              name: checkpoint.title,
              info: checkpoint as any
            }
          })
        }).flat()
      })
    )
  }

  private async uploadImages(images: string[]) {
    const dests = await Promise.all(
      images.map(async image => {
        return this.media.base64ToImageFile(image)
      })
    )
    return dests
  }

  // private async initUsers() {
  //   const users = await this.prisma.user.findMany()
  //   if (users.length) return

  //   await this.prisma.user.create({
  //     data: {
  //       name: 'user',
  //       password: 'admin',
  //       role: 'admin'
  //     }
  //   })
  // }

  read(name: string) {
    console.log('- name', name)
    if (name.includes('_uploads')) return this.media.readUploadFile(name)
    return this.media.readFile(name)
  }

  download(): string {
    this.media.downloadFile('https://w.wallhaven.cc/full/jx/wallhaven-jxlrgq.png')
    return 'download';
  }

  async taskQuery(taskId: string) {
    const task = await this.prisma.task.findFirst({
      where: {
        taskId
      }
    })
    if (task.status === TaskStatus.working) {
      const workerId = task.workerId
      const worker = this.fetch.getWorker(workerId)
      if (worker.status.code !== Status.pending) return task
      const status = await worker.verifyStatus()
      return await this.prisma.task.update({
        where: {
          taskId
        },
        data: {
          progressInfo: status
        }
      })
    }
    return task
  }

  async text2Image(inputPayload: InputText2ImagePayload, modelId: number) {
    console.log('--- text2Image', modelId)
    const model = await this.prisma.model.findFirst({
      where: {
        id: Number(modelId)
      }
    })
    if (!model) {
      throw new Error('model not found')
    }
    const { taskId, mode, payload } = await this.fetch.text2img(inputPayload, model.name)
    const task = await this.prisma.task.create({
      data: {
        taskId,
        mode,
        modelId: model.id,
        status: TaskStatus.wating,
        payload
      }
    })
    return task
  }

  async img2Image(inputPayload: InputImg2ImgPayload, modelId: number) {
    const { init_images } = inputPayload
    const _init_images = await Promise.all(
      init_images.map(async image => {
        return this.media.readUploadFileBase64(image)
      })
    )
    inputPayload.init_images = _init_images

    const model = await this.prisma.model.findFirst({
      where: {
        id: Number(modelId)
      }
    })

    if (!model) {
      throw new Error('model not found')
    }

    const { taskId, mode, payload } = await this.fetch.img2img(inputPayload, model.name)
    const task = await this.prisma.task.create({
      data: {
        taskId,
        mode,
        modelId: model.id,
        status: TaskStatus.working,
        payload
      }
    })
    return task
  }

  async uploadFile(file: Express.Multer.File, workerId: string) {
    const worker = this.fetch.getWorker(workerId)
    worker.uploadFile(file)
  }

  async tasks(params: {
    pn: number
    ps: number
    cursor?: Prisma.TaskWhereUniqueInput;
    where?: Prisma.TaskWhereInput;
    orderBy?: Prisma.TaskOrderByWithRelationInput;
  }): Promise<{ list: Task[], total: number }> {
    const { pn = 1, ps = 10, cursor, where, orderBy } = params;
    const skip = Number((pn - 1) * params.ps)
    const take = Number(ps)
    return {
      list: await this.prisma.task.findMany({
        skip,
        take,
        cursor,
        where,
        orderBy: {
          id: 'desc'
        },
      }),
      total: await this.prisma.task.count({ where }),
    };
  }

  renameFile(oldPath: string, newPath: string) {
    return this.media.renameFile(oldPath, newPath)
  }
}

import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/common/prisma.service'
import { MediaService } from '@/common/media.service'
import { WorkerService } from '@/common/worker.service'
import { Task, Prisma } from '@prisma/client';

import { Status } from '@utils/sdapi/machine';

import { InputImg2ImgPayload, InputText2ImagePayload } from '@ctypes/sdapi';
import { TaskStatus } from '@ctypes/prisma';

@Injectable()
export class TaskService {
  constructor(private readonly prisma: PrismaService, private readonly worker: WorkerService,  private readonly media: MediaService) {
    this.init()
  }

  private async init() {
    // worker task customer
    this.worker.prefab.on('sub', async ({ key, payload, progressInfo }) => {
      await this.prisma.task.update({
        where: {
          taskId: key
        },
        data: {
          status: TaskStatus.working,
          machineId: payload.machineId,
          progressInfo
        }
      });
    })

    // db task procudor
    this.worker.product.on('pub', async ({ key, value }) => {
      this.worker.product.ack(key)
      const { taskId, result } = value
      if (!taskId || !result?.images) return
      
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
          taskId
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
    await Promise.all(this.worker.machines.map(machine => machine.init()))
    const workersConfigurations = this.worker.machines.map(worker => {
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
              machineId: id,
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
              machineId: id,
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
      const machineId = task.machineId
      const machine = this.worker.getMachine(machineId)
      if (machine.status.code !== Status.pending) return task
      const status = await machine.verifyStatus()
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

  async text2Image(inputPayload: InputText2ImagePayload, modelId: number, userId: number) {
    const model = await this.prisma.model.findFirst({
      where: {
        id: Number(modelId)
      }
    })
    if (!model) {
      throw new Error('model not found')
    }
    const { taskId, mode, payload } = await this.worker.text2img(inputPayload, model.name)
    const task = await this.prisma.task.create({
      data: {
        taskId,
        mode,
        modelId: model.id,
        userId: userId,
        status: TaskStatus.wating,
        payload
      }
    })
    return task
  }

  async img2Image(inputPayload: InputImg2ImgPayload, modelId: number, userId: number) {
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

    const { taskId, mode, payload } = await this.worker.img2img(inputPayload, model.name)
    const task = await this.prisma.task.create({
      data: {
        taskId,
        mode,
        modelId: model.id,
        userId: userId,
        status: TaskStatus.working,
        payload
      }
    })
    return task
  }

  async uploadFile(file: Express.Multer.File, machineId: string) {
    const worker = this.worker.getMachine(machineId)
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

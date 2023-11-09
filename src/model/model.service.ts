import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/common/prisma.service';
import { Model, Prisma } from '@prisma/client';
import { WorkerService } from '@/common/worker.service'
import { SDOptions } from '@ctypes/sdapi';

@Injectable()
export class ModelService {
  constructor(private readonly prisma: PrismaService, private readonly worker: WorkerService) {}

  getHello(): string {
    return 'Hello World!';
  }

  getOptions() {
    return this.worker.options()
  }

  updateOptions(payload?: Partial<SDOptions>) {
    return this.worker.options(payload)
  }

  getLoras() {
    return this.worker.loras();
  }

  // getCNModels() {
  //   return this.fetch.controlnet()
  // }

  getCheckpoints() {
    return this.worker.checkpoints()
  }

  getSamplers() {
    return this.worker.samplers()
  }

  getUpscalers() {
    return this.worker.upscalers()
  }

  getVaes() {
    return this.worker.vaes()
  }

  getModel(id: number) {
    return this.prisma.model.findUnique({
      where: {
        id: Number(id)
      }
    })
  }

  async getModels() {
    return {
      models: await this.prisma.model.findMany(),
      total: await this.prisma.model.count()
    }
  }

  async model(
    postWhereUniqueInput: Prisma.ModelWhereUniqueInput,
  ): Promise<Model | null> {
    return this.prisma.model.findUnique({
      where: postWhereUniqueInput,
    });
  }

  async models(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.ModelWhereUniqueInput;
    where?: Prisma.ModelWhereInput;
    orderBy?: Prisma.ModelOrderByWithRelationInput;
  }): Promise<Model[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.model.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
    });
  }

  async createModel(data: Prisma.ModelCreateInput): Promise<Model> {
    return this.prisma.model.create({
      data,
    });
  }

  async updateModel(params: {
    where: Prisma.ModelWhereUniqueInput;
    data: Prisma.ModelUpdateInput;
  }): Promise<Model> {
    const { data, where } = params;
    return this.prisma.model.update({
      data,
      where,
    });
  }

  async deleteModel(where: Prisma.ModelWhereUniqueInput): Promise<Model> {
    return this.prisma.model.delete({
      where,
    });
  }
}

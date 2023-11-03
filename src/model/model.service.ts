import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/common/prisma.service';
import { Model, Prisma } from '@prisma/client';
import { FetchService } from '@/common/fetch.service'

@Injectable()
export class ModelService {
  constructor(private readonly prisma: PrismaService, private readonly fetch: FetchService) {}

  getHello(): string {
    return 'Hello World!';
  }

  getLoras() {
    return this.fetch.loras();
  }

  getCNModels() {
    return this.fetch.controlnet()
  }

  getCheckpoints() {
    return this.fetch.checkpoints()
  }

  getSamplers() {
    return this.fetch.samplers()
  }

  getUpscalers() {
    return this.fetch.upscalers()
  }

  getVaes() {
    return this.fetch.vaes()
  }

  getModel(): string {
    return 'Hello World!';
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

import { InputImg2ImgPayload, InputText2ImagePayload, SDOptions, TaskMode } from '@ctypes/sdapi';
import { Injectable } from '@nestjs/common';

import { FetchWroker, Status } from '@utils/sdapi/worker';
import { Customer } from '@utils/tools/customer';
import { Productor } from '@utils/tools/productor';

import fetch from 'node-fetch';

const machines: { host: string; token: string }[] = [
  {
    host: process.env.SD_HOST1,
    token: process.env.SD_TOKEN1
  }
]

// const workers = machines.map(({ host, token }) => new FetchWroker(host, token))

// const customer = new Customer(workers)

// const productor = new Productor(customer)
// console.log('--- productor init')

export interface LoraInfo {
  name: string
  alias: string
  path: string
}

@Injectable()
export class FetchService {
  workers: FetchWroker[] = []
  customer: Customer
  productor: Productor
  constructor() {
    this.workers = machines.map(({ host, token }) => new FetchWroker(host, token))
    this.customer = new Customer(this.workers)
    this.productor = new Productor(this.customer)
  }

  // load(workers: FetchWroker[], productor: Productor) {
  //   this.workers = workers
  //   this.productor = productor
  // }

  async text2img(payload: InputText2ImagePayload) {
    const { key, value, workerId, checkpoint } = this.productor.create({
      mode: TaskMode.text2img,
      payload
    })
    console.log('--- fetch text2img ---', key, value, workerId, checkpoint)
    return {
      taskId: key,
      workerId,
      checkpoint,
      mode: value.mode,
      payload
    }
  }

  async img2img(payload: InputImg2ImgPayload) {
    const { key, value, workerId, checkpoint } = this.productor.create({
      mode: TaskMode.img2img,
      payload
    })
    return {
      taskId: key,
      workerId,
      checkpoint,
      mode: value.mode,
      payload
    }
  }

  async taskStatus(taskId: string) {
    // to do: get taskInfo from db
    const workerId = taskId
    return await this.getWorker(workerId)?.verifyStatus()
  }

  getIdleWorker() {
    return this.workers.find(w => w.status.code === Status.idle)
  }

  getWorker(workerId?: string) {
    if (!workerId) return this.workers[0]
    return this.workers.find(w => w.id === workerId)
  }

  // async getToken(): Promise<string> {
  //   if (accessToken) return accessToken
  //   const url = baseUrl + APIRoutes.login

  //   const loginRes = await fetch(url, {
  //     method: 'POST',
  //     headers: {
  //       'Content-Type': 'application/x-www-form-urlencoded',
  //     },
  //     body: 'grant_type=&username=gene&password=Gene969696&scope=&client_id=&client_secret=',
  //   });

  //   const loginData = await loginRes.json();
  //   if (!loginData.success) return null

  //   const tokenUrl = baseUrl + APIRoutes.getToken
  //   const tokenRes = await fetch(tokenUrl, {
  //     headers: {
  //       'Cookie': loginRes.headers.get('set-cookie')
  //     }
  //   })
  //   const tokenData = await tokenRes.json()
  //   accessToken = tokenData.token
  //   return tokenData;
  // }

  async checkpoints() {
    const result = await Promise.all(
      this.workers.map(async worker => {
        return worker.checkpoints()
      })
    )
    return result.flat()
  }

  async loras(): Promise<LoraInfo[]> {
    const result = await Promise.all(
      this.workers.map(async worker => {
        return worker.loras()
      })
    )
    return result.flat()
  }

  async upscalers() {
    const result = await Promise.all(
      this.workers.map(async worker => {
        return worker.upscalers()
      })
    )
    return result.flat()
  }

  async samplers() {
    const result = await Promise.all(
      this.workers.map(async worker => {
        return worker.samplers()
      })
    )
    return result.flat()
  }

  async vaes() {
    const result = await Promise.all(
      this.workers.map(async worker => {
        return worker.vaes()
      })
    )
    return result.flat()
  }

  async options(payload?: Partial<SDOptions>, workerId?: string) {
    return await this.getWorker(workerId)?.options(payload)
  }
}

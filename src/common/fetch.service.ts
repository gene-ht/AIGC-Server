import { InputImg2ImgPayload, InputText2ImagePayload, SDOptions, TaskMode } from '@ctypes/sdapi';
import { Injectable } from '@nestjs/common';

import { FetchWroker, Status } from '@utils/sdapi/worker';
import { ProductorCustomer } from '@utils/tools/productor-customer';


interface WorkerValue {
  mode: TaskMode,
  payload: InputText2ImagePayload | InputImg2ImgPayload
  checkpoint: string
}

interface DBValue {
  taskId: string
  result: any
}

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
  workerPC: ProductorCustomer<WorkerValue>
  dbPC: ProductorCustomer<DBValue>
  constructor() {
    this.workers = machines.map(({ host, token }) => new FetchWroker(host, token))
    this.workerPC = new ProductorCustomer<WorkerValue>()
    this.dbPC = new ProductorCustomer<DBValue>()

    // worker task procudor
    this.workerPC.on('pub', async ({ key, value }) => {
      if (!this.idleWorker) return
      // free worker, send task to worker; ack worker task
      this.workerPC.ack(key, { workerId: this.idleWorker.id, progressInfo: await this.idleWorker.verifyStatus() })
      const { mode, payload, checkpoint } = value
      await this.idleWorker.switchCheckpoint(checkpoint)

      this.idleWorker[mode === TaskMode.text2img ? 'text2img' : 'img2img'](payload)
        .then(res => {
          // worker finished, send result to db procudor
          this.dbPC.insert({
            taskId: key,
            result: res
          })
        })
    })
  }

  // load(workers: FetchWroker[], productor: Productor) {
  //   this.workers = workers
  //   this.productor = productor
  // }

  get idleWorker() {
    return this.workers.find(w => w.status.code === Status.idle)
  }

  async text2img(payload: InputText2ImagePayload, checkpoint: string) {
    const mode = TaskMode.text2img
    const { key } = this.workerPC.insert({
      mode,
      payload,
      checkpoint
    })
    return {
      taskId: key,
      // workerId,
      // checkpoint,
      mode,
      payload
    }
  }

  async img2img(payload: InputImg2ImgPayload, checkpoint: string) {
    const mode = TaskMode.img2img
    const { key } = this.workerPC.insert({
      mode,
      payload,
      checkpoint
    })
    return {
      taskId: key,
      // workerId,
      // checkpoint,
      mode,
      payload
    }
  }

  async taskStatus(taskId: string) {
    // to do: get taskInfo from db
    const workerId = taskId
    return await this.getWorker(workerId)?.verifyStatus()
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

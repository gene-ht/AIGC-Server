import { InputImg2ImgPayload, InputText2ImagePayload, SDOptions, TaskMode } from '@ctypes/sdapi';
import { Injectable } from '@nestjs/common';

import { SDMachine, Status } from '@utils/sdapi/machine';
import { ProductorCustomer } from '@utils/tools/productor-customer';


interface PrefabValue {
  mode: TaskMode,
  payload: InputText2ImagePayload | InputImg2ImgPayload
  checkpoint: string
}

interface ProductValue {
  taskId: string
  result: any
}

const machines: { host: string; token: string }[] = [
  {
    host: process.env.SD_HOST1,
    token: process.env.SD_TOKEN1
  }
]

export interface LoraInfo {
  name: string
  alias: string
  path: string
}

@Injectable()
export class WorkerService {
  machines: SDMachine[] = []
  prefab: ProductorCustomer<PrefabValue>
  product: ProductorCustomer<ProductValue>
  constructor() {
    this.machines = machines.map(({ host, token }) => new SDMachine(host, token))
    this.prefab = new ProductorCustomer<PrefabValue>()
    this.product = new ProductorCustomer<ProductValue>()

    // worker task procudor
    this.prefab.on('pub', async ({ key, value }) => {
      console.log('-- worker task pub', key, Date.now())
      const idleMachine = this.idleMachine
      if (!idleMachine) return
      console.log('-- machine', idleMachine.id, Date.now())
      // free worker, send task to worker; ack worker task
      this.prefab.ack(key, { machineId: idleMachine.id, progressInfo: await idleMachine.verifyStatus() })
      const { mode, payload, checkpoint } = value
      await idleMachine.switchCheckpoint(checkpoint)

      // execute the task
      idleMachine[mode === TaskMode.text2img ? 'text2img' : 'img2img'](payload)
        .then(res => {
          console.log('-- worker task done', key, Date.now())
          // worker finished, send result to db procudor
          this.product.insert({
            taskId: key,
            result: res
          })
        })
    })
  }

  // load(workers: SDMachine[], productor: Productor) {
  //   this.workers = workers
  //   this.productor = productor
  // }

  get idleMachine() {
    return this.machines.find(w => w.status.code === Status.idle)
  }

  async text2img(payload: InputText2ImagePayload, checkpoint: string) {
    const mode = TaskMode.text2img
    const { key } = this.prefab.insert({
      mode,
      payload,
      checkpoint
    })
    return {
      taskId: key,
      mode,
      payload
    }
  }

  async img2img(payload: InputImg2ImgPayload, checkpoint: string) {
    const mode = TaskMode.img2img
    const { key } = this.prefab.insert({
      mode,
      payload,
      checkpoint
    })
    return {
      taskId: key,
      mode,
      payload
    }
  }

  getMachine(machineId?: string) {
    if (!machineId) return this.machines[0]
    return this.machines.find(m => m.id === machineId)
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
      this.machines.map(async machine => {
        return machine.checkpoints()
      })
    )
    return result.flat()
  }

  async loras(): Promise<LoraInfo[]> {
    const result = await Promise.all(
      this.machines.map(async machine => {
        return machine.loras()
      })
    )
    return result.flat()
  }

  async upscalers() {
    const result = await Promise.all(
      this.machines.map(async machine => {
        return machine.upscalers()
      })
    )
    return result.flat()
  }

  async samplers() {
    const result = await Promise.all(
      this.machines.map(async machine => {
        return machine.samplers()
      })
    )
    return result.flat()
  }

  async vaes() {
    const result = await Promise.all(
      this.machines.map(async machine => {
        return machine.vaes()
      })
    )
    return result.flat()
  }

  async options(payload?: Partial<SDOptions>, machineId?: string) {
    return await this.getMachine(machineId)?.options(payload)
  }
}

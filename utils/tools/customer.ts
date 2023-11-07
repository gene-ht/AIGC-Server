import { v4 as uuidv4 } from 'uuid'

import { EventEmitter } from 'events';
import { Productor } from '@utils/tools/productor';

import { InputImg2ImgPayload, InputText2ImagePayload, SDOptions, TaskMode } from '@ctypes/sdapi';
import { FetchWroker, Status } from '@utils/sdapi/worker';

enum CustomerStatus {
  idle = 0,
  working,
  locked,
}

interface CustomerValue {
  mode: TaskMode,
  payload: InputText2ImagePayload | InputImg2ImgPayload
  checkpoint: string
}

type CustomerInfo = {
  key: string,
  value: CustomerValue
}

export class Customer extends EventEmitter {
  status: CustomerStatus = CustomerStatus.idle
  private store = new Array<CustomerInfo>()
  constructor(private readonly workers: FetchWroker[]) {
    super()

    // loop check workers status
    setInterval(() => {
      const task = this.store.slice(0, 1)[0]
      if (!task) return
      this.consume(task.key)
    }, 1000)
  }

  private get(key: string) {
    return this.store.find(item => item.key === key)?.value
  }

  private set(key: string, value: CustomerValue) {
    this.store.push({ key, value })
  }

  private remove(key: string) {
    const index = this.store.findIndex(item => item.key === key)
    if (index !== -1) {
      this.store.splice(index, 1)
    }
  }

  create(key: string, value: CustomerValue) {
    if (this.status === CustomerStatus.locked) {
      throw new Error('Customer is locked!')
    }
    this.set(key, value)
    return this.consume(key)
  }

  async consume(key: string) {
    const idleWorker = this.workers.find(w => w.status.code === Status.idle)

    // if no idle worker, return
    if (!idleWorker) return
    const { mode, payload, checkpoint } = this.get(key)

    // switch checkpoint
    await idleWorker.switchCheckpoint(checkpoint)

    // consume task
    if (mode === TaskMode.text2img) {
      idleWorker.text2img(payload)
        .then(res => {
          this.emit('consumed', key, res)
          this.remove(key)
        })
        .catch(err => {
          this.emit('failed', key, err)
          this.remove(key)
        })
    }
    if (mode === TaskMode.img2img) {
      idleWorker.img2img(payload as InputImg2ImgPayload)
        .then(res => {
          this.emit('consumed', key, res)
          this.remove(key)
        })
        .catch(err => {
          this.emit('failed', key, err)
          this.remove(key)
        })
    }

    setTimeout(async () => {
      this.emit('consume', key, idleWorker.id, await idleWorker.verifyStatus())
    }, 100)
  }
}
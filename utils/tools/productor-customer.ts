import { v4 as uuidv4 } from 'uuid'
import { EventEmitter } from 'events';

import { InputImg2ImgPayload, InputText2ImagePayload, TaskMode } from '@ctypes/sdapi';

enum ProductorCustomerStatus {
  idle = 0,
  working,
  locked,
}

interface WorkerValue {
  mode: TaskMode,
  payload: InputText2ImagePayload | InputImg2ImgPayload
  checkpoint: string
}

type ProductorCustomerInfo<T = string> = {
  key: string,
  value: T
}

export class ProductorCustomer<T = string> extends EventEmitter {
  status: ProductorCustomerStatus = ProductorCustomerStatus.idle
  private store = new Array<ProductorCustomerInfo<T>>()
  constructor() {
    super()

    // loop check queue status
    setInterval(() => {
      this.vindicator()
    }, 1000)
  }

  private get(key: string) {
    return this.store.find(item => item.key === key)?.value
  }

  private set(key: string, value: T) {
    this.store.push({ key, value })
  }

  private remove(key: string) {
    const index = this.store.findIndex(item => item.key === key)
    if (index !== -1) {
      this.store.splice(index, 1)
    }
  }

  // insert task in queue
  insert(value: T) {
    if (this.status === ProductorCustomerStatus.locked) {
      throw new Error('ProductorCustomer is locked!')
    }
    const key: string = uuidv4()
    this.set(key, value)
    return {
      key,
      value
    }
  }

  // consume task
  ack(key: string, payload?: Record<string, any>) {
    const value = this.get(key)
    this.emit('sub', { key, value, payload })
    this.remove(key)
  }

  // verify
  vindicator() {
    const task = this.store.slice(0, 1)[0]
    if (!task) return false
    this.emit('pub', task)
    return true
  }
}
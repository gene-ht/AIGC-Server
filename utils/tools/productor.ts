import { v4 as uuidv4 } from 'uuid'
import { EventEmitter } from 'events';

import { Customer } from '@utils/tools/customer';
import { FetchWroker } from '@utils/sdapi/worker';
import { InputImg2ImgPayload, InputText2ImagePayload, TaskMode } from '@ctypes/sdapi';

enum ProductorStatus {
  idle = 0,
  working,
  locked,
}

interface ProductorValue {
  mode: TaskMode,
  payload: InputText2ImagePayload | InputImg2ImgPayload
  checkpoint: string
}

type ProductorInfo = {
  key: string,
  value: ProductorValue
}

export class Productor extends EventEmitter {
  status: ProductorStatus = ProductorStatus.idle
  private store = new Array<ProductorInfo>()
  constructor(private readonly customer: Customer) {
    super()

    this.customer.on('consume', (key, workerId, progressInfo) => {
      console.log('------ consume', key, workerId)
      const value = this.get(key)
      if (!value) return
      this.emit('consume', {
        key,
        value,
        workerId,
        progressInfo
      })
    })
    // customer consumed event
    this.customer.on('consumed', (key, result) => {
      console.log('------ consumed', key)
      const value = this.get(key)

      // emit task success event
      this.emit('success', {
        key,
        result,
        value
      })
      this.remove(key)
    })
  }

  private get(key: string) {
    return this.store.find(item => item.key === key)?.value
  }

  private set(key: string, value: ProductorValue) {
    this.store.push({ key, value })
  }

  private remove(key: string) {
    const index = this.store.findIndex(item => item.key === key)
    if (index !== -1) {
      this.store.splice(index, 1)
    }
  }

  loadConfigurations() {

  }

  create(value: ProductorValue) {
    if (this.status === ProductorStatus.locked) {
      throw new Error('Productor is locked!')
    }
    const key: string = uuidv4()
    this.set(key, value)
    this.customer.create(key, value)
    return {
      key,
      value,
    }
  }

  queue() {
    return this.store
  }
}
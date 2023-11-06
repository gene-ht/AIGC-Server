import { Injectable } from '@nestjs/common';

import { FetchWroker, Status } from '@utils/sdapi/worker';
import { Customer } from '@utils/tools/customer';
import { Productor } from '@utils/tools/productor';

const machines: { host: string; token: string }[] = [
  {
    host: process.env.SD_HOST1,
    token: process.env.SD_TOKEN1
  }
]

@Injectable()
export class ManagerService {
  workers: FetchWroker[] = []
  customer: Customer
  productor: Productor

  constructor() {
    this.workers = machines.map(({ host, token }) => new FetchWroker(host, token))
    this.customer = new Customer(this.workers)
    this.productor = new Productor(this.customer)
  }
}
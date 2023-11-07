import { LoraInfo } from '@/common/fetch.service';
import fetch from 'node-fetch';
import { createHash } from 'crypto';
import { InputText2ImagePayload, Text2ImageResponse, InputImg2ImgPayload, Img2ImgResponse, ProgressInfo, SDCheckpoint, SDOptions } from '@ctypes/sdapi';
import { getText2ImagePayload } from './text2img';
import { getImg2ImgPayload } from './img2img';
import * as fs from 'fs';
import * as FormData from 'form-data';
import { md5Hash } from '@utils/tools/crypto'

enum APIRoutes {
  login = '/login',
  getToken = '/token',
  checkpoints = '/sdapi/v1/sd-models',
  loras = '/sdapi/v1/loras',
  refreshLoras = '/sdapi/v1/refresh-loras',
  upscalers = '/sdapi/v1/upscalers',
  samplers = '/sdapi/v1/samplers',
  vaes = '/sdapi/v1/sd-vae',
  options = '/sdapi/v1/options',
  text2Image = '/sdapi/v1/txt2img',
  img2img = '/sdapi/v1/img2img',
  progress = '/sdapi/v1/progress?skip_current_image=true',
  cnVersion = '/controlnet/version',
  cnModels = '/controlnet/model_list',
  cnTypes = '/controlnet/control_types',
  upload = '/upload',
}

export enum Status {
  idle = 0,
  pending = 1,
  done = 2,
  failed = 3,
  upgrading = 4,
  loading = 5,
}

const fetchProxyFactory = (host: string, token: string) => {
  return async <T = any>(path: string, body = undefined, init?: RequestInit): Promise<T> => {
    const url = host + path
    return fetch(url, {
      method: init?.method ?? 'GET',
      headers: {
        'Content-type': 'application/json',
        'Authorization': `Basic ${token}`,
        'Cookie': `access-token-unsecure=${'vaJVjqQWiYrGfA1ducCoVA'}; access-token=${'vaJVjqQWiYrGfA1ducCoVA'}`,
        ...init?.headers as any,
      },
      body
    }).then(d => d.json())
  }
}

export class FetchWroker {
  private fetch: any
  public id: string
  public status: {
    code: Status
    job: ProgressInfo['state']['job']
    progress: number
    currentStep: number
    totalSteps: number
    timestamp: number
  } = {
    code: Status.loading,
    job: 'scripts_txt2img',
    progress: 0,
    currentStep: 0,
    totalSteps: 0,
    timestamp: 0,
  }
  public SDConfigurations: SDOptions
  public SDCheckpoints: SDCheckpoint[]
  constructor(private readonly host: string, private readonly token: string) {
    this.id = md5Hash(host)
    this.fetch = fetchProxyFactory(this.host, this.token)
  }

  get currentCheckpoint() {
    return this.SDCheckpoints?.find(c => c.title === this.SDConfigurations.sd_model_checkpoint)
  }

  async init() {
    await this.checkpoints()
    await this.options()

    this.status.code = Status.idle
    console.log('--- init worker', this.status.code)

    // progress loop check
    setInterval(() => this.verifyStatus(), 5000)
  }

  private upgrade(done = false) {
    if (this.status.code !== Status.idle) return false
    this.status.code = done ? Status.idle : Status.upgrading
  }

  async verifyStatus() {
    const { progress, state } = await this.progress()
    const { job_count, sampling_step } = state

    const verifyCode = () => {
      console.log('=========== verify code', progress, sampling_step, job_count)
      if (!progress && !sampling_step && !job_count) return Status.idle
      if (state.interrupted) return Status.failed
      if (progress === 100) return Status.done
      return Status.pending
    }
    
    this.status = {
      code: verifyCode(),
      job: state.job,
      progress,
      currentStep: state.sampling_step,
      totalSteps: state.sampling_steps,
      timestamp: Number(state.job_timestamp),
    }
    return this.status
  }

  // task progress info
  private async progress(): Promise<ProgressInfo> {
    return this.fetch(APIRoutes.progress)
  }

  // text2img task
  async text2img(payload: InputText2ImagePayload): Promise<Text2ImageResponse & { checkpoint: SDCheckpoint; progressInfo: any }> {
    this.status.code = Status.pending
    this.status = {
      ...this.status,
      code: Status.pending,
      job: 'scripts_txt2img'
    }
    const res: Text2ImageResponse<string> = await this.fetch(APIRoutes.text2Image, JSON.stringify(getText2ImagePayload(payload)), { method: 'POST' })
    const { images, parameters, info } = res
    this.status.code = Status.idle

    const _info = JSON.parse(info || '{}')
    return {
      checkpoint: this.currentCheckpoint,
      images,
      parameters,
      info: _info,
      progressInfo: {
        code: Status.done,
        job: 'scripts_txt2img',
        progress: 100,
        currentStep: parameters.steps,
        totalSteps: parameters.steps,
        timestamp: _info.job_timestamp,
      }
    }
  }

  // img2img task
  async img2img(payload: InputImg2ImgPayload): Promise<Img2ImgResponse & { checkpoint: SDCheckpoint; progressInfo: any }> {
    this.status.code = Status.pending
    this.status = {
      ...this.status,
      code: Status.pending,
      job: 'scripts_img2img'
    }
    try {
      const res: Img2ImgResponse<string> = await this.fetch(APIRoutes.img2img, JSON.stringify(getImg2ImgPayload(payload)), { method: 'POST' })
      const { images, parameters, info } = res
      this.status.code = Status.idle
      const _info = JSON.parse(info || '{}')
      return {
        checkpoint: this.currentCheckpoint,
        images,
        parameters,
        info: _info,
        progressInfo: {
          code: Status.done,
          job: 'scripts_img2img',
          progress: 100,
          currentStep: parameters.steps,
          totalSteps: parameters.steps,
          timestamp: _info.job_timestamp,
        }
      }
    } catch (err) {
      this.status.code = Status.idle
      throw err
    }
  }

  // all checkpoints
  async checkpoints() {
    const checkpoints: SDCheckpoint[] = await this.fetch(APIRoutes.checkpoints)
    this.SDCheckpoints = checkpoints
    return checkpoints
  }

  // all loras
  async loras(): Promise<LoraInfo[]> {
    return this.fetch(APIRoutes.loras);
  }

  // async refreshLoras() {
  //   return this.fetch(APIRoutes.refreshLoras);
  // }

  // all upscalers
  async upscalers() {
    return await this.fetch(APIRoutes.upscalers)
  }

  // all samples
  async samplers() {
    return await this.fetch(APIRoutes.samplers)
  }

  // all vaes
  async vaes() {
    return await this.fetch(APIRoutes.vaes)
  }

  async switchCheckpoint(checkpoint: string) {
    if (this.currentCheckpoint.title === checkpoint) return
    return this.options({ sd_model_checkpoint: checkpoint })
  }

  async options(payload?: Partial<SDOptions>) {
    const options: SDOptions = await this.fetch(APIRoutes.options)
    if (payload) {
      try {
        // upgrade SDConfigurations
        const runing = this.upgrade()
        if (runing) {
          throw new Error('Machine is runing, can‘t upgrade now!')
        }
        const _options = { ...options, ...payload }
        await this.fetch(APIRoutes.options, JSON.stringify(_options), { method: 'POST' })
        this.SDConfigurations = _options
        // upgrade success
        this.upgrade(true)
        return _options
      } catch(e) {
        this.status.code = Status.idle
        return options
      }
    }
    this.SDConfigurations = options
    return options
  }

  async controlnet() {
    const { version } = await this.fetch(APIRoutes.cnVersion)
    const { model_list } = await this.fetch(APIRoutes.cnModels)
    const { control_types } = await this.fetch(APIRoutes.cnTypes)
    return {
      version,
      models: model_list,
      controlTypes: control_types
    }
  }

  async uploadFile(file: Express.Multer.File) {
    console.log('- file', file)

    const path = '/Users/zzboy/myFile/AIGC/projects/AIGC-Server/_uploads/7c82e588e80f109bd083c6f5326442df.png'
    const stats = fs.statSync(path)
    const fileSizeInBytes = stats.size
    const fileStream = fs.createReadStream(path)
    const buffer = fs.readFileSync(path)

    const formData = new FormData()
    formData.append('files', fileStream, { knownLength: fileSizeInBytes })
    console.log('- formData', formData)
    // const blob = new Blob([buffer], { type: 'image/png' })
    // formData.append('files', blob, 'ea4c85d0ca6dec09728b9712133b65aa.png')
    // console.log('- formData', new URLSearchParams(formData as any))
    // const res = await this.fetch(APIRoutes.upload, readStream, { method: 'POST' })
    const res = await fetch(`http://101.34.66.220:7860/${APIRoutes.upload}`, {
      method: 'POST',
      headers: {
        'Cookie': `access-token-unsecure=${'vaJVjqQWiYrGfA1ducCoVA'}; access-token=${'vaJVjqQWiYrGfA1ducCoVA'}`,
        'Content-Type': 'multipart/form-data; boundary=----WebKitFormBoundaryo0zPicY0YkH4YwAH'
      },
      body: formData
    }).then(d => d.json())
    console.log(res)
    return res
  }
}
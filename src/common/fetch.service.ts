import { Injectable } from '@nestjs/common';

import { Text2ImagePayload, ActivedText2ImagePayload, Text2ImageResponse } from '@ctypes/sdapi'
import { getText2ImagePayload } from '@utils/sdapi'

import fetch from 'node-fetch';

let accessToken = process.env.SD_TOKEN

const baseUrl = process.env.SD_HOST

enum APIRoutes {
  login = '/login',
  getToken = '/token',
  checkpoints = '/sdapi/v1/sd-models',
  loras = '/sdapi/v1/loras',
  refreshLoras = '/sdapi/v1/refresh-loras',
  text2Image = '/sdapi/v1/txt2img',
  upscalers = '/sdapi/v1/upscalers',
  samplers = '/sdapi/v1/samplers',
  vaes = '/sdapi/v1/sd-vae',
  cnVersion = '/controlnet/version',
  cnModels = '/controlnet/model_list',
  cnTypes = '/controlnet/control_types',
}

const fetchProxy = <T = any>(path: string, body = undefined, init?: RequestInit): Promise<T> => {
  const url = baseUrl + path
  return fetch(url, {
    method: init?.method ?? 'GET',
    headers: {
      'Content-type': 'application/json',
      'Authorization': `Basic ${accessToken}`,
      ...init?.headers as any,
    },
    body
  }).then(d => d.json())
}

export interface LoraInfo {
  name: string
  alias: string
  path: string
}

@Injectable()
export class FetchService {

  async getToken(): Promise<string> {
    if (accessToken) return accessToken
    const url = baseUrl + APIRoutes.login

    const loginRes = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=&username=gene&password=Gene969696&scope=&client_id=&client_secret=',
    });

    const loginData = await loginRes.json();
    if (!loginData.success) return null

    const tokenUrl = baseUrl + APIRoutes.getToken
    const tokenRes = await fetch(tokenUrl, {
      headers: {
        'Cookie': loginRes.headers.get('set-cookie')
      }
    })
    const tokenData = await tokenRes.json()
    accessToken = tokenData.token
    return tokenData;
  }

  async checkpoints() {
    return fetchProxy(APIRoutes.checkpoints);
  }

  async loras(): Promise<LoraInfo[]> {
    return fetchProxy(APIRoutes.loras);
  }

  async refreshLoras() {
    return fetchProxy(APIRoutes.refreshLoras);
  }

  async controlnet() {
    const { version } = await fetchProxy<{ version: string }>(APIRoutes.cnVersion)
    const { model_list } = await fetchProxy<{ model_list: string[] }>(APIRoutes.cnModels)
    const { control_types } = await fetchProxy<{ control_types: string[] }>(APIRoutes.cnTypes)
    return {
      version,
      models: model_list,
      controlTypes: control_types
    }
  }

  async upscalers() {
    return await fetchProxy(APIRoutes.upscalers)
  }

  async samplers() {
    return await fetchProxy(APIRoutes.samplers)
  }

  async vaes() {
    return await fetchProxy(APIRoutes.vaes)
  }

  async text2img(payload: Partial<Text2ImagePayload> & ActivedText2ImagePayload): Promise<Text2ImageResponse> {
    const res: Text2ImageResponse<string> = await fetchProxy(APIRoutes.text2Image, JSON.stringify(getText2ImagePayload(payload)), { method: 'POST' })
    const { images, parameters, info } = res
    return {
      images,
      parameters,
      info: JSON.parse(info)
    }
  }

  async post() {
    const url = 'https://jsonplaceholder.typicode.com/todos/1';
    const res = await fetch(url, { method: 'POST' });
    const json = await res.json();
    return json;
  }
}

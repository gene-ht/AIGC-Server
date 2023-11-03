import { Injectable } from '@nestjs/common';
import * as fs from 'fs'
import { mkdir, writeFile } from 'fs/promises'
// import { Readable } from 'stream'
import { finished } from 'stream/promises'
import * as path from 'path'
import fetch from 'node-fetch'

const folder = path.resolve(__dirname, '../../downloads')

@Injectable()
export class MediaService {

  readFile(dest: string) {
    const stream = fs.createReadStream(path.resolve(folder, dest))
    return stream
  }

  async base64ToImageFile(base64: string) {
    const base64Data = base64.replace(/^data:image\/\w+;base64,/, '')
    const buffer = Buffer.from(base64Data, 'base64')
    console.log('- buffer', buffer)
    const dest = path.resolve(folder, `${Date.now() + Math.ceil(Math.random() * 10000000)}.png`)
    console.log('- dest', dest)
    // const file = fs.openSync(dest, 'w')
    fs.writeFile(dest, buffer, () => {
      // console.log('--- err', err)
      // console.log('--- data', data)
      console.log('----- done', dest)
    })
    // await writeFile(dest, buffer, { flag: 'wx' })
    // fs.closeSync(file)

    return dest
  }

  async downloadFile(url: string) {
    const res = await fetch(url)
    if (!fs.existsSync(folder)) {
      await mkdir(folder)
    }
    const dest = path.resolve(folder, path.basename(url))
    const fileStream = fs.createWriteStream(dest, { flags: 'wx' })
    await finished(res.body.pipe(fileStream))

    return dest
  }
}
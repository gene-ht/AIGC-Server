import { Injectable } from '@nestjs/common';
import * as fs from 'fs'
import { mkdir, rename } from 'fs/promises'
// import { Readable } from 'stream'
import { finished } from 'stream/promises'
import * as path from 'path'
import fetch from 'node-fetch'

const folder = path.resolve(__dirname, '../../../downloads')
const uploadFolder = path.resolve(__dirname, '../../../_uploads')

@Injectable()
export class MediaService {

  readFile(dest: string) {
    const stream = fs.createReadStream(path.resolve(folder, dest))
    return stream
  }

  readUploadFile(url: string) {
    const dest = path.resolve(uploadFolder, '../', url)
    const stream = fs.createReadStream(path.resolve(dest))
    return stream
  }

  async base64ToImageFile(base64: string): Promise<{ dest: string }> {
    const base64Data = base64.replace(/^data:image\/\w+;base64,/, '')
    const buffer = Buffer.from(base64Data, 'base64')
    const filename = `${Date.now() + Math.ceil(Math.random() * 10000000)}.png`
    const dest = path.resolve(folder, filename)

    return new Promise((resolve) => {
      fs.writeFile(dest, buffer, () => {
        resolve({
          dest: filename,
        })
      })
    })
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

  async readUploadFileBase64(url: string) {
    const dest = path.resolve(uploadFolder, '../', url)
    const base64 = fs.readFileSync(dest).toString('base64')
    return base64
  }

  async renameFile(oldPath: string, newPath: string) {
    return rename(oldPath, newPath)
  }
}
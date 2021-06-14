import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'
import { Service } from '../base/service'

export class ConfigService extends Service {
  current: any

  async setup() {
    await this.setupEnv()
    await this.setupConfig()
  }

  async setupEnv() {
    if (process.env.NODE_ENV !== 'production') {
      dotenv.config({ path: path.resolve(process.cwd(), 'dist', '.env') })
    } else {
      dotenv.config()
    }
  }

  async setupConfig() {
    let configPath: string
    if (process.env.NODE_ENV !== 'production') {
      configPath = path.resolve(process.cwd(), 'res', 'config.json')
    } else {
      configPath = path.resolve(process.cwd(), 'config', 'config.json')
    }

    const file = fs.readFileSync(configPath)
    this.current = JSON.parse(file.toString())
  }
}

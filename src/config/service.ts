import fs from 'fs'
import { Service } from '../base/service'

export class ConfigService extends Service {
  current: any

  async setup() {
    // TODO: this path will change in production mode
    const file = fs.readFileSync('res/config.json')
    this.current = JSON.parse(file.toString())
  }
}

import fs from 'fs'

export class ConfigService {
  current: any

  setup() {
    // TODO: this path will change in production mode
    const file = fs.readFileSync('res/config.json')
    this.current = JSON.parse(file.toString())
  }
}

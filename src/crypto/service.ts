import bcrypt from 'bcrypt'
import { Service } from '../base/service'

export class CryptoService extends Service {
  async setup() {}

  async hash(plainText: string): Promise<string> {
    return bcrypt.hash(plainText, 10)
  }

  async compareHash(hash: string, plainText: string): Promise<boolean> {
    return bcrypt.compare(plainText, hash)
  }
}

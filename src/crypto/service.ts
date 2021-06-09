import bcrypt from 'bcrypt'
import crypto from 'crypto'
import { Service } from '../base/service'
import { ConfigService } from '../config/service'

export class CryptoService extends Service {
  private key!: Buffer

  constructor(private configService: ConfigService) {
    super()
  }

  async setup() {
    this.key = Buffer.from(this.configService.current.security.key, 'base64')
  }

  async hash(plainText: string): Promise<string> {
    return bcrypt.hash(plainText, 10)
  }

  async compareHash(hash: string, plainText: string): Promise<boolean> {
    return bcrypt.compare(plainText, hash)
  }

  async encrypt(text: string) {
    const iv = crypto.randomBytes(16)

    const cipher = crypto.createCipheriv('aes-256-ctr', this.key, iv)

    const encrypted = Buffer.concat([cipher.update(text), cipher.final()])

    return `${iv.toString('base64')}$${encrypted.toString('base64')}`
  }

  async decrypt(encrypted: string) {
    const [iv, content] = encrypted.split('$')

    const decipher = crypto.createDecipheriv('aes-256-ctr', this.key, Buffer.from(iv, 'base64'))

    const decrpyted = Buffer.concat([decipher.update(Buffer.from(content, 'base64')), decipher.final()])

    return decrpyted.toString()
  }
}

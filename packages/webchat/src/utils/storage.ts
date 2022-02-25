import AES from 'crypto-js/aes'
import utf8 from 'crypto-js/enc-utf8'
import SHA256 from 'crypto-js/sha256'
import Cookie from 'js-cookie'
import { Config } from '../typings'

export class BPStorage {
  private _config?: Config
  private _storage!: Storage | 'cookie'

  constructor(config?: Config) {
    if (config) {
      this._config = config
    }
  }

  public get config() {
    return this._config
  }

  public set config(config: Config | undefined) {
    this._config = config
  }

  private serialize = <T>(value: T): string => {
    if (value === null || value === undefined) {
      throw new Error('[Storage] Cannot store null or undefined values')
    }

    try {
      let str = ''
      if (typeof value === 'string') {
        str = value
      } else {
        str = JSON.stringify(value)
      }

      if (this.config?.encryptionKey?.length) {
        str = AES.encrypt(str, this.config.encryptionKey).toString()
      }

      return str
    } catch {
      console.error('[Storage] Error parsing value', value)
      return ''
    }
  }

  private deserialize = <T>(strValue: string | null | undefined): T | undefined => {
    if (strValue === null || strValue === undefined) {
      return undefined
    }

    try {
      if (this.config?.encryptionKey?.length) {
        strValue = AES.decrypt(strValue, this.config.encryptionKey).toString(utf8)
      }

      return JSON.parse(strValue)
    } catch {
      return undefined
    }
  }

  private getStorageKey = (key: string) => {
    const rawKey = `bp-chat-${key}`

    if (this.config?.encryptionKey?.length) {
      return `${rawKey}-${SHA256(`${this.config.clientId}-${this.config.encryptionKey}`).toString()}`
    } else {
      return `${rawKey}-${this.config?.clientId}`
    }
  }

  private getDriver = (): 'cookie' | Storage => {
    if (this._storage) {
      return this._storage
    }

    try {
      const storage =
        this.config?.useSessionStorage === true && typeof sessionStorage !== 'undefined' ? sessionStorage : localStorage

      const tempKey = '__storage_test__'
      storage.setItem(tempKey, tempKey)
      storage.removeItem(tempKey)

      return (this._storage = storage)
    } catch (e) {
      return (this._storage = 'cookie')
    }
  }

  public set<T>(key: string, value: T) {
    if (!this.config) {
      return
    }

    try {
      const driver = this.getDriver()
      driver !== 'cookie'
        ? driver.setItem(this.getStorageKey(key), this.serialize(value))
        : Cookie.set(this.getStorageKey(key), this.serialize(value))
    } catch (err) {
      console.error('Error while setting data into storage.', (err as Error).message)
    }
  }

  public get<T = string>(key: string): T | undefined {
    if (!this.config) {
      return
    }

    try {
      const driver = this.getDriver()
      return driver !== 'cookie'
        ? this.deserialize(driver.getItem(this.getStorageKey(key)))
        : this.deserialize(Cookie.get(this.getStorageKey(key)))
    } catch (err) {
      console.error('Error while getting data from storage.', (err as Error).message)
    }
  }

  public del(key: string) {
    if (!this.config) {
      return
    }

    try {
      const driver = this.getDriver()
      driver !== 'cookie' ? driver.removeItem(this.getStorageKey(key)) : Cookie.remove(this.getStorageKey(key))
    } catch (err) {
      console.error('Error while deleting data from storage.', (err as Error).message)
    }
  }
}

export default BPStorage

import _ from 'lodash'
import { ConfigService } from '../../src/config/service'
import * as path from 'path'
import fs from 'fs'
import dotenv from 'dotenv'
import { mocked } from 'ts-jest/utils'

jest.mock('fs')
jest.mock('dotenv')

describe('ConfigService', () => {
  let configService: ConfigService

  const dotenvPath = path.resolve(process.cwd(), 'dist', '.env')
  const devConfigPath = path.resolve(process.cwd(), 'res', 'config.json')
  const prodConfigPath = path.resolve(process.cwd(), 'config', 'config.json')
  const config = { ENV: 'value' }
  const invalidConfig = 'a simple string'

  beforeEach(() => {
    configService = new ConfigService()
  })

  test('Should instantiate without throwing any error', () => {
    try {
      new ConfigService()
    } catch (e) {
      fail(e)
    }
  })

  test('Should load environment variables from .env file in dist folder', async () => {
    const spy = jest.spyOn(dotenv, 'config')

    await configService.setupEnv()

    expect(spy).toHaveBeenCalledTimes(1)
    expect(spy).toHaveBeenCalledWith({ path: dotenvPath })
  })

  test('Should load environment variables from .env file at the root', async () => {
    const env = _.cloneDeep(process.env)
    process.env.NODE_ENV = 'production'

    const spy = jest.spyOn(dotenv, 'config')

    await configService.setupEnv()

    expect(spy).toHaveBeenCalledTimes(1)
    expect(spy).toHaveBeenCalledWith()

    process.env = env
  })

  test('Should not load any environment variables from .env file', async () => {
    const env = _.cloneDeep(process.env)
    process.env.SKIP_LOAD_ENV = 'true'

    const spy = jest.spyOn(dotenv, 'config')

    await configService.setupEnv()

    expect(spy).toHaveBeenCalledTimes(0)

    process.env = env
  })

  test('Should load configuration from json file in dist folder', async () => {
    const configBuffer = Buffer.from(JSON.stringify(config))

    mocked(fs.existsSync).mockReturnValueOnce(true)
    mocked(fs.readFileSync).mockReturnValueOnce(configBuffer)

    await configService.setupConfig()

    expect(fs.existsSync).toHaveBeenCalledTimes(1)
    expect(fs.existsSync).toHaveBeenCalledWith(devConfigPath)
    expect(fs.readFileSync).toHaveBeenCalledTimes(1)
    expect(fs.readFileSync).toHaveBeenCalledWith(devConfigPath)
    expect(configService.current).toEqual(config)
  })

  test('Should load configuration from json file at the root', async () => {
    const env = _.cloneDeep(process.env)
    process.env.NODE_ENV = 'production'

    const configBuffer = Buffer.from(JSON.stringify(config))

    mocked(fs.existsSync).mockReturnValueOnce(true)
    mocked(fs.readFileSync).mockReturnValueOnce(configBuffer)

    await configService.setupConfig()

    expect(fs.existsSync).toHaveBeenCalledTimes(1)
    expect(fs.existsSync).toHaveBeenCalledWith(prodConfigPath)
    expect(fs.readFileSync).toHaveBeenCalledTimes(1)
    expect(fs.readFileSync).toHaveBeenCalledWith(prodConfigPath)
    expect(configService.current).toEqual(config)

    process.env = env
  })

  test('Should throw if config file in the wrong format', async () => {
    const configBuffer = Buffer.from(invalidConfig)

    mocked(fs.existsSync).mockReturnValueOnce(true)
    mocked(fs.readFileSync).mockReturnValueOnce(configBuffer)

    await expect(configService.setupConfig()).rejects.toThrow()

    expect(fs.existsSync).toHaveBeenCalledTimes(1)
    expect(fs.existsSync).toHaveBeenCalledWith(devConfigPath)
    expect(fs.readFileSync).toHaveBeenCalledTimes(1)
    expect(fs.readFileSync).toHaveBeenCalledWith(devConfigPath)
  })

  test('Should create an empty config if config file does not exists', async () => {
    mocked(fs.existsSync).mockReturnValueOnce(false)

    await configService.setupConfig()

    expect(fs.existsSync).toHaveBeenCalledTimes(1)
    expect(fs.existsSync).toHaveBeenCalledWith(devConfigPath)
    expect(configService.current).toMatchObject({})
  })

  test('Should not load any configuration from json file', async () => {
    const env = _.cloneDeep(process.env)
    process.env.SKIP_LOAD_CONFIG = 'true'

    await configService.setupConfig()

    expect(fs.existsSync).not.toHaveBeenCalled()
    expect(fs.readFileSync).not.toHaveBeenCalled()

    process.env = env
  })

  test('Should not load any config', async () => {
    const env = _.cloneDeep(process.env)
    process.env.SKIP_LOAD_CONFIG = 'true'
    process.env.SKIP_LOAD_ENV = 'true'

    await configService.setup()

    expect(fs.existsSync).not.toHaveBeenCalled()
    expect(fs.readFileSync).not.toHaveBeenCalled()

    process.env = env
  })
})

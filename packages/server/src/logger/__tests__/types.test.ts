import _ from 'lodash'
import { Logger } from '../types'

describe('Logger', () => {
  const scope = 'tests'
  const subScope = 'unit'
  const message = 'a message.'
  const error = new Error('an error')
  const data = {
    some: 'data'
  }
  const levels = ['info', 'debug', 'warn', 'error']

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('Should instantiate without throwing any error', () => {
    try {
      const logger = new Logger(scope)

      expect(logger['scope']).toEqual(scope)
    } catch (e) {
      fail(e)
    }
  })

  it('Should allow to create sub loggers with sub scopes', () => {
    const logger = new Logger(scope)

    const subLogger = logger.sub(subScope)

    expect(subLogger).toBeInstanceOf(Logger)
    expect(subLogger['scope']).toEqual(`${scope}:${subScope}`)
  })

  it('Should print an info message with some data', () => {
    const logger = new Logger(scope)
    const spy = jest.spyOn(console, 'log').mockImplementation()

    for (const level of levels) {
      let params: any[] = [message, data]
      let outputParams: any[] = [expect.anything(), expect.stringContaining(scope), message, data]

      if (level === 'error') {
        params.unshift(error)
        outputParams.push(error.stack)
      }

      ;(<any>logger)[level](...params)

      expect(spy).toHaveBeenCalledTimes(1)

      expect(spy).toHaveBeenCalledWith(...outputParams)

      spy.mockReset()
    }
  })

  it('Should only print an info message', () => {
    const logger = new Logger(scope)
    const spy = jest.spyOn(console, 'log').mockImplementation()

    for (const level of levels) {
      let params: any[] = [message]
      let outputParams: any[] = [expect.anything(), expect.stringContaining(scope), message]

      if (level === 'error') {
        params.unshift(error)
        outputParams.push(error.stack)
      }

      ;(<any>logger)[level](...params)

      expect(spy).toHaveBeenCalledTimes(1)

      expect(spy).toHaveBeenCalledWith(...outputParams)

      spy.mockReset()
    }
  })

  it('Should print an info message with some data', () => {
    const logger = new Logger(scope)
    const spy = jest.spyOn(console, 'log').mockImplementation()

    logger.info(message, data)

    expect(spy).toHaveBeenCalledTimes(1)
    expect(spy).toHaveBeenCalledWith(expect.anything(), expect.stringContaining(scope), message, data)
  })

  it('Spinned env var should display more info', () => {
    const env = _.cloneDeep(process.env)
    process.env.SPINNED = 'true'

    const logger = new Logger(scope)
    const spy = jest.spyOn(console, 'log').mockImplementation()

    logger.info(message, data)

    expect(spy).toHaveBeenCalledTimes(1)
    expect(spy).toHaveBeenCalledWith(expect.anything(), expect.stringContaining(`[Messaging] ${scope}`), message, data)

    process.env = env
  })
})

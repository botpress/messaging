import clc from 'cli-color'
import _ from 'lodash'
import { Logger } from '../../src/logger/types'

describe('Logger', () => {
  const defaultEnv = process.env
  const scope = 'tests'
  const subScope = 'unit'
  const prefix = '[MYPREFIX] '
  const message = 'a message.'
  const prefixedMessage = `${clc.blackBright(prefix)}${message}`
  const messageWithoutDot = 'a message'
  const error = new Error('an error')
  const data = {
    some: 'data'
  }
  const levels = ['info', 'debug', 'warn', 'error']

  beforeEach(() => {
    process.env = { ..._.cloneDeep(process.env) }
  })

  afterEach(() => {
    process.env = defaultEnv
  })

  test('Should instantiate without throwing any error when given a scope', () => {
    try {
      const logger = new Logger(scope)

      expect(logger['scope']).toEqual(scope)
    } catch (e) {
      fail(e)
    }
  })

  describe('sub', () => {
    test('Should allow to create sub loggers with sub scopes', () => {
      const logger = new Logger(scope)

      const subLogger = logger.sub(subScope)

      expect(subLogger).toBeInstanceOf(Logger)
      expect(subLogger['scope']).toEqual(`${scope}:${subScope}`)
    })
  })

  describe('prefix', () => {
    test('Should allow to create a loggers with a prefix', () => {
      const logger = new Logger(scope)

      const subLogger = logger.prefix(prefix)

      expect(subLogger).toBeInstanceOf(Logger)
      expect(subLogger['logPrefix']).toEqual(prefix)
    })
  })

  describe(levels.join(', '), () => {
    test('Should print a message with some data', () => {
      const logger = new Logger(scope)
      const spy = jest.spyOn(console, 'log').mockImplementation()

      for (const level of levels) {
        const params: any[] = [message, data]
        const outputParams: any[] = [expect.anything(), expect.stringContaining(scope), message, data]

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

    test('Should print a message without any data', () => {
      const logger = new Logger(scope)
      const spy = jest.spyOn(console, 'log').mockImplementation()

      for (const level of levels) {
        const params: any[] = [message]
        const outputParams: any[] = [expect.anything(), expect.stringContaining(scope), message]

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

    test('Should print a message with a prefix', () => {
      const logger = new Logger(scope, prefix)
      const spy = jest.spyOn(console, 'log').mockImplementation()

      for (const level of levels) {
        const params: any[] = [message, data]
        const outputParams: any[] = [expect.anything(), expect.stringContaining(scope), prefixedMessage, data]

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

    test('Should display more info when SPINNED is true', () => {
      process.env.SPINNED = 'true'

      const logger = new Logger(scope)
      const spy = jest.spyOn(console, 'log').mockImplementation()

      for (const level of levels) {
        const params: any[] = [message]
        const outputParams: any[] = [expect.anything(), expect.stringContaining(`[Messaging] ${scope}`), message]

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

    test('Should display single-line info when SINGLE_LINE_LOGGING is true', () => {
      process.env.SINGLE_LINE_LOGGING = 'true'

      const logger = new Logger(scope)
      const spy = jest.spyOn(console, 'log').mockImplementation()

      for (const level of levels) {
        const params: any[] = [message, data]
        const outputParams: any[] = [expect.anything(), expect.stringContaining(scope), ...logger['singleLine'](params)]

        if (level === 'error') {
          params.unshift(error)
          outputParams.push(...logger['singleLine']([error.stack]))
        }

        ;(<any>logger)[level](...params)

        expect(spy).toHaveBeenCalledTimes(1)
        expect(spy).toHaveBeenCalledWith(...outputParams)

        spy.mockReset()
      }
    })

    test("Should display multi-line info if it can't be stringify when SINGLE_LINE_LOGGING is true", () => {
      process.env.SINGLE_LINE_LOGGING = 'true'

      const logger = new Logger(scope)
      const spy = jest.spyOn(console, 'log').mockImplementation()

      const circularObj: any = {}
      circularObj['a'] = circularObj

      logger.info(message, circularObj)

      expect(spy).toHaveBeenCalledTimes(1)
      expect(spy).toHaveBeenCalledWith(expect.anything(), expect.stringContaining(scope), message, circularObj)
    })
  })

  describe('error', () => {
    test('Should print an error message and add a dot at the end', () => {
      const logger = new Logger(scope)
      const spy = jest.spyOn(console, 'log').mockImplementation()
      const error = new Error()

      logger.error(error, messageWithoutDot)

      expect(spy).toHaveBeenCalledTimes(1)
      expect(spy).toHaveBeenCalledWith(expect.anything(), expect.stringContaining(scope), message, error.stack)
    })

    test('Should print an error without a message', () => {
      const logger = new Logger(scope)
      const spy = jest.spyOn(console, 'log').mockImplementation()
      const error = new Error()

      logger.error(error)

      expect(spy).toHaveBeenCalledTimes(1)
      expect(spy).toHaveBeenCalledWith(expect.anything(), expect.stringContaining(scope), error.stack)
    })

    test('Should print an error message without a stack trace', () => {
      const logger = new Logger(scope)
      const spy = jest.spyOn(console, 'log').mockImplementation()

      logger.error(undefined, message)

      expect(spy).toHaveBeenCalledTimes(1)
      expect(spy).toHaveBeenCalledWith(expect.anything(), expect.stringContaining(scope), message)
    })
  })
})

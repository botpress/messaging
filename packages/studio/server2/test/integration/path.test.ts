import { stat } from 'fs/promises'
import { PathService } from '../../src/paths/service'
import { setupApp, destroyApp, app } from '../utils'

describe('PathService', () => {
  const invalidPath = '3#$1!`133/?//\\//'

  let paths: PathService
  let state: {}

  beforeAll(async () => {
    await setupApp()

    paths = app.paths
  })

  afterAll(async () => {
    await destroyApp()
  })

  describe('List', () => {
    test('Should return the list content of a certain directory', async () => {
      const files = await paths.list('/')
      expect(files.length).toBeGreaterThan(0)

      // Should list files and directory
      let onlyFiles = true
      for (const file of files) {
        const stats = await stat(paths.absolute(file))

        if (stats.isDirectory()) {
          onlyFiles = false
        }
      }

      expect(onlyFiles).toBe(false)
    })

    test('Should return an empty list if the path does not exists', async () => {
      const files = await paths.list('/does-not-exist')
      expect(files.length).toEqual(0)
    })

    test('Should return an empty list if the path is invalid', async () => {
      const files = await paths.list(invalidPath)
      expect(files.length).toEqual(0)
    })
  })

  describe('ListFiles', () => {
    test('Should return the list of files inside a certain directory', async () => {
      const files = await paths.listFiles('/')
      expect(files.length).toBeGreaterThan(0)

      // Should only list files
      for (const file of files) {
        const stats = await stat(paths.absolute(file))

        expect(stats.isFile()).toBe(true)
      }
    })

    test('Should return an empty list if the path does not exists', async () => {
      const files = await paths.listFiles('/does-not-exist')
      expect(files.length).toEqual(0)
    })

    test('Should return an empty list if the path is invalid', async () => {
      const files = await paths.listFiles(invalidPath)
      expect(files.length).toEqual(0)
    })
  })

  describe('ListDirectories', () => {
    test('Should return the list of directories inside a certain directory', async () => {
      const files = await paths.listDirectories('/')
      expect(files.length).toBeGreaterThan(0)

      // Should only list directories
      for (const file of files) {
        const stats = await stat(paths.absolute(file))

        expect(stats.isDirectory()).toBe(true)
      }
    })

    test('Should return an empty list if the path does not exists', async () => {
      const files = await paths.listDirectories('/does-not-exist')
      expect(files.length).toEqual(0)
    })

    test('Should return an empty list if the path is invalid', async () => {
      const files = await paths.listDirectories(invalidPath)
      expect(files.length).toEqual(0)
    })
  })

  describe('ListFilesRecursive', () => {
    test('Should return the list of files inside a certain directory and its subdirectories', async () => {
      const files = await paths.listFilesRecursive('/')
      expect(files.length).toBeGreaterThan(0)

      const nonRecursive = await paths.listFiles('/')
      expect(files.length).toBeGreaterThan(nonRecursive.length)

      // Should only list files
      for (const file of files) {
        const stats = await stat(paths.absolute(file))

        expect(stats.isFile()).toBe(true)
      }
    })

    test('Should return an empty list if the path does not exists', async () => {
      const files = await paths.listFiles('/does-not-exist')
      expect(files.length).toEqual(0)
    })

    test('Should return an empty list if the path is invalid', async () => {
      const files = await paths.listFiles(invalidPath)
      expect(files.length).toEqual(0)
    })
  })
})

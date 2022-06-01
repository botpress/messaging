import fs from 'fs'
import mkdirp from 'mkdirp'
import path from 'path'
import rimraf from 'rimraf'
import unzipper from 'unzipper'

import { App } from '../../src/app'

export let app: App
let env: NodeJS.ProcessEnv

export const setupApp = async (
  { prefix, transient }: { transient: boolean; prefix?: string } = { transient: true }
) => {
  env = { ...process.env }

  await extractBotArchive()

  process.env.DATA_PATH = path.join(__dirname, 'bot')

  app = new App()
  await app.prepare(require('../../package.json'), [])
  await app.setup()
  await app.postSetup()

  return app
}

export const destroyApp = async () => {
  if (!app) {
    return
  }

  await app.preDestroy()
  await app.destroy()
  await app.postDestroy()

  process.env = env
}

const extractBotArchive = async () => {
  const archivePath = path.join(__dirname, 'bot.zip')
  const outputPath = path.join(__dirname, 'bot')

  // First we clear the folder in case it already contains files
  await new Promise((resolve) => rimraf(outputPath, {}, resolve))

  // Then we re-create the output folder
  await mkdirp(outputPath)

  // Finally we extract the archive
  const stream = fs.createReadStream(archivePath).pipe(unzipper.Extract({ path: __dirname }))

  return new Promise((resolve, reject) => {
    stream.on('finish', () => resolve(undefined))
    stream.on('error', (error) => reject(error))
  })
}

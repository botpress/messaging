import fs from 'fs'

import { execute } from './utils/exec'
import logger from './utils/logger'
import { getProjectVersion, formatVersion } from './utils/version'

const outputPath = './bin'

const installBindings = async () => {
  const platforms = ['darwin', 'win32', 'linux']

  const sqliteDir = './node_modules/better-sqlite3'
  const sqliteNodeFileName = 'better_sqlite3.node'
  const sqliteNodeFilePath = `${sqliteDir}/build/Release/${sqliteNodeFileName}`
  const sqliteTempNodeFilePath = `${sqliteNodeFilePath}.old`

  // since it's not possible to tell prebuild-install to download the .node file to a specific version,
  // we keep a backup of the one that was currently install for development
  fs.renameSync(sqliteNodeFilePath, sqliteTempNodeFilePath)

  for (const platform of platforms) {
    await execute(`./node_modules/.bin/prebuild-install --platform ${platform}`, { cwd: sqliteDir }, { silent: true })

    const dir = `${sqliteDir}/lib/binding/node-v93-${platform}-x64`
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    fs.renameSync(sqliteNodeFilePath, `${dir}/${sqliteNodeFileName}`)
  }

  fs.renameSync(sqliteTempNodeFilePath, sqliteNodeFilePath)
}

const renameBinaries = async () => {
  const formattedVersion = formatVersion(getProjectVersion())
  const mappings = [
    ['messaging-win.exe', `messaging-v${formattedVersion}-win-x64.exe`],
    ['messaging-linux', `messaging-v${formattedVersion}-linux-x64`],
    ['messaging-macos', `messaging-v${formattedVersion}-darwin-x64`]
  ]

  for (const [oldPath, newPath] of mappings) {
    await new Promise((resolve, reject) =>
      fs.rename(`${outputPath}/${oldPath}`, `${outputPath}/${newPath}`, (err) =>
        err ? reject(err) : resolve(undefined)
      )
    )
  }
}

const packageApp = async () => {
  try {
    await installBindings()

    await execute(`pkg --out-path ${outputPath} package.json`, undefined, { silent: true })

    await renameBinaries()

    logger.info(`Binaries produced successfully and can be found inside the '${outputPath}' folder`)
  } catch (err) {
    logger.error('Error while packaging app', err)
  }
}

void packageApp()

import 'bluebird-global'
import * as sdk from 'botpress/sdk'

import fs from 'fs'
import _ from 'lodash'
import path from 'path'
import {
  FileDefinition,
  FileTypes,
  EditableFile,
  FilePermissions,
  FilesDS,
  FileType,
  TypingDefinitions
} from '../../common/code-editor'
import { Instance } from '../../studio/utils/bpfs'

import { assertValidFilename, buildRestrictedProcessVars, getBuiltinExclusion, getFileLocation } from './utils'

export const FILENAME_REGEX = /^[0-9a-zA-Z_\-.]+$/

export class Editor {
  private _botId!: string
  private _typings!: TypingDefinitions

  constructor(private logger: sdk.Logger) {}

  forBot(botId: string) {
    this._botId = botId
    return this
  }

  async getAllFiles(permissions: FilePermissions, listBuiltin?: boolean): Promise<FilesDS> {
    const files: FilesDS = {}

    await Promise.mapSeries(Object.keys(permissions), async (type) => {
      const userPermissions = permissions[type]
      if (userPermissions.read) {
        files[type] = await this.loadFiles(userPermissions.type, this._botId, listBuiltin)
      }
    })

    return files
  }

  async fileExists(file: EditableFile): Promise<boolean> {
    const { folder, filename } = getFileLocation(file)
    return Instance.fileExists(path.join('./', folder, filename))
  }

  async readFileContent(file: EditableFile): Promise<string> {
    const { folder, filename } = getFileLocation(file)
    return (await Instance.readFile(path.join('./', folder, filename))).toString()
  }

  async readFileBuffer(file: EditableFile): Promise<Buffer> {
    const { folder, filename } = getFileLocation(file)
    return Instance.readFile(path.join('./', folder, filename))
  }

  async saveFile(file: EditableFile): Promise<void> {
    const { folder, filename } = getFileLocation(file)
    return Instance.upsertFile(path.join('./', folder, filename), file.content!)
  }

  async loadFiles(fileTypeId: string, botId: string, listBuiltin?: boolean): Promise<EditableFile[]> {
    const def: FileDefinition = FileTypes[fileTypeId]
    const { baseDir, dirListingAddFields, dirListingExcluded } = def.ghost

    const baseExcluded = listBuiltin ? [] : getBuiltinExclusion()
    const excluded = [...baseExcluded, ...(dirListingExcluded ?? []), '.DS_Store']

    let files = def.filenames
      ? def.filenames
      : await Instance.directoryListing(path.join('./', baseDir), {
          excludes: excluded,
          includeDotFiles: true
        })

    if (def.isJSON) {
      files = files.filter((x) => x.endsWith('.json'))
    } else if (def.isJSON === false) {
      files = files.filter((x) => x.endsWith('.js'))
    }

    return Promise.map(files, async (filepath: string) => ({
      name: path.basename(filepath),
      type: fileTypeId as FileType,
      location: filepath,
      content: undefined,
      botId,
      ...(dirListingAddFields && dirListingAddFields(filepath))
    }))
  }

  async deleteFile(file: EditableFile): Promise<void> {
    const fileDef = FileTypes[file.type]
    if (fileDef.canDelete && !fileDef.canDelete(file)) {
      throw new Error('This file cannot be deleted.')
    }

    const { folder, filename } = getFileLocation(file)
    await Instance.deleteFile(path.join('./', folder, filename))
  }

  async renameFile(file: EditableFile, newName: string): Promise<void> {
    assertValidFilename(newName)

    const { folder, filename } = getFileLocation(file)
    const newFilename = filename.replace(filename, newName)

    if (await Instance.fileExists(path.join('./', folder, newFilename))) {
      throw new Error('File already exists')
    }

    return Instance.moveFile(path.join('./', folder, filename), path.join('./', folder, newFilename))
  }

  async readFile(name: string, filePath: string) {
    let fileContent = ''
    try {
      const typings = fs.readFileSync(filePath, 'utf-8')

      fileContent = typings.toString()
      if (name === 'botpress.d.ts' || name === 'botpress.runtime.d.ts') {
        fileContent = fileContent.replace("'botpress/sdk'", 'sdk').replace("'botpress/runtime-sdk'", 'sdk')
      }
    } catch (err) {
      this.logger.warn(`Couldn't load file ${filePath} `)
    }

    return { name, fileContent }
  }

  async loadTypings() {
    if (this._typings) {
      return this._typings
    }

    // const botConfigSchema = (await Instance.readFile('bot.config.schema.json')).toString()
    // const botpressConfigSchema = (await Instance.readFile('botpress.config.schema.json')).toString() // TODO: we need to copy botpress config to bot dir ? if not already done

    const files = [
      { name: 'node.d.ts', location: path.join(__dirname, '/../../typings/node.d.txt') },
      { name: 'botpress.d.ts', location: path.join(__dirname, '/../../sdk/botpress.d.txt') },
      { name: 'botpress.runtime.d.ts', location: path.join(__dirname, '/../../sdk/botpress.runtime.d.txt') },
      // Required so array.includes() can be used without displaying an error
      { name: 'es6include.d.ts', location: path.join(__dirname, '/../../typings/es6include.txt') }
    ]

    const content = await Promise.mapSeries(files, (file) => this.readFile(file.name, file.location))
    const localTypings = _.mapValues(_.keyBy(content, 'name'), 'fileContent')

    this._typings = {
      'process.d.ts': buildRestrictedProcessVars(),
      // 'bot.config.schema.json': botConfigSchema,
      // 'botpress.config.schema.json': botpressConfigSchema,
      ...localTypings
    }

    return this._typings
  }
}

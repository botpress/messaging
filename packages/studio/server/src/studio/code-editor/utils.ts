import _ from 'lodash'
import { EditableFile, FileDefinition, FilePermissions, FileTypes } from '../../common/code-editor'
import { BUILTIN_MODULES } from '../../common/defaults'

import { FILENAME_REGEX } from './editor'
const jsonlintMod = require('jsonlint-mod')

export const getBuiltinExclusion = () => {
  return _.flatMap(BUILTIN_MODULES, (mod) => [`${mod}/*`, `*/${mod}/*`])
}

export const getFileLocation = (file: EditableFile): { folder: string; filename: string } => {
  const fileDef: FileDefinition = FileTypes[file.type]
  const { baseDir, upsertLocation, upsertFilename } = fileDef.ghost

  const folder = (upsertLocation && upsertLocation(file)) || baseDir
  const filename = (upsertFilename && upsertFilename(file)) || file.location

  return { folder, filename }
}

export const assertValidJson = (content: string): boolean => {
  try {
    JSON.parse(content)
    return true
  } catch (err) {
    try {
      jsonlintMod.parse(content)
      return false
    } catch (e: any) {
      throw new Error(`Invalid JSON file. ${e.message.split(':')[0]}`)
    }
  }
}

export const assertValidFilename = (filename: string) => {
  if (!FILENAME_REGEX.test(filename)) {
    throw new Error('Filename has invalid characters')
  }
}

export const arePermissionsValid = (
  def: FileDefinition,
  editableFile: EditableFile,
  permissions: FilePermissions,
  actionType: 'read' | 'write'
): boolean => {
  return permissions[`bot.${def.permission}`][actionType] && !!editableFile.botId
}

export const validateFilePayload = async (
  editableFile: EditableFile,
  permissions: FilePermissions,
  currentBotId: string,
  actionType: 'read' | 'write'
) => {
  const { name, botId, type, content, location } = editableFile

  const def: FileDefinition = FileTypes[type]
  if (!def) {
    throw new Error(`Invalid file type "${type}", only ${Object.keys(FileTypes)} are allowed at the moment`)
  }

  if (botId && botId.length && botId !== currentBotId) {
    throw new Error(`Can't perform modification on bot ${botId}. Please switch to the correct bot to change it.`)
  }

  if (!arePermissionsValid(def, editableFile, permissions, actionType)) {
    throw new Error('No permission')
  }

  if (def.isJSON && content) {
    assertValidJson(content)
  }

  if (def.validate) {
    const result = await def.validate(editableFile, actionType === 'write')
    if (result) {
      throw new Error(result)
    }
  }

  if (def.filenames && !def.filenames.includes(location)) {
    throw new Error(`Invalid file name. Must match ${def.filenames}`)
  }

  assertValidFilename(name)
}

export const buildRestrictedProcessVars = () => {
  const exposedEnv = {
    ..._.pickBy(process.env, (_value, name) => name.startsWith('EXPOSED_')),
    ..._.pick(process.env, 'TZ', 'LANG', 'LC_ALL', 'LC_CTYPE', 'HTTP_PROXY', 'HTTPS_PROXY', 'NO_PROXY')
  }
  const root = extractInfo(_.pick(process, 'HOST', 'PORT', 'EXTERNAL_URL', 'PROXY'))
  const exposed = extractInfo(exposedEnv)

  return `
  declare var process: RestrictedProcess;
  interface RestrictedProcess {
    ${root.map((x) => {
      return `/** Current value: ${x.value} */
${x.name}: ${x.type}
`
    })}

    env: {
      ${exposed.map((x) => {
        return `/** Current value: ${x.value} */
${x.name}: ${x.type}
`
      })}
    }
  }`
}

const extractInfo = (keys: any) => {
  return Object.keys(keys).map((name) => {
    return { name, value: keys[name], type: typeof keys[name] }
  })
}

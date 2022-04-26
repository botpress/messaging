import { customAlphabet } from 'nanoid'

export const safeId = (length = 10) => customAlphabet('1234567890abcdefghijklmnopqrsuvwxyz', length)()

const regex = {
  illegalFile: /[\/\?<>\\:\*\|"]/g,
  illegalFolder: /[\?<>\\:\*\|"]/g,
  control: /[\x00-\x1f\x80-\x9f]/g,
  reserved: /^\.+$/
}

export const sanitize = (input: string, type?: 'file' | 'folder') => {
  return input
    .replace(regex.control, '')
    .replace(regex.reserved, '')
    .replace(type === 'folder' ? regex.illegalFolder : regex.illegalFile, '')
}

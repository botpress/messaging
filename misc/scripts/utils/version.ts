import path from 'path'

export const getProjectVersion = () => {
  return require(path.join(__dirname, '../../../package.json')).version
}

export const formatVersion = (version: string): string => {
  return version.replace(/\./g, '_')
}

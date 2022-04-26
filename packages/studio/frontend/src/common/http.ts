const URL_FOLDER_SEPERATOR = '!!'

export const encodeFolderPath = (path: string): string => {
  return path.replace(/\//g, URL_FOLDER_SEPERATOR)
}

export const decodeFolderPath = (urlPath: string): string => {
  return urlPath.replace(new RegExp(URL_FOLDER_SEPERATOR, 'g'), '/')
}

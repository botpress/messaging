import path from 'path'
import url from 'url'

const isBpUrl = (str: string) => {
  const re = /^\/api\/v1\/studio\/.*\/media\/.*/
  return re.test(str)
}

export default {
  formatURL: (baseUrl: string, url: string) => {
    return isBpUrl(url) ? `${baseUrl}${url}` : url
  },
  isUrl: (str: string) => {
    try {
      new url.URL(str)
      return true
    } catch {
      return false
    }
  },
  extractPayload: (type: string, data: any) => {
    const payload = {
      type,
      ...data
    }

    delete payload.event
    delete payload.temp
    delete payload.user
    delete payload.session
    delete payload.bot
    delete payload.BOT_URL

    return payload
  },
  extractFileName: (file: string) => {
    let fileName = path.basename(file)
    if (fileName.includes('-')) {
      fileName = fileName.split('-').slice(1).join('-')
    }

    return fileName
  }
}

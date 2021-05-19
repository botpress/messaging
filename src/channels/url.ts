export const isBpUrl = (str: string): boolean => {
  const re = /^\/api\/.*\/bots\/.*\/media\/.*/g

  return re.test(str)
}

export const formatUrl = (baseUrl: string, url: string | undefined): string | undefined => {
  if (!url) {
    return undefined
  }

  if (isBpUrl(url)) {
    return `${baseUrl}${url}`
  } else {
    return url
  }
}

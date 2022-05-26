import crypto from 'crypto'

export const randomLetters = (length: number) => {
  const chars = 'abcdefghijklmnopqrstuvwxyz'
  let str = ''
  for (let i = 0; i < length; i++) {
    str += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return str
}

export const randStr = () => {
  return crypto.randomBytes(20).toString('hex')
}

export const sleep = (time: number = 10) => {
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve()
    }, time)
  })
}

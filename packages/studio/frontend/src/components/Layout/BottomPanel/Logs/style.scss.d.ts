export type Styles = {
  debug: string
  end: string
  entry: string
  level: string
  'level-debug': string
  'level-error': string
  'level-info': string
  'level-silly': string
  'level-verbose': string
  'level-warn': string
  logs: string
  message: string
  time: string
}

export type ClassNames = keyof Styles

declare const styles: Styles

export default styles

export interface ComposeError {
  exitCode: number
  err: string
  out: string
}

export const getErrorMessage = (error: unknown): string => {
  const err = error as ComposeError

  let message = ''
  if (err.err) {
    message = err.err
  }

  return message
}

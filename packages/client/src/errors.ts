export const handleNotFound = async <U, T, F extends Function = () => U>(func: F, returnValue: T): Promise<U | T> => {
  try {
    return await func()
  } catch (err: any) {
    if (err?.response?.status === 404) {
      return returnValue
    } else {
      throw err
    }
  }
}

export const handleUnauthorized = async <U, T, F extends Function = () => U>(
  func: F,
  returnValue: T
): Promise<U | T> => {
  try {
    return await func()
  } catch (err: any) {
    if (err?.response?.status === 401) {
      return returnValue
    } else {
      throw err
    }
  }
}

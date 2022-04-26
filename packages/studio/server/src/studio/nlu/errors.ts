export class BotNotMountedError extends Error {
  constructor(public botId: string) {
    super(`Bot ${botId} is not mounted.`)
  }
}

export class NLUServiceNotInitializedError extends Error {
  constructor() {
    super('NLU Service not initialized yet. Please Retry.')
  }
}

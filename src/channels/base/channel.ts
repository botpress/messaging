import { Router } from 'express'

export abstract class Channel {
  abstract get id(): string

  constructor(protected router: Router) {}

  async setup(): Promise<void> {}
}

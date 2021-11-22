import { Emitter } from '@botpress/messaging-base'
import { DistributedService } from '..'

export class Dispatcher<T extends { [key: number]: any }> extends Emitter<T> {
  private name!: string
  private distributed!: DistributedService
  private handleDispatchCallback: any

  async setup(name: string, distributed: DistributedService) {
    this.name = name
    this.distributed = distributed
    this.handleDispatchCallback = this.handleDispatch.bind(this)
  }

  async subscribe(scope: string) {
    await this.distributed.listen(this.getChannel(scope), this.handleDispatchCallback)
  }

  async unsubscribe(scope: string) {
    await this.distributed.unsubscribe(this.getChannel(scope))
  }

  async publish<K extends keyof T>(event: K, scope: string, arg: T[K]) {
    await this.distributed.publish(this.getChannel(scope), {
      cmd: event,
      data: arg
    })
  }

  private getChannel(scope: string) {
    return `${this.name}:${scope}`
  }

  private async handleDispatch<K extends keyof T>({ cmd, data }: { cmd: K; data: T[K] }) {
    await this.emit(cmd, data)
  }
}

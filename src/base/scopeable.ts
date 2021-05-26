import { Service } from './service'

export abstract class ScopeableService<T> extends Service {
  private scopes: { [scopeId: string]: T } = {}

  public forClient(clientId: string): T {
    let scope = this.scopes[clientId]
    if (!scope) {
      scope = this.createScope(clientId)
      this.scopes[clientId] = scope
    }
    return scope
  }

  protected abstract createScope(clientId: string): T
}

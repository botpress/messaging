import { BaseClient } from './base'

export class HealthClient extends BaseClient {
  async get(): Promise<HealthReport> {
    return (await this.http.get('/health')).data
  }
}

// TODO: these typings are copy pasted. Maybe a "common" package would be good for this?
export enum HealthEventType {
  Create = 'create',
  Configure = 'configure',
  Start = 'start',
  StartFailure = 'start-failure',
  Initialize = 'initialize',
  InitializeFailure = 'initialize-failure',
  Sleep = 'sleep',
  Delete = 'delete'
}

export interface HealthReport {
  channels: {
    [channel: string]: {
      events: HealthReportEvent[]
    }
  }
}

export interface HealthReportEvent {
  time: Date
  type: HealthEventType
  data?: any
}

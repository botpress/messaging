import { BaseClient } from './base'

export class HealthClient extends BaseClient {
  async get(): Promise<HealthReport> {
    return this.deserialize((await this.http.get<HealthReport>('/health')).data)
  }

  private deserialize(report: HealthReport) {
    for (const channel of Object.keys(report.channels)) {
      report.channels[channel].events = report.channels[channel].events.map((x) => ({ ...x, time: new Date(x.time) }))
    }

    return report
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

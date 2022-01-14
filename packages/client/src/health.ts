import { HealthReport } from '@botpress/messaging-base'
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

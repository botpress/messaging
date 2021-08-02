export enum HealthEventType {
  Init = 'init',
  Start = 'start',
  Sleep = 'sleep',
  Delete = 'delete'
}

export interface HealthEvent {
  type: HealthEventType
  time: Date
  data: any
}

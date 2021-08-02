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

export interface HealthEvent {
  type: HealthEventType
  time: Date
  data: any
}

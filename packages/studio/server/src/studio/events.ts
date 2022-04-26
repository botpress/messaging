import { EventEmitter2 } from 'eventemitter2'

export enum StudioEvents {
  NLU_TRAINING_UPDATE = 'NLU_TRAINING_UPDATE',
  CONSOLE_LOGS = 'CONSOLE_LOGS'
}

export class GlobalEvents {
  public static events: EventEmitter2 = new EventEmitter2()

  static fireEvent(type: StudioEvents, payload: any) {
    this.events.emit(type, payload)
  }
}

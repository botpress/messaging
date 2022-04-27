export interface TrainId {
  botId: string
  language: string
}

export type TrainStatus = 'needs-training' | 'training-pending' | 'training' | 'done'
export interface TrainError {
  type: string
  message: string
}

export interface TrainState {
  status: TrainStatus
  progress: number
  error?: TrainError
}

export interface Training extends TrainId, TrainState {}

export interface NLUProgressEvent extends Training {
  type: 'nlu'
}

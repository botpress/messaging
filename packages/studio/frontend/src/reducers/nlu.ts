import { handleActions } from 'redux-actions'

import { trainSessionReceived } from '../actions'
import { Training } from '../common/nlu-training'
import * as sdk from '../common/sdk'

export interface NLUReducer {
  entities?: sdk.NLU.EntityDefinition[]
  intents?: sdk.NLU.IntentDefinition[]
  trainSessions: { [lang: string]: Training }
}

const defaultState: NLUReducer = {
  trainSessions: {}
}

export default handleActions(
  {
    [trainSessionReceived as any]: (state, { payload }) => {
      const trainSession: Training = payload as any
      return {
        ...state,
        trainSessions: {
          ...state.trainSessions,
          [trainSession.language]: trainSession
        }
      }
    }
  },
  defaultState
)

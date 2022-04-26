import { handleActions } from 'redux-actions'
import { botsReceived } from '~/actions'

export interface BotsReducer {
  bots: { id: string; name: string }[]
}

const defaultState = {
  bots: undefined
}

const reducer = handleActions(
  {
    [botsReceived as any]: (state, { payload }) => ({ ...state, bots: payload || [] })
  },
  defaultState
)

export default reducer

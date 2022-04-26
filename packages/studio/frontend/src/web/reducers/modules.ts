import { handleActions } from 'redux-actions'
import { modulesReceived } from '~/actions'

const defaultState = []

const reducer = handleActions(
  {
    [modulesReceived as any]: (state, { payload }) => [...payload]
  },
  defaultState
)

export default reducer

import { handleActions } from 'redux-actions'
import { userBotPermissionsReceived, userReceived } from '~/actions'

const defaultState = {}

export interface UserReducer {
  email: string
  fullName: string
  isSuperAdmin: boolean
  permissions: any
}

const reducer = handleActions(
  {
    [userReceived as any]: (state, { payload }) => ({ ...state, ...payload }),
    [userBotPermissionsReceived as any]: (state, { payload }) => ({ ...state, ...payload })
  },
  defaultState as any
)

export default reducer

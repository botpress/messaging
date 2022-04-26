import { BotConfig } from 'botpress/sdk'
import { handleActions } from 'redux-actions'

import { botInfoReceived, botLicenseReceived } from '~/actions'

const defaultState = {
  bot: {},
  license: false
}

export interface BotReducer {
  bot: BotConfig
  isCloudBot: boolean
  // TODO cleanup
  //  type and name for "license" this might change
  license: any
}

const reducer = handleActions(
  {
    [botInfoReceived as any]: (state, { payload }) => ({ ...state, bot: payload }),
    [botLicenseReceived as any]: (state, { payload }) => ({ ...state, license: payload })
  },
  defaultState as any
)

export default reducer

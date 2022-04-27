import axios from 'axios'
import { createAction } from 'redux-actions'

export const botInfoReceived = createAction('BOT/INFO_RECEIVED')
export const fetchBotInformation = () => (dispatch) => {
  // eslint-disable-next-line @typescript-eslint/no-floating-promises
  axios.get(`${window.STUDIO_API_PATH}/config`).then((res) => {
    dispatch(botInfoReceived(res.data))
  })
}

export const botsReceived = createAction('BOTS/RECEIVED')
export const fetchBotIds = () => (dispatch) => {
  // eslint-disable-next-line @typescript-eslint/no-floating-promises
  axios.get(`${window.BOT_API_PATH}/workspaceBotsIds`).then((res) => {
    dispatch(botsReceived(res.data))
  })
}

export const botLicenseReceived = createAction('BOT-LICENSE/RECEIVED')
export const fetchBotLicense = () => (dispatch) => {
  // TODO cleanup this is purely a mock
  // should be an object of every feature enabled or disabled for a bot
  const data = {
    isPro: true
  }
  dispatch(botLicenseReceived(data))
}

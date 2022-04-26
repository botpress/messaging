import axios from 'axios'
import { createAction } from 'redux-actions'

export const intentsReceived = createAction('INTENTS/RECEIVED')
export const refreshIntents = () => (dispatch) => {
  // eslint-disable-next-line @typescript-eslint/no-floating-promises
  axios.get(`${window.STUDIO_API_PATH}/nlu/intents`).then(({ data }) => {
    dispatch(intentsReceived(data))
  })
}

export const trainSessionReceived = createAction('TRAIN_SESSION/RECEIVED')

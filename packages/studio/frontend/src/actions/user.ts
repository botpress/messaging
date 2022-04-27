import { createAction } from 'redux-actions'

//TODO cleanup
const JWT =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImxvbEBsby5jb20iLCJ0b2tlblZlcnNpb24iOjEsImZ1bGxOYW1lIjoiSnVzdGluIFRydWRlYXUiLCJpc1N1cGVyQWRtaW4iOnRydWV9.X5Q6D9P2TGrUvVlmpzLRKy1K0Db_W9qcRzDWCM9V6rg'

export const userReceived = createAction('USER/RECEIVED')
export const fetchUser = () => (dispatch) => {
  // TODO cleaup
  // receive token from auth
  const [, payload] = JWT.split('.')
  const jwtUser = JSON.parse(atob(payload))
  dispatch(userReceived({ ...jwtUser, token: JWT }))
}

export const userBotPermissionsReceived = createAction('USER-BOT-PERMISSIONS/RECEIVED')
export const fetchUserBotPermissions = () => (dispatch) => {
  // TODO cleanup
  // fetch permission with user token and receive user bot premission from cloud
  const data = { '*': 'rw' }
  dispatch(userBotPermissionsReceived({ permissions: data }))
}

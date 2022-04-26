import axios from 'axios'
import { createAction } from 'redux-actions'

export const viewModeChanged = createAction('UI/VIEW_MODE_CHANGED')
export const updateGlobalStyle = createAction('UI/UPDATE_GLOBAL_STYLE')
export const addDocumentationHint = createAction('UI/ADD_DOCUMENTATION_HINT')
export const removeDocumentationHint = createAction('UI/REMOVE_DOCUMENTATION_HINT')
export const updateDocumentationModal = createAction('UI/UPDATE_DOCUMENTATION_MODAL')
export const toggleBottomPanel = createAction('UI/TOGGLE_BOTTOM_PANEL')
export const toggleInspector = createAction('UI/TOGGLE_INSPECTOR')
export const toggleExplorer = createAction('UI/TOGGLE_EXPLORER')
export const toggleBottomPanelExpand = createAction('UI/TOGGLE_BOTTOM_PANEL_EXPAND')
export const zoomToLevel = createAction('UI/ZOOM_TO_LEVEL_DIAGRAM')
export const setEmulatorOpen = createAction('EMULATOR_OPENED')
export const changeContentLanguage = createAction('LANGUAGE/CONTENT_LANGUAGE', (contentLang) => ({ contentLang }))

export const hintsReceived = createAction('HINTS/RECEIVED')
export const refreshHints = () => (dispatch) => {
  // eslint-disable-next-line @typescript-eslint/no-floating-promises
  axios.get(`${window.STUDIO_API_PATH}/hints`).then((res) => {
    dispatch(hintsReceived(res.data))
  })
}

import _ from 'lodash'
import { handleActions } from 'redux-actions'
import {
  addDocumentationHint,
  removeDocumentationHint,
  setEmulatorOpen,
  toggleBottomPanelExpand,
  toggleBottomPanel,
  toggleInspector,
  toggleExplorer,
  updateDocumentationModal,
  updateGlobalStyle,
  viewModeChanged,
  zoomToLevel
} from '~/actions'
import storage from '~/components/Shared/lite-utils/storage'

export interface UiReducer {
  viewMode: any
  docHints: string[]
  explorerOpen: boolean
  emulatorOpen: boolean
  zoomLevel: number
  bottomPanel: boolean
  bottomPanelExpanded: boolean
  inspectorEnabled: boolean
  setEmulatorOpen: (newState: boolean) => void
}

const bottomPanelStorageKey = `bp::${window.BOT_ID}::bottom-panel-open`
const inspectorEnabledStorageKey = `bp::${window.BOT_ID}::enable-inspector`
const explorerStorageKey = `bp::${window.BOT_ID}::explorer-open`

const defaultBottomPanelOpen = storage.get<boolean>(bottomPanelStorageKey) === true
const defaultInspectorEnabled = storage.get<boolean>(inspectorEnabledStorageKey) === true
const storageExplorerOpen = storage.get<boolean>(explorerStorageKey)
const defaultExplorerOpen = storageExplorerOpen === undefined || storageExplorerOpen === true

const defaultState = {
  viewMode: -1,
  customStyle: {},
  docHints: [],
  docModal: null,
  bottomPanel: defaultBottomPanelOpen || false,
  bottomPanelExpanded: false,
  inspectorEnabled: defaultInspectorEnabled,
  explorerOpen: defaultExplorerOpen,
  emulatorOpen: false,
  zoomLevel: 100
}

const reducer = handleActions(
  {
    [viewModeChanged as any]: (state, { payload }) => ({
      ...state,
      viewMode: payload.toString()
    }),
    [updateGlobalStyle as any]: (state, { payload }) => ({
      ...state,
      customStyle: Object.assign({}, state.customStyle, payload)
    }),
    [addDocumentationHint as any]: (state, { payload }) => ({
      ...state,
      docHints: _.uniq([payload, ...state.docHints])
    }),
    [removeDocumentationHint as any]: (state, { payload }) => ({
      ...state,
      docHints: _.without(state.docHints, payload)
    }),
    [updateDocumentationModal as any]: (state, { payload }) => ({
      ...state,
      docModal: payload
    }),
    [toggleBottomPanelExpand as any]: (state) => ({
      ...state,
      bottomPanelExpanded: !state.bottomPanelExpanded
    }),
    [toggleBottomPanel as any]: (state, {}) => {
      const value = !state.bottomPanel
      storage.set(bottomPanelStorageKey, value)
      return {
        ...state,
        bottomPanel: value
      }
    },
    [toggleInspector as any]: (state, {}) => {
      const value = !state.inspectorEnabled
      storage.set(inspectorEnabledStorageKey, value)
      return {
        ...state,
        inspectorEnabled: value
      }
    },
    [toggleExplorer as any]: (state, {}) => {
      const value = !state.explorerOpen
      storage.set(explorerStorageKey, value)
      return {
        ...state,
        explorerOpen: value
      }
    },
    [zoomToLevel as any]: (state, { payload }) => {
      return {
        ...state,
        zoomLevel: payload
      }
    },
    [setEmulatorOpen as any]: (state, { payload }) => ({
      ...state,
      emulatorOpen: payload
    })
  },
  defaultState as any
)

export default reducer

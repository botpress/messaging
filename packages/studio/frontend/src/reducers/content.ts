import { handleActions } from 'redux-actions'

import {
  receiveContentCategories,
  receiveContentItem,
  receiveContentItemsBatched,
  receiveContentItems,
  receiveContentItemsCount,
  receiveLibrary,
  receiveQNAContentElement
} from '../actions'
import { Categories, LibraryElement } from '../common/typings'
const defaultState = {
  categories: { enabled: [], disabled: [] },
  currentItems: [],
  itemsById: {},
  itemsCount: 0
}

export default handleActions(
  {
    [receiveContentCategories as any]: (state, { payload }) => ({
      ...state,
      categories: payload
    }),

    [receiveContentItems as any]: (state, { payload }) => ({
      ...state,
      currentItems: payload
    }),

    [receiveContentItem as any]: (state, { payload }) => ({
      ...state,
      itemsById: {
        ...state.itemsById,
        [payload.id]: payload
      }
    }),

    [receiveContentItemsBatched as any]: (state, { payload }) => ({
      ...state,
      itemsById: {
        ...state.itemsById,
        ...payload
      }
    }),

    [receiveContentItemsCount as any]: (state, { payload }) => ({
      ...state,
      itemsCount: payload.data.count
    }),

    [receiveQNAContentElement as any]: (state, { payload }) => ({
      ...state,
      qnaUsage: payload
    }),

    [receiveLibrary as any]: (state, { payload }) => ({
      ...state,
      library: payload
    })
  },
  defaultState as any
)

export interface ContentReducer {
  categories: Categories
  currentItems: any
  qnaUsage: any
  library: LibraryElement[]
}

import axios from 'axios'
import * as sdk from 'botpress/sdk'
import { createAction } from 'redux-actions'
import BatchRunner from './BatchRunner'

export const receiveContentCategories = createAction('CONTENT/CATEGORIES/RECEIVE')
export const fetchContentCategories = () => (dispatch) =>
  axios.get(`${window.STUDIO_API_PATH}/cms/types`).then(({ data }) => {
    dispatch(receiveContentCategories(data))
  })

export const receiveContentItems = createAction('CONTENT/ITEMS/RECEIVE')
export const fetchContentItems =
  ({
    contentType,
    ...query
  }: {
    contentType: string
  } & sdk.SearchParams) =>
  (dispatch) => {
    const type = contentType && contentType !== 'all' ? `${contentType}/` : ''

    return axios
      .post(`${window.STUDIO_API_PATH}/cms/${type}elements`, query)
      .then(({ data }) => dispatch(receiveContentItems(data)))
  }

const getBatchedContentItems = (ids) =>
  axios.post(`${window.STUDIO_API_PATH}/cms/elements`, { ids }).then(({ data }) =>
    data.reduce((acc, item) => {
      acc[item.id] = item
      return acc
    }, {})
  )

const getBatchedContentRunner = BatchRunner(getBatchedContentItems)

const getBatchedContentItem = (id, dispatch) => getBatchedContentRunner.add(id, dispatch)

const getSingleContentItem = (id) => axios.get(`${window.STUDIO_API_PATH}/cms/element/${id}`).then(({ data }) => data)

export const receiveContentItemsBatched = createAction('CONTENT/ITEMS/RECEIVE_BATCHED')
export const receiveContentItem = createAction('CONTENT/ITEMS/RECEIVE_ONE')
export const fetchContentItem =
  (id: string, { force = false, batched = false } = {}) =>
  (dispatch, getState) => {
    if (!id || (!force && getState().content.itemsById[id])) {
      return Promise.resolve()
    }

    return batched
      ? getBatchedContentItem(id, dispatch)
      : getSingleContentItem(id).then((data) => {
          data && dispatch(receiveContentItem(data))
        })
  }

export const receiveContentItemsCount = createAction('CONTENT/ITEMS/RECEIVE_COUNT')
export const fetchContentItemsCount =
  (contentType = 'all') =>
  (dispatch) =>
    axios
      .get(`${window.STUDIO_API_PATH}/cms/elements/count`, { params: { contentType } })
      .then((data) => dispatch(receiveContentItemsCount(data)))

export const upsertContentItem =
  ({ contentType, formData, modifyId }: Pick<sdk.ContentElement, 'contentType' | 'formData'> & { modifyId: string }) =>
  () =>
    axios.post(`${window.STUDIO_API_PATH}/cms/${contentType}/element/${modifyId || ''}`, { formData })

export const deleteContentItems = (data) => () => axios.post(`${window.STUDIO_API_PATH}/cms/elements/bulk_delete`, data)
export const deleteMedia = (data: sdk.FormData) => () => axios.post(`${window.STUDIO_API_PATH}/media/delete`, data)

export const receiveLibrary = createAction('LIBRARY/RECEIVED')
export const refreshLibrary = () => (dispatch, getState) => {
  const contentLang = getState().language.contentLang
  // eslint-disable-next-line @typescript-eslint/no-floating-promises
  axios.get(`${window.STUDIO_API_PATH}/cms/library/${contentLang}`).then(({ data }) => {
    dispatch(receiveLibrary(data))
  })
}

export const addElementToLibrary = (elementId: string) => (dispatch) => {
  // eslint-disable-next-line @typescript-eslint/no-floating-promises
  axios.post(`${window.STUDIO_API_PATH}/cms/library/${elementId}`).then(() => {
    dispatch(refreshLibrary())
  })
}

export const removeElementFromLibrary = (elementId: string) => (dispatch) => {
  // eslint-disable-next-line @typescript-eslint/no-floating-promises
  axios.post(`${window.STUDIO_API_PATH}/cms/library/${elementId}/delete`).then(() => {
    dispatch(refreshLibrary())
  })
}

export const receiveQNAContentElement = createAction('QNA/CONTENT_ELEMENT')
export const getQNAContentElementUsage = () => (dispatch) => {
  // eslint-disable-next-line @typescript-eslint/no-floating-promises
  axios.get(`${window.STUDIO_API_PATH}/qna/contentElementUsage`).then(({ data }) => {
    dispatch(receiveQNAContentElement(data))
  })
}

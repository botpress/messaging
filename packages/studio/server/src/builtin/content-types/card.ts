import { ContentType } from 'botpress/sdk'
import utils from './_utils'
import actionButton from './action_button'

export const cardSchema = {
  description: 'contentTypes.card.description',
  type: 'object',
  required: ['title'],
  properties: {
    title: {
      type: 'string',
      title: 'title'
    },
    subtitle: {
      type: 'string',
      title: 'subtitle'
    },
    image: {
      type: 'string',
      $subtype: 'image',
      $filter: '.jpg, .png, .jpeg, .gif, .bmp, .tif, .tiff|image/*',
      title: 'image'
    },
    actions: {
      type: 'array',
      title: 'contentTypes.card.actionButtons',
      items: actionButton.jsonSchema
    }
  }
}

const contentType: ContentType = {
  id: 'builtin_card',
  group: 'Built-in Messages',
  title: 'contentTypes.card.title',
  jsonSchema: cardSchema,
  uiSchema: {},

  computePreviewText: (formData) => formData.title && `Card: ${formData.title}`,
  renderElement: (data) => utils.extractPayload('card', data)
}

export default contentType

import { ContentType } from 'botpress/sdk'
import base from './_base'
import utils from './_utils'

const contentType: ContentType = {
  id: 'builtin_text',
  group: 'Built-in Messages',
  title: 'text',

  jsonSchema: {
    description: 'contentTypes.text.description',
    type: 'object',
    required: ['text'],
    properties: {
      text: {
        type: 'string',
        title: 'contentTypes.text.message'
      },
      variations: {
        type: 'array',
        title: 'contentTypes.text.alternatives',
        items: {
          type: 'string',
          default: ''
        }
      },
      ...base.useMarkdown,
      ...base.typingIndicators
    }
  },

  uiSchema: {
    text: {
      'ui:field': 'i18n_field',
      $subtype: 'textarea'
    },
    variations: {
      'ui:options': {
        orderable: false
      }
    }
  },
  computePreviewText: (formData) => formData.text,
  renderElement: (data) => {
    return utils.extractPayload('text', data)
  }
}

export default contentType

import { ContentType } from 'botpress/sdk'
import base from './_base'
import utils from './_utils'

const contentType: ContentType = {
  id: 'builtin_audio',
  group: 'Built-in Messages',
  title: 'contentTypes.audio.title',

  jsonSchema: {
    description: 'contentTypes.audio.description',
    type: 'object',
    $subtype: 'audio',
    required: ['audio'],
    properties: {
      audio: {
        type: 'string',
        $subtype: 'audio',
        $filter: '.mp3',
        title: 'contentTypes.audio.title'
      },
      title: {
        type: 'string',
        title: 'contentTypes.audio.audioLabel'
      },
      ...base.typingIndicators
    }
  },

  uiSchema: {
    title: {
      'ui:field': 'i18n_field'
    }
  },

  computePreviewText: (formData) => {
    if (!formData.audio) {
      return ''
    }

    const link = utils.formatURL(formData.BOT_URL, formData.audio)
    const title = formData.title ? ' | ' + formData.title : ''

    if (utils.isUrl(link)) {
      const fileName = utils.extractFileName(formData.audio)
      return `Audio: (${fileName}) ${title}`
    } else {
      return `Expression: ${link}${title}`
    }
  },

  renderElement: (data) => utils.extractPayload('audio', data)
}

export default contentType

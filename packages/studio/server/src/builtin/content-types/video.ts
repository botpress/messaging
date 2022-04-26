import { ContentType } from 'botpress/sdk'
import base from './_base'
import utils from './_utils'

const contentType: ContentType = {
  id: 'builtin_video',
  group: 'Built-in Messages',
  title: 'contentTypes.video.title',

  jsonSchema: {
    description: 'contentTypes.video.description',
    type: 'object',
    $subtype: 'video',
    required: ['video'],
    properties: {
      video: {
        type: 'string',
        $subtype: 'video',
        $filter: '.mp4',
        title: 'contentTypes.video.title'
      },
      title: {
        type: 'string',
        title: 'contentTypes.video.videoLabel'
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
    if (!formData.video) {
      return ''
    }

    const link = utils.formatURL(formData.BOT_URL, formData.video)
    const title = formData.title ? ' | ' + formData.title : ''

    if (utils.isUrl(link)) {
      const fileName = utils.extractFileName(formData.video)
      return `Video: (${fileName}) ${title}`
    } else {
      return `Expression: ${link}${title}`
    }
  },
  renderElement: (data) => utils.extractPayload('video', data)
}

export default contentType

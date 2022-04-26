import { ContentType } from 'botpress/sdk'
import base from './_base'
import utils from './_utils'

const contentType: ContentType = {
  id: 'builtin_file',
  group: 'Built-in Messages',
  title: 'contentTypes.file.title',

  jsonSchema: {
    description: 'contentTypes.file.description',
    type: 'object',
    $subtype: 'file',
    required: ['file'],
    properties: {
      file: {
        type: 'string',
        $subtype: 'file',
        $filter: '.pdf',
        title: 'contentTypes.file.title'
      },
      title: {
        type: 'string',
        title: 'contentTypes.file.fileLabel'
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
    if (!formData.file) {
      return ''
    }

    const link = utils.formatURL(formData.BOT_URL, formData.file)
    const title = formData.title ? ' | ' + formData.title : ''

    if (utils.isUrl(link)) {
      const fileName = utils.extractFileName(formData.file)
      return `File: (${fileName}) ${title}`
    } else {
      return `Expression: ${link}${title}`
    }
  },

  renderElement: (data) => utils.extractPayload('file', data)
}

export default contentType

export default {
  typingIndicators: {
    typing: {
      type: 'boolean',
      title: 'contentTypes.typingIndicator',
      default: true
    }
  },
  useMarkdown: {
    markdown: {
      type: 'boolean',
      title: 'contentTypes.useMarkdown',
      default: true,
      $help: {
        text: 'contentTypes.markdownHelp',
        link: 'https://daringfireball.net/projects/markdown/syntax'
      }
    }
  }
}

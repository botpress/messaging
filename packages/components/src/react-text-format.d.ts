declare module 'react-text-format' {
  interface Props {
    allowedFormats?: ('URL' | 'Email' | 'Image' | 'Phone' | 'CreditCard' | 'Term')[]
    linkTarget?: '_blank' | '_self' | '_parent' | '_top' | 'framename'
    terms?: string[]
    linkDecorator?: (decoratedHref: string, decoratedText: string, linkTarget: string) => React.Component
    emailDecorator?: (decoratedHref: string, decoratedText: string) => React.Component
    phoneDecorator?: (decoratedText: string) => React.Component
    creditCardDecorator?: (decoratedText: string) => React.Component
    imageDecorator?: (decoratedURL: string) => React.Component
    termDecorator?: (decoratedText: string) => React.Component
  }

  export default class ReactFormatter extends React.Component<Props> {}
}

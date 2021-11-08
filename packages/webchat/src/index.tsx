import { configure } from 'mobx'
import { observer, Provider } from 'mobx-react'
import React from 'react'
import { IntlProvider } from 'react-intl'

import Chat from './main'
import { RootStore } from './store'
import { defaultLocale, translations } from './translations'
import { Config } from './typings'
configure({ enforceActions: 'observed' })

export const Embedded = (props: any) => new Wrapper({ ...props, fullscreen: false })
export const Fullscreen = (props: any) => new Wrapper({ ...props, fullscreen: true })

interface State {
  store: RootStore
}

interface Props {
  config: Config
  fullscreen?: boolean
}

export class ExposedWebChat extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)

    this.state = {
      store: new RootStore({ fullscreen: props.fullscreen! })
    }
  }

  render() {
    const store = this.state.store
    const { botUILanguage: locale } = store

    return (
      <Provider store={store}>
        <IntlProvider locale={locale} messages={translations[locale]} defaultLocale={defaultLocale}>
          <React.Fragment>
            <Chat store={store} {...this.props} />
          </React.Fragment>
        </IntlProvider>
      </Provider>
    )
  }
}

// TODO: what does this observer do?
const Wrapper = observer(ExposedWebChat)

/**
 * @deprecated Since the way views are handled has changed, we're also exporting views in lowercase.
 * https://botpress.com/docs/developers/migrate/
 */
export { Embedded as embedded } from '.'
export { Fullscreen as fullscreen } from '.'

export * from './typings'
export {
  Carousel,
  QuickReplies,
  LoginPrompt,
  Text,
  FileMessage,
  FileInput,
  Button
} from './components/messages/renderer'

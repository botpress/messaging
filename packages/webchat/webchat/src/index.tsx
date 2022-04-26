import { configure } from 'mobx'
import { observer, Provider } from 'mobx-react'
import React from 'react'
import { IntlProvider } from 'react-intl'

import Chat from './main'
import { RootStore } from './store'
import { defaultLocale, translations } from './translations'
import { Config } from './typings'
import BPStorage from './utils/storage'

configure({ enforceActions: 'observed' })

interface State {
  store: RootStore
}

interface Props {
  config?: Config
  fullscreen?: boolean
}

export class ExposedWebChat extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)

    window.BP_STORAGE = new BPStorage(props.config)

    this.state = {
      store: new RootStore({ fullscreen: props.fullscreen! }, props.config)
    }
  }

  render() {
    const store = this.state.store
    const { botUILanguage: locale } = store

    return (
      <Provider store={store}>
        <IntlProvider locale={locale} messages={translations[locale || defaultLocale]} defaultLocale={defaultLocale}>
          <Chat {...this.props} />
        </IntlProvider>
      </Provider>
    )
  }
}

const Wrapper = observer(ExposedWebChat)

export const Embedded = (props: Props) => new Wrapper({ ...props, fullscreen: false })
export const Fullscreen = (props: Props) => new Wrapper({ ...props, fullscreen: true })

export * from './typings'

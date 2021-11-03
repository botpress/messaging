// TODO: figure out what to do with this
// import '@blueprintjs/core/lib/css/blueprint.css'
import { configure } from 'mobx'
import { observer, Provider } from 'mobx-react'
import React from 'react'
import { IntlProvider } from 'react-intl'

import Chat from './main'
import { RootStore } from './store'
import { defaultLocale, translations } from './translations'
configure({ enforceActions: 'observed' })

export const Embedded = (props: any) => new Wrapper(props, false)
export const Fullscreen = (props: any) => new Wrapper(props, true)

interface State {
  fullscreen: any
  store: RootStore
}

interface Props {}

export class ExposedWebChat extends React.Component<Props, State> {
  constructor(props: any, fullscreen: any) {
    super(props)

    this.state = {
      fullscreen,
      store: new RootStore({ fullscreen })
    }

    this.state.store.updateConfig({} as any)
  }

  render() {
    const { fullscreen } = this.state
    const store = this.state.store
    const { botUILanguage: locale } = store

    return (
      <div>
        <h3>This is the bp webchat</h3>
        <Provider store={store}>
          <IntlProvider locale={locale} messages={translations[locale]} defaultLocale={defaultLocale}>
            <React.Fragment>
              <Chat store={store} {...this.props} />
            </React.Fragment>
          </IntlProvider>
        </Provider>
      </div>
    )
  }
}

const Wrapper = observer(ExposedWebChat)

/**
 * @deprecated Since the way views are handled has changed, we're also exporting views in lowercase.
 * https://botpress.com/docs/developers/migrate/
 */
export { Embedded as embedded } from '.'
export { Fullscreen as fullscreen } from '.'

export {
  Carousel,
  QuickReplies,
  LoginPrompt,
  Text,
  FileMessage,
  FileInput,
  Button
} from './components/messages/renderer'

import { configure } from 'mobx'
import { Provider } from 'mobx-react'
import React from 'react'
import { Container } from '~/components/Shared/Interface'

import Editor from './Editor'
import SidePanel from './SidePanel'
import { RootStore } from './store'

configure({ enforceActions: 'observed' })

export default class CodeEditor extends React.Component {
  private store: RootStore

  constructor(props) {
    super(props)
    this.store = new RootStore()
  }

  componentDidMount() {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    this.store.initialize()
  }

  render() {
    const keyMap = { newFile: 'ctrl+alt+n' }
    const keyHandlers = { newFile: this.store.createNewAction }

    return (
      <Provider store={this.store}>
        <Container keyHandlers={keyHandlers} keyMap={keyMap}>
          <SidePanel />
          <Editor />
        </Container>
      </Provider>
    )
  }
}

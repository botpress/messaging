import '@blueprintjs/core/lib/css/blueprint.css'

import axios from 'axios'
import React from 'react'
import ReactDOM from 'react-dom'
import { HotKeys } from 'react-hotkeys'
import { Provider } from 'react-redux'

import './style.scss'
import 'bootstrap/dist/css/bootstrap.css'
import '@projectstorm/react-diagrams/dist/style.min.css'
import './theme.scss'

import { keyMap } from './components/Shared/utilities/keyboardShortcuts'
import store from './store'
import { initializeTranslations } from './translations'

window['STUDIO_API_URL'] = 'http://localhost:3300'

void axios.get<object>(`${window['STUDIO_API_URL']}${window.location.pathname}/env`).then((d) => {
  for (const [key, value] of Object.entries(d.data)) {
    window[key] = value
  }

  initializeTranslations()

  // TODO: This is not the way to go
  // Do not use "import App from ..." as hoisting will screw up styling
  const App = require('./components/App').default

  ReactDOM.render(
    <Provider store={store}>
      <HotKeys keyMap={keyMap}>
        <App />
      </HotKeys>
    </Provider>,
    document.getElementById('app')
  )
})

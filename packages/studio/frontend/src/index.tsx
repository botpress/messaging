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
import { getToken } from './components/Shared/auth'
import { keyMap } from './components/Shared/utilities/keyboardShortcuts'
import store from './store'
import { initializeTranslations } from './translations'

const token = getToken()
if (token) {
  if ((window as any).USE_JWT_COOKIES) {
    // TODO: remove all CSRF notion in studio
  } else {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
  }
}

if (!window.BOT_ID) {
  console.error("This bot doesn't exist. Redirecting to admin ")
  window.location.href = `${window.ROOT_PATH}/admin`
} else {
  initializeTranslations()

  // Do not use "import App from ..." as hoisting will screw up styling
  // @ts-ignore
  const App = require('./components/App').default

  ReactDOM.render(
    <Provider store={store}>
      <HotKeys keyMap={keyMap}>
        <App />
      </HotKeys>
    </Provider>,
    document.getElementById('app')
  )
}

// TODO: what ?
// telemetry.startFallback(axios.create({ baseURL: window.API_PATH })).catch()

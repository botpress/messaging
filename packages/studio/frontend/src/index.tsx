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

window.SEND_USAGE_STATS = true
window['USE_JWT_COOKIES'] = false
window.EXPERIMENTAL = false
window.SOCKET_TRANSPORTS = ['websocket', 'polling']
window['SHOW_POWERED_BY'] = true
window.UUID = '2a50fc965d1f69a1e9eaaa2c3ca0c55dd589f89e6ea6ad5b4fab11656798963b'
window.BP_SERVER_URL = ''
window.IS_STANDALONE = true
window['STUDIO_VERSION'] = '13.0.0'
window.ANALYTICS_ID = 'UA-90044826-3'
window.API_PATH = 'http://localhost:3000/api/v1'
window.BOT_API_PATH = 'http://localhost:3000/api/v1/bots/gggg'
window.STUDIO_API_PATH = 'http://localhost:3000/api/v1/studio/gggg'
window.BOT_ID = 'gggg'
window.BP_BASE_PATH = '/studio/gggg'
window.APP_NAME = 'Botpress Studio'
window.APP_FAVICON = 'assets/ui-studio/public/img/favicon.png'
window.APP_CUSTOM_CSS = ''
window.BOT_LOCKED = false
window.IS_BOT_MOUNTED = true // TODO: fix this .. the bot might not mount
window.IS_CLOUD_BOT = true
window.SEGMENT_WRITE_KEY = '7lxeXxbGysS04TvDNDOROQsFlrls9NoY'
window['IS_PRO_ENABLED'] = false
window.NLU_ENDPOINT = 'undefined'

window['BP_SOCKET_URL'] = 'http://localhost:3000'

void axios.get(`${window.STUDIO_API_PATH}/flows`).then((d) => {
  console.log(d.data)
})

initializeTranslations()

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

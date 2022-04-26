import '@blueprintjs/core/lib/css/blueprint.css'
import axios from 'axios'
// @ts-ignore
import React from 'expose-loader?React!react'
// @ts-ignore
import ReactDOM from 'expose-loader?ReactDOM!react-dom'
import { HotKeys } from 'react-hotkeys'
import { Provider } from 'react-redux'
// import { CSRF_TOKEN_HEADER } from 'common/auth'

// Required to fix outline issue
import './style.scss'
import 'expose-loader?ReactSelect!react-select'
import 'expose-loader?PropTypes!prop-types'
import 'expose-loader?ReactBootstrap!react-bootstrap'
import 'expose-loader?Reactstrap!reactstrap' // TODO Remove me once we migrated to blueprint
import 'expose-loader?BlueprintJsCore!@blueprintjs/core'
import 'expose-loader?BlueprintJsSelect!@blueprintjs/select'
import 'expose-loader?BotpressContentTypePicker!~/components/Content/Select'
import 'expose-loader?BotpressContentPicker!~/components/Content/Select/Widget'
import 'expose-loader?SmartInput!~/components/SmartInput'
import 'expose-loader?ElementsList!~/components/Shared/ElementsList'
import 'expose-loader?SelectActionDropdown!~/views/FlowBuilder/nodeProps/SelectActionDropdown'
import 'expose-loader?BotpressTooltip!~/components/Shared/ToolTip'
import 'expose-loader?BotpressUI!~/components/Shared/Interface'
import 'expose-loader?BotpressUtils!~/components/Shared/Utils'
import 'expose-loader?DocumentationProvider!~/components/Util/DocumentationProvider'

import 'bootstrap/dist/css/bootstrap.css'
import 'storm-react-diagrams/dist/style.min.css'
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

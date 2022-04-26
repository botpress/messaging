import axios from 'axios'
import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import {
  fetchBotInformation,
  fetchModules,
  fetchSkills,
  fetchUser,
  getModuleTranslations,
  handleReceiveFlowsModification,
  refreshHints
} from '~/actions'
import { authEvents, setToken } from '~/util/Auth'
import EventBus from '~/util/EventBus'

import Routes, { history } from '../Routes'
import TokenRefresher from '../Shared/TokenRefresher'

interface Props {
  fetchModules: () => void
  fetchSkills: () => void
  refreshHints: () => void
  fetchBotInformation: () => void
  getModuleTranslations: () => void
  fetchUser: () => void
  handleReceiveFlowsModification: (modifications: any) => void
  user: any
}

class App extends Component<Props> {
  fetchData = () => {
    this.props.getModuleTranslations()
    this.props.fetchBotInformation()
    this.props.fetchModules()
    this.props.fetchSkills()
    this.props.fetchUser()
    if (window.IS_BOT_MOUNTED) {
      this.props.refreshHints()
    }
  }

  // Prevents re-rendering the whole layout when the user changes. Fixes a bunch of warnings & double queries
  shouldComponentUpdate() {
    return false
  }

  componentDidMount() {
    const appName = window.APP_NAME || 'Botpress Studio'
    const botName = window.BOT_ID ? ` – ${window.BOT_ID}` : ''
    window.document.title = `${appName}${botName}`

    if (window.APP_FAVICON) {
      const link = document.querySelector('link[rel="icon"]')
      link.setAttribute('href', window.APP_FAVICON)
    }

    if (window.APP_CUSTOM_CSS) {
      const sheet = document.createElement('link')
      sheet.rel = 'stylesheet'
      sheet.href = window.APP_CUSTOM_CSS
      sheet.type = 'text/css'
      document.head.appendChild(sheet)
    }

    EventBus.default.setup()

    // This acts as the app lifecycle management.
    // If this grows too much, move to a dedicated lifecycle manager.
    this.fetchData()

    authEvents.on('login', this.fetchData)
    authEvents.on('new_token', this.fetchData)

    EventBus.default.on('flow.changes', (payload) => {
      // TODO: should check if real uniq Id is different. Multiple browser windows can be using the same email. There should be a uniq window Id.
      const isOtherUser = this.props.user.email !== payload.userEmail
      const isSameBot = payload.botId === window.BOT_ID
      if (isOtherUser && isSameBot) {
        this.props.handleReceiveFlowsModification(payload)
      }
    })

    EventBus.default.on('hints.updated', () => {
      this.props.refreshHints()
    })

    window.addEventListener('message', (e) => {
      if (!e.data || !e.data.action) {
        return
      }

      const { action, payload } = e.data
      if (action === 'navigate-url') {
        history.push(payload)
      }
    })
  }

  render() {
    return (
      <Fragment>
        {!window.IS_STANDALONE && (
          <TokenRefresher getAxiosClient={() => axios} onRefreshCompleted={(token) => setToken(token)} />
        )}
        <Routes />
      </Fragment>
    )
  }
}

const mapDispatchToProps = {
  fetchUser,
  fetchBotInformation,
  fetchModules,
  fetchSkills,
  refreshHints,
  handleReceiveFlowsModification,
  getModuleTranslations
}

const mapStateToProps = (state) => ({
  user: state.user
})

export default connect(mapStateToProps, mapDispatchToProps)(App)

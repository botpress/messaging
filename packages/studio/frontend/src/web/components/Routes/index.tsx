import { createBrowserHistory } from 'history'
import queryString from 'query-string'
import React from 'react'
import ReactGA from 'react-ga'
import { connect } from 'react-redux'
import { Router, Switch } from 'react-router-dom'
import Layout from '~/components/Layout'
import injectSegment from '~/util/InjectSegment'

// react-router doesn't do query parsing anymore since V4
// https://github.com/ReactTraining/react-router/issues/4410
const addLocationQuery = (history) => {
  history.location = Object.assign(history.location, {
    query: queryString.parse(history.location.search)
  })
}

export const history = createBrowserHistory({ basename: window.BP_BASE_PATH + '/' })
addLocationQuery(history)
history.listen(() => {
  addLocationQuery(history)
  if (window.SEND_USAGE_STATS) {
    logPageView()
  }
})

const logPageView = () => {
  let page = history.location.pathname
  // Strips the bot path param so we get unified data
  if (page.startsWith('/flows')) {
    page = '/flows'
  }
  ReactGA.set({ page })
  ReactGA.pageview(page)
}

const RoutesRouter = (props) => {
  if (window.SEND_USAGE_STATS) {
    injectSegment(props.user)

    ReactGA.initialize(window.ANALYTICS_ID, {
      gaOptions: {
        userId: window.UUID
      }
    })
  }
  const AuthenticatedLayout = Layout

  return (
    <Router history={history}>
      <Switch>
        <AuthenticatedLayout />
      </Switch>
    </Router>
  )
}

const mapStateToProps = (state) => ({
  user: state.user
})

const mapDispatchToProps = {}

export default connect(mapStateToProps, mapDispatchToProps)(RoutesRouter)

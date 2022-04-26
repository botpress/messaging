import segmentPlugin from '@analytics/segment'
import Analytics, { AnalyticsInstance, PageData } from 'analytics'
import hash from 'hash.js'
import { UserReducer } from '~/reducers/user'

const APP_NAME = 'STUDIO_ANALYTICS' // for reference, in case of second account

let analytics: AnalyticsInstance

const extractUserHashFromUser = (user: UserReducer): string | undefined => {
  if (user?.email) {
    return hash
      .sha256()
      .update('botpressUserEmail' + user.email)
      .digest('hex')
  }
}

const initSegmentAnalytics = () => {
  analytics = Analytics({
    app: APP_NAME,
    plugins: [
      segmentPlugin({
        writeKey: window.SEGMENT_WRITE_KEY
      })
    ]
  })

  void analytics.page()
}

export default (user: UserReducer): void => {
  const userEmailHash = extractUserHashFromUser(user)
  if (!userEmailHash) {
    return
  }

  initSegmentAnalytics()

  /**
   * The aim of the identify function is to get an idea of how many people are
   * using Botpress per machine.
   * userId is unset so Segment will generate an anonymous one.
   */
  void analytics.identify(null, {
    userEmailHash,
    machineUUID: window.UUID
  })
}

function trackEvent(eventName: string, payload?: any, options?: any, callback?: (...params: any[]) => any): void {
  if (analytics) {
    // analytics only defined if window.SEND_USAGE_STATS is true
    analytics.track(eventName, payload, options, callback).catch((e) => {
      console.error('Analytics error - event', e)
    })
  }
}

function trackPage(data?: PageData, options?: any, callback?: (...params: any[]) => any): void {
  if (analytics) {
    // analytics only defined if window.SEND_USAGE_STATS is true
    analytics.page(data, options, callback).catch((e) => {
      console.error('Analytics error - page', e)
    })
  }
}

export { trackEvent, trackPage }

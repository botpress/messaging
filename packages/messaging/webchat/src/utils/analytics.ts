import ReactGA from 'react-ga'

export const initializeAnalytics = () => {
  if (window.SEND_USAGE_STATS) {
    try {
      ReactGA.initialize('UA-90044826-2')
      ReactGA.pageview(`${window.location.pathname}${window.location.search}`)
    } catch (err) {
      console.error('Error initializing analytics', err)
    }
  }
}

export type MessageDirection = 'sent' | 'received'
export const trackMessage = (direction: MessageDirection) => {
  if (window.SEND_USAGE_STATS) {
    try {
      ReactGA.event({ category: 'Interactions', action: `message ${direction}` })
    } catch {}
  }
}

export type WebchatState = 'show' | 'hide' | 'toggle'
export const trackWebchatState = (state: WebchatState) => {
  if (window.SEND_USAGE_STATS) {
    try {
      ReactGA.event({ category: 'Display', action: state })
    } catch {}
  }
}

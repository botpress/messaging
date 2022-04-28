import { createAction } from 'redux-actions'

export const modulesReceived = createAction('MODULES/RECEIVED')
export const fetchModules = () => (dispatch) => {
  dispatch(
    modulesReceived([
      // TODO: Remove this as we will include the webchat in a different way
      /* {
        fullName: 'Web Chat',
        menuIcon: 'view_module',
        menuText: 'channel-web',
        moduleView: { stretched: false },
        noInterface: true,
        plugins: [{ entry: 'WebBotpressUIInjection', position: 'overlay' }],
        name: 'channel-web',
        homepage: 'https://botpress.com'
      } */
    ])
  )
}

export const receiveModuleTranslations = createAction('LANG/TRANSLATIONS')
export const getModuleTranslations = () => (dispatch) => {
  // TODO cleanup
  dispatch(receiveModuleTranslations([]))
}

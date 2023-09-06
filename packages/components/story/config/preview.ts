import '../../src/css/botpress-default.css'
import '../../src/css/theme-light.css'
import './custom.css'

export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/
    }
  }
}

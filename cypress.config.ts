import { defineConfig } from 'cypress'
import { sendMessage } from './test/cypress/support/tasks'
import { testConfig } from './test/cypress/test.config'

export default defineConfig({
  e2e: {
    baseUrl: testConfig.baseUrl,
    downloadsFolder: 'test/cypress/downloads',
    fixturesFolder: 'test/cypress/fixtures',
    screenshotsFolder: 'test/cypress/screenshots',
    videosFolder: 'test/cypress/videos',
    supportFile: 'test/cypress/support/index.ts',
    specPattern: '**/*.cy.ts',
    setupNodeEvents(on, config) {
      on('task', {
        sendMessage
      })
    }
  }
})

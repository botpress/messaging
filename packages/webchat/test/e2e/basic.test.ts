import { TYPING_DELAY, Util } from './util'

describe('Basic', () => {
  let util: Util

  before(() => {
    util = new Util()
  })

  it('Should load the webchat', async () => {
    await util.setup()

    cy.visit(`?config=${encodeURIComponent(JSON.stringify(util.config))}`)

    cy.get('.bpw-keyboard').should('exist')

    await new Promise((resolve) => {
      cy.window().then((win) => {
        util.window = win

        resolve(undefined)
      })
    })
  })

  it('Should be able to receive messages', (done) => {
    const message = 'This is a message'

    void util.sendMessage(message).then(() => {
      cy.get('.bpw-from-bot', { timeout: TYPING_DELAY }).should('contain', message)

      done()
    })
  })

  it('Should be able to send messages', () => {
    const userMessage = 'This is a reply'

    cy.get('.bpw-send-button').should('be.disabled')
    cy.get('.bpw-composer').type(userMessage, { delay: 100 })
    cy.get('.bpw-send-button').should('not.be.disabled').click()

    cy.get('.bpw-from-user').should('contain', userMessage)
  })
})

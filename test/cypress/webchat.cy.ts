const checkLifecycleEvent = (index: number, lifecycleType: string, alias?: string) => {
  cy.get(`@${alias || 'msg'}`)
    .invoke('getCall', index)
    .its('args.0.data.type')
    .should('equal', lifecycleType)
}

describe('Webchat', () => {
  it('webchat loads and lifecycle events are in the correct order', () => {
    cy.visit('webchat.html', {
      onBeforeLoad(win) {
        win.addEventListener('message', cy.spy().as('msg'))
      }
    })

    cy.openWebchat()

    cy.log('CONFIG.SET')
    checkLifecycleEvent(0, 'CONFIG.SET')
    cy.log('USER.CONNECTED')
    checkLifecycleEvent(1, 'USER.CONNECTED')
    cy.log('LIFECYCLE.LOADED')
    checkLifecycleEvent(2, 'LIFECYCLE.LOADED')
    cy.log('UI.OPENED')
    checkLifecycleEvent(4, 'UI.OPENED')
    cy.log('LIFECYCLE.READY')
    checkLifecycleEvent(7, 'LIFECYCLE.READY')
  })

  it('user is able to type a message and send it', () => {
    cy.visit('webchat.html')
    cy.openWebchat()

    cy.window().then((win) => {
      win.addEventListener('message', cy.spy().as('sent'))
    })

    cy.fixture('chat.json').then((chatMsg) => {
      cy.iframeBody().find('#btn-send').should('be.disabled')
      cy.iframeBody().find('.bpw-composer').type(chatMsg.userMessage, { delay: 100 })
      cy.iframeBody().find('#btn-send').should('not.be.disabled').click()
      cy.iframeBody().find('.bpw-from-user').should('contain', chatMsg.userMessage)
    })

    checkLifecycleEvent(0, 'MESSAGE.SENT', 'sent')
  })

  it('user can receive a message', function () {
    cy.visit('webchat.html')
    cy.openWebchat()

    cy.iframeBody().find('.bpw-composer')
    cy.iframeWindow().its('websocket.conversationId').as('conversationId')

    cy.window().then((win) => {
      win.addEventListener('message', cy.spy().as('received'))
    })

    cy.fixture('chat.json').then((chatMsg) => {
      cy.get('@conversationId').then((conversationId) => {
        cy.task('sendMessage', { message: chatMsg.botMessage, conversationId })
      })

      cy.iframeBody().find('.bpw-from-bot').should('contain', chatMsg.botMessage)
    })

    checkLifecycleEvent(0, 'MESSAGE.RECEIVED', 'received')
  })
})

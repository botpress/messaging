Cypress.Commands.add('iframeBody', { prevSubject: 'optional' }, (subject) => {
  if (subject) {
    cy.wrap(subject).its('0.contentDocument').should('exist').its('body').should('not.be.undefined').then(cy.wrap)
  } else {
    cy.get('#bp-web-widget')
      .its('0.contentDocument')
      .should('exist')
      .its('body')
      .should('not.be.undefined')
      .then(cy.wrap)
  }
})

Cypress.Commands.add('iframeWindow', { prevSubject: 'optional' }, (subject) => {
  if (subject) {
    cy.wrap(subject).its('0.contentWindow').should('exist')
  } else {
    cy.get('#bp-web-widget').its('0.contentWindow').should('exist')
  }
})

Cypress.Commands.add('openWebchat', () => {
  cy.iframeBody().find('.bpw-widget-btn').click()
  cy.iframeBody().contains('Back to Conversation').click()
})

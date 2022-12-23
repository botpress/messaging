declare global {
  namespace Cypress {
    interface Chainable {
      iframeBody: () => Chainable<JQuery<Element>>
      iframeWindow: () => Chainable<JQuery<Element>>
      openWebchat: () => Chainable<JQuery<Element>>
    }
  }
}

export {}

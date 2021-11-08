import { render, screen } from '@testing-library/react'
import { messageTypes } from 'content-typings'
import React from 'react'
import { Message } from 'typings'
import defaultRenderer, { defaultMessageConfig, defaultTypesRenderers, Renderer, renderMessage } from './'

describe('Renderer', () => {
  test('it can override a type handler and render it', () => {
    const customRenderer = new Renderer()
    customRenderer.register(defaultTypesRenderers)
    customRenderer.set('custom', ({ component, module }) => (
      <div>
        Custom {module} {component}
      </div>
    ))
    const component = renderMessage(
      { content: { type: 'custom', module: 'testmodule', component: 'testcomponent' }, config: defaultMessageConfig },
      customRenderer
    )

    expect(component).toBeTruthy()
    render(component)
    expect(screen.getByText('Custom testmodule testcomponent')).toBeInTheDocument()
  })

  test('it can get the valid default text component', () => {
    const textRenderer = defaultRenderer.get('text')

    expect(textRenderer).toBeTruthy()

    const reactEl = React.createElement(textRenderer, {
      text: 'test',
      markdown: false,
      config: defaultMessageConfig
    })

    render(reactEl)

    expect(screen.getByText('test')).toBeInTheDocument()
  })

  test('it renders "unsupported message type" message on non-existant types', () => {
    const nonExistantType = 'non-existant'
    const component = renderMessage({
      content: {
        type: nonExistantType
      },
      config: defaultMessageConfig
    } as Message<never>)
    expect(component).toBeTruthy()
    render(component)
    expect(screen.getByText(`Unsupported message type: ${nonExistantType}`)).toBeInTheDocument()
  })

  test.each(messageTypes)('type "%s" has an assigned default renderer', (type) => {
    if (type !== 'unsupported') {
      expect(defaultTypesRenderers[type]).toBeTruthy()
    }
  })
})

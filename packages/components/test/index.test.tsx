import { render } from '@testing-library/react'
import React from 'react'
import ReactMessageRenderer from './index'
import testEvents from './test-events.json'
import { defaultMessageConfig } from './utils'

describe('ReactComponentRenderer', () => {
  it('can render all test events with no errors', () => {
    testEvents.forEach((event) => {
      const { container } = render(<ReactMessageRenderer content={event as any} config={defaultMessageConfig} />)
      expect(container.firstChild).toBeTruthy()
    })
  })
})

import { render } from '@testing-library/react'
import ReactMessageRenderer from 'index'
import React from 'react'
import { defaultMessageConfig } from 'utils'
import testEvents from './test-events.json'

describe('ReactComponentRenderer', () => {
  it('can render all test events with no errors', () => {
    testEvents.forEach((event) => {
      const { container } = render(<ReactMessageRenderer content={event as any} config={defaultMessageConfig} />)
      expect(container.firstChild).toBeTruthy()
    })
  })
})

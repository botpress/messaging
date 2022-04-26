import { render } from '@testing-library/react'
import React from 'react'
import ReactMessageRenderer from '../../src/index'
import { defaultMessageConfig } from '../../src/utils'
import testEvents from './test-events.json'

describe('ReactComponentRenderer', () => {
  it('can render all test events with no errors', () => {
    testEvents.forEach((event) => {
      const { container } = render(<ReactMessageRenderer content={event as any} config={defaultMessageConfig} />)
      expect(container.firstChild).toBeTruthy()
    })
  })
})

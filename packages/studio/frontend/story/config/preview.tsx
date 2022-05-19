import React from 'react'
import '@blueprintjs/core/lib/css/blueprint.css'
import '@blueprintjs/icons/lib/css/blueprint-icons.css'

import BackgroundGrid from './BackgroundGrid'
import InspectorWindow from './InspectorWindow'

export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/
    }
  }
}

export const decorators = [
  (Story: any) => (
    <BackgroundGrid>
      <InspectorWindow>
        <Story />
      </InspectorWindow>
    </BackgroundGrid>
  )
]

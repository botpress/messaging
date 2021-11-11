import { ComponentStory, ComponentMeta } from '@storybook/react'
import React from 'react'
import ReactMessageRenderer from '.'
import Keyboard from './renderer/Keyboard'
import testevents from './test-events.json'
import { defaultMessageConfig } from './utils'

export default {
  title: 'ReactMessageRenderer',
  component: ReactMessageRenderer,
  argTypes: {
    content: {
      control: {
        type: 'object'
      }
    }
  }
} as ComponentMeta<typeof ReactMessageRenderer>

const Template: ComponentStory<typeof ReactMessageRenderer> = (args) => <ReactMessageRenderer {...args} />

export const Primary = Template.bind({})

Primary.args = {
  content: {
    type: 'text',
    text: 'Hello, world!'
  },
  config: defaultMessageConfig
}

export const MessageList = () => (
  <div style={{ overflow: 'scroll', maxHeight: '90vh', maxWidth: '500px', margin: '12px auto' }}>
    {testevents.map((ev, index) => {
      const content = JSON.parse(ev.payload)
      if (!content) {
        return `Could not render ${content}`
      }
      return (
        <div
          onClick={() => alert(JSON.stringify(content, null, 2))}
          style={{
            cursor: 'pointer',
            maxWidth: '400px',
            background: '#fff',
            padding: '0.5rem 1rem',
            margin: '1rem',
            borderRadius: '8px',
            boxShadow: '0 0 9px 2px rgba(0,0,0,.05)'
          }}
        >
          <ReactMessageRenderer
            key={index}
            content={content}
            config={{
              ...defaultMessageConfig,
              messageId: ev.id,
              sentOn: new Date(ev.sentOn),
              authorId: ev.authorId || undefined,
              isLastGroup: index === testevents.length - 1,
              isLastOfGroup: index === testevents.length - 1
            }}
          />
        </div>
      )
    })}
    <style>{`
      video {
        max-width: 100%;
      }
    `}</style>
    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '50px' }}>
      <Keyboard>
        <textarea style={{ width: '100%' }} placeholder="placeholder composer" />
      </Keyboard>
    </div>
  </div>
)
Primary.args = {}

import { ComponentStory, ComponentMeta } from '@storybook/react'
import React from 'react'
import ReactMessageRenderer from '../src'
import { Content, MessageType } from '../src/content-typings'
import { Keyboard } from '../src/renderer/keyboard'
import { defaultMessageConfig } from '../src/utils'
import testevents from '../test/unit/test-events.json'

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

export const MessageList = () => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        maxWidth: '800px',
        maxHeight: '90vh',
        margin: '12px auto'
      }}
    >
      <div
        style={{
          overflowY: 'scroll',

          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {testevents.map((ev, index) => {
          const content: Content<MessageType> = JSON.parse(ev.payload)
          if (!content) {
            return `Could not render ${content}`
          }
          if (content.type === 'visit') {
            return (
              <div style={{ textAlign: 'center', color: '#999' }}>
                User visit: lang {content.language} <br />
                timezone {content.timezone}
              </div>
            )
          }
          const Message = (
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
          )
          if (!Message) {
            return null
          }
          return (
            <div
              style={{
                alignSelf: ev.authorId ? 'flex-start' : 'flex-end',
                justifyContent: 'center',
                margin: '1rem'
              }}
            >
              <div
                style={{
                  maxWidth: '400px',
                  background: ev.authorId ? '#42a5f5' : '#fff',
                  fontWeight: ev.authorId ? 'bold' : 'normal',
                  color: ev.authorId ? '#fff' : '#000',
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  boxShadow: '0 0 9px 2px rgba(0,0,0,.05)'
                }}
              >
                {Message}
              </div>
              <span
                style={{
                  fontSize: '10px',
                  color: '#bbb',
                  cursor: 'pointer',
                  alignSelf: ev.authorId ? 'flex-end' : 'flex-start'
                }}
                onClick={() => alert(JSON.stringify(content, null, 2))}
              >
                View payload
              </span>
            </div>
          )
        })}
        <style>{`
      video {
        max-width: 100%;
      }
    `}</style>
      </div>
      <Keyboard>
        <input
          type="text"
          placeholder="Write your message here..."
          autoFocus
          style={{
            width: '100%',
            border: '2px solid #42a5f5',
            borderRadius: '8px',
            padding: '0.5rem 1rem',
            margin: '1rem 0',
            fontSize: '1.2rem'
          }}
        />
      </Keyboard>
    </div>
  )
}

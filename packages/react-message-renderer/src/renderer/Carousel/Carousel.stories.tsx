import { ComponentStory, ComponentMeta } from '@storybook/react'
import React from 'react'
import { defaultMessageConfig } from '../../index'

import { Carousel } from '.'

export default {
  title: 'Carousel',
  component: Carousel
} as ComponentMeta<typeof Carousel>

const Template: ComponentStory<typeof Carousel> = (args) => <Carousel {...args} />

export const Primary = Template.bind({})

Primary.args = {
  payload: {
    carousel: {
      elements: [
        {
          title: 'Card 1',
          subtitle: 'Subtitle 1',
          picture: 'https://via.placeholder.com/150/150',
          buttons: [
            {
              title: 'Button 1',
              type: 'postback',
              payload: { data: 'button_clicked' }
            }
          ]
        }
      ]
    }
  },
  config: defaultMessageConfig
}

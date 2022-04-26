import React from 'react'
import Tour from 'reactour'
import { trackEvent } from '~/util/InjectSegment'
import storage from '../Shared/lite-utils/storage'

// Change this key to display the tour the next time a user opens Botpress
const TOUR_KEY = 'guidedTour11_9_0'

interface Props {
  onToggle: () => void
  isDisplayed: boolean
}

export default class GuidedTour extends React.Component<Props> {
  componentDidMount() {
    if (!Boolean(storage.get<boolean>(TOUR_KEY))) {
      storage.set(TOUR_KEY, true)
      this.props.onToggle()
    }
  }

  componentDidCatch(error: Error) {
    console.error('Error while processing guided tour', error)
  }

  getCurrentStep = (current_step: number) => {
    trackEvent('general_tour_step', { current_step })
  }

  onAfterOpen = () => {
    trackEvent('general_tour_open')
  }

  onRequestClose = () => {
    trackEvent('general_tour_close')
    this.props.onToggle()
  }

  render() {
    const steps = [
      {
        selector: '',
        content: 'Welcome to Botpress! This is a quick tour of the most important features.'
      },
      {
        selector: '#statusbar_tutorial',
        content: 'You can re-open the tutorial at any time by clicking this button.'
      },
      {
        selector: '#bp-menu_flows',
        content: 'The Flows screen is the main interface where you can see and edit your conversation flows.'
      },
      {
        selector: '#bp-menu_nlu',
        content:
          'The Natural Language Understanding screen is where you will give example sentences to train the AI for understanding humans.'
      },
      {
        selector: '#bp-menu_qna',
        content: 'Anyone on your team can easily add questions and answers to the Q&A page.'
      },
      {
        selector: '#statusbar_emulator',
        content: 'Use the emulator to try out your bot at any time! You can also use it to troubleshoot.'
      },
      {
        selector: '#bp-menu_admin',
        content: 'Finally, this button will allow you to return to the administration panel or switch bot.'
      },
      {
        selector: '',
        content: 'All done. Enjoy building bots! For more information, please refer to the guides on botpress.com/docs'
      }
    ]

    // resets tutorial to first step when re-opened
    if (!this.props.isDisplayed) {
      return null
    }

    return (
      <Tour
        steps={steps}
        isOpen={this.props.isDisplayed}
        onRequestClose={this.onRequestClose}
        onAfterOpen={this.onAfterOpen}
        showNumber={false}
        getCurrentStep={this.getCurrentStep}
      />
    )
  }
}

import React, { createRef } from 'react'
import Slider, { Settings } from 'react-slick'

// Added those manually to remove the font dependencies which keeps showing 404 not found
import './slick/slick-theme.css'
import './slick/slick.css'
import { CardButton, CardPayload, MessageConfig, MessageTypeHandlerProps } from '../typings'

export class Carousel extends React.Component<MessageTypeHandlerProps<'carousel'>, ICarouselState> {
  private ref = createRef<HTMLDivElement>()

  public state = {
    adjustedWidth: 0
  }

  componentDidMount() {
    this.setState({ adjustedWidth: this.ref.current?.offsetWidth || 0 - window.innerWidth })
  }

  renderCarousel() {
    const carousel = this.props.payload.carousel
    const elements = carousel.elements || []

    // Breakpoints must be adjusted since the carousel is based on the page width, and not its parent component
    const adjustBreakpoint = (size: number): number => size - this.state.adjustedWidth

    const defaultSettings: Settings = {
      dots: false,
      infinite: false,
      responsive: [
        { breakpoint: adjustBreakpoint(550), settings: { slidesToShow: 1 } },
        { breakpoint: adjustBreakpoint(1024), settings: { slidesToShow: 2 } },
        { breakpoint: adjustBreakpoint(1548), settings: { slidesToShow: 3 } },
        { breakpoint: adjustBreakpoint(2072), settings: { slidesToShow: 4 } },
        { breakpoint: adjustBreakpoint(10000), settings: 'unslick' }
      ],
      slidesToScroll: 1,
      autoplay: false,
      centerMode: false,
      arrows: elements.length > 1
    }

    const settings = Object.assign({}, defaultSettings, carousel.settings)

    return (
      <Slider {...settings}>
        {elements.map((el, idx) => (
          <Card {...el} key={idx} onSendData={this.props.config.onSendData} />
        ))}
      </Slider>
    )
  }

  render() {
    return (
      <div ref={this.ref} style={{ width: '100%', ...this.props.payload.style }}>
        {this.state.adjustedWidth && this.renderCarousel()}
      </div>
    )
  }
}

type CardProps = CardPayload & Pick<MessageConfig, 'onSendData'>

export const Card = ({ picture, title, subtitle, buttons, onSendData = async () => {} }: CardProps) => {
  return (
    <div className={'bpw-card-container'}>
      {picture && <div className={'bpw-card-picture'} style={{ backgroundImage: `url("${picture}")` }} />}
      <div>
        <div className={'bpw-card-header'}>
          <div className={'bpw-card-title'}>{title}</div>
          {subtitle && <div className={'bpw-card-subtitle'}>{subtitle}</div>}
        </div>
        <div className={'bpw-card-buttons'}>
          {buttons.map((btn: CardButton) => {
            if (btn.url) {
              return (
                <a
                  href={btn.url}
                  key={`1-${btn.title}`}
                  target={/^javascript:/.test(btn.url) ? '_self' : '_blank'}
                  className={'bpw-card-action'}
                >
                  {btn.title || btn}
                  {/^javascript:/.test(btn.url) ? null : <i className={'bpw-card-external-icon'} />}
                </a>
              )
            } else if (btn.type === 'postback' || btn.payload) {
              return (
                <a
                  onClick={async () => {
                    await onSendData({ type: 'postback', payload: btn.payload })
                  }}
                  key={`2-${btn.title}`}
                  className={'bpw-card-action'}
                >
                  {btn.title || btn}
                </a>
              )
            } else if (btn.type === 'say_something' || btn.text) {
              return (
                <a
                  onClick={async () => {
                    await onSendData({ type: 'say_something', text: btn.text })
                  }}
                  key={`2-${btn.title}`}
                  className={'bpw-card-action'}
                >
                  {btn.title || btn}
                </a>
              )
            } else {
              return (
                <a href={'#'} key={`3-${btn.title}`} target={'_blank'} className={'bpw-card-action'}>
                  {btn.title || btn}
                  <i className={'bpw-card-external-icon'} />
                </a>
              )
            }
          })}
        </div>
      </div>
    </div>
  )
}

interface ICarouselState {
  adjustedWidth: number
}

import classnames from 'classnames'
import Mustache from 'mustache'
import React, { Component } from 'react'
import Markdown from 'react-markdown'
import { connect } from 'react-redux'
import { fetchContentItem, refreshFlowsLinks } from '~/actions'
import { lang } from '~/components/Shared/translations'

import { isMissingCurlyBraceClosure } from '~/components/Util/form.util'
import { isRTLLocale } from '~/translations'
import withLanguage from '../../../components/Util/withLanguage'
import { ActionPopover } from './actionPopover'

import style from './style.scss'

interface Props {
  text: string
  fetchContentItem: any
  refreshFlowsLinks: any
  className: string
  items: any
  contentLang: string
  layoutv2?: boolean
}

export const textToItemId = (text) => text?.match(/^say #!(.*)$/)?.[1]

class ActionItem extends Component<Props> {
  state = {
    itemId: null
  }

  componentDidMount() {
    this.loadElement()
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.text !== this.props.text) {
      this.loadElement()
    }

    if (prevState.itemId !== this.state.itemId && this.state.itemId) {
      this.props.fetchContentItem(this.state.itemId, { force: true, batched: true }).then(this.props.refreshFlowsLinks)
    }
  }

  loadElement() {
    this.setState({ itemId: textToItemId(this.props.text) })
  }

  render() {
    const action = this.props.text
    const isAction = typeof action !== 'string' || !action.startsWith('say ')

    if (isAction) {
      return <ActionPopover text={this.props.text} className={this.props.className} />
    }

    const item = this.props.items[this.state.itemId]

    const preview = item?.previews?.[this.props.contentLang]
    const className = classnames(style.name, {
      [style.missingTranslation]: preview?.startsWith('(missing translation) ')
    })

    if (preview && item?.schema?.title === 'Image') {
      const markdownRender = (
        <Markdown
          source={preview}
          renderers={{
            image: (props) => <img {...props} className={style.imagePreview} />,
            link: (props) => (
              <a href={props.href} target="_blank">
                {props.children}
              </a>
            )
          }}
        />
      )

      if (this.props.layoutv2) {
        return (
          <div className={classnames(this.props.className, style['action-item'])}>
            {markdownRender}
            {this.props.children}
          </div>
        )
      }

      return (
        <div className={classnames(this.props.className, style['action-item'], style.msg)}>
          <span className={style.icon}>💬</span>
          {markdownRender}
          {this.props.children}
        </div>
      )
    }

    const textContent =
      item && this.props.layoutv2 ? preview : item ? `${lang.tr(item.schema?.title)} | ${preview}` : ''
    const vars = {}

    const stripDots = (str) => str.replace(/\./g, '--dot--')
    const restoreDots = (str) => str.replace(/--dot--/g, '.')

    const htmlTpl = textContent.replace(/{{([a-z$@0-9. _-]*?)}}/gi, (x) => {
      const name = stripDots(x.replace(/{|}/g, ''))
      vars[name] = `<span class="var">${x}</span>`
      return `{${stripDots(x)}}`
    })

    let mustached = restoreDots(htmlTpl)

    if (!isMissingCurlyBraceClosure(htmlTpl)) {
      mustached = restoreDots(Mustache.render(htmlTpl, vars))
    }

    const html = { __html: mustached }

    if (this.props.layoutv2) {
      return (
        <div className={classnames(this.props.className, style['action-item'])}>
          <span className={className} dangerouslySetInnerHTML={html} />
          {this.props.children}
        </div>
      )
    }

    return (
      <div
        className={classnames(this.props.className, style['action-item'], style.msg, {
          [style.rtl]: isRTLLocale(this.props.contentLang) ? style.rtl : null
        })}
      >
        <span className={style.icon}>💬</span>
        <span className={className} dangerouslySetInnerHTML={html} />
        {this.props.children}
      </div>
    )
  }
}

const mapStateToProps = (state) => ({ items: state.content.itemsById })
const mapDispatchToProps = { fetchContentItem, refreshFlowsLinks }

export default connect(mapStateToProps, mapDispatchToProps)(withLanguage(ActionItem))

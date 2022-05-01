import { Icon, IconSize } from '@blueprintjs/core'
import React from 'react'
import ReactDOM from 'react-dom'
import { InfoCardComponent } from './types'
import './InfoCard.scss'

const InfoCard: InfoCardComponent = ({ key, link, docs, type, evals }) => {
  return () => {
    const dom = document.createElement('div')
    const evaluatesTo = evalsToStr(evals)
    ReactDOM.render(
      <div className="infoCard-container">
        <header>
          <h5 className="bp3-heading">{key}</h5>
          {link && (
            <a className="infoCard-docsLink" href={link} target="_blank" rel="noreferrer">
              <Icon icon="link" iconSize={IconSize.STANDARD} />
            </a>
          )}
        </header>
        {type && <span className="bp3-monospace-text bp3-text-small infoCard-type">{type}</span>}
        {docs && <p className="infoCard-docs bp3-text-small bp3-running-text">{docs}</p>}
        {evaluatesTo && (
          <div className="infoCard-evals">
            <strong className="bp3-text-small">Evaluates to: </strong>
            <span className="bp3-tag bp3-minimal">{evaluatesTo}</span>
          </div>
        )}
      </div>,
      dom
    )
    return dom
  }
}

/** Return a string for what selection evaluates to */
function evalsToStr(x: unknown): string {
  // hide Evaluates To for objects and funtions
  if (['object', 'function'].includes(typeof x)) {
    return ''
  }

  if (typeof x === 'boolean') {
    return x ? 'true' : 'false'
  }
  if (typeof x === 'number') {
    return x.toString()
  }
  if (x === null) {
    return 'null'
  }
  if (x === undefined) {
    return 'undefined'
  }
  return x as string
}

export default InfoCard

// container
/// name (space) full type elipsis
/// desc
/// eval string, number, bool (space) docs button

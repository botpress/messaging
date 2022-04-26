import { Classes, H5, Intent, Position, Toaster } from '@blueprintjs/core'
import axios from 'axios'
import _ from 'lodash'
import React, { useEffect } from 'react'

export default () => {
  const displayError = () => {
    const toastContent = (
      <div>
        <H5 className={Classes.DARK}>NLU server is not reachable</H5>
        <p>NLU server is unreachable, bots wont work properly.</p>
      </div>
    )

    Toaster.create({ position: Position.TOP }).show({
      message: toastContent,
      intent: Intent.DANGER,
      timeout: 0
    })
  }

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    axios
      .get(`${window.STUDIO_API_PATH}/nlu/info`)
      .then(({ data }) => {
        if (typeof data === 'object') {
          return
        }
        displayError()
      })
      .catch(displayError)
  }, [])

  return null
}

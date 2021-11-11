import { ContextMenu, Menu, MenuItem } from '@blueprintjs/core'
import React from 'react'

function MessageMenu(props: any) {
  return (
    <Menu>
      {props.customActions.map((action: any) => {
        return (
          <MenuItem
            key={action.id}
            text={action.label}
            // TODO: undefined is supposed to be "this". Does that make sense??
            onClick={action.onClick.bind(undefined, action.id, props.element)}
          />
        )
      })}
    </Menu>
  )
}

export const showContextMenu = (e: React.MouseEvent<HTMLDivElement>, props: any) => {
  const customActions = props.store.view.customActions

  if (props.store.config.isEmulator) {
    customActions.push({
      id: 'actionDebug',
      label: 'Inspect in Debugger',
      onClick: (_actionId: string, props: any) => {
        props.store.loadEventInDebugger(props.incomingEventId, true)
      }
    })
  }

  if (customActions && props.incomingEventId) {
    e.preventDefault()
    const menu = <MessageMenu element={props} customActions={customActions} />
    ContextMenu.show(menu, { left: e.clientX, top: e.clientY })
  }
}

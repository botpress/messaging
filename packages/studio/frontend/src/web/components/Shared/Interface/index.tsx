import {
  Button,
  ButtonGroup,
  Classes,
  Collapse,
  Colors,
  ControlGroup,
  Icon,
  InputGroup,
  Popover,
  Position,
  Tooltip
} from '@blueprintjs/core'
import cx from 'classnames'
import _ from 'lodash'
import React, { useState } from 'react'

import Container from './Container'
import style from './style.scss'
import {
  InfoTooltipProps,
  ItemListProps,
  KeyboardShortcutsProps,
  SearchBarProps,
  SectionAction,
  SidePanelProps,
  SidePanelSectionProps,
  SplashScreenProps,
  ToolbarButtonsProps,
  ToolbarProps
} from './typings'
import { buildMenu, showContextMenu } from './utils'

export const SidePanelSection = (props: SidePanelSectionProps) => {
  const [isOpen, setOpen] = useState(!props.collapsed)

  return (
    <React.Fragment>
      <div className={style.sidePanel_section} onClick={() => setOpen(!isOpen)}>
        <strong>
          {!props.hideCaret && <Icon icon={isOpen ? 'caret-down' : 'caret-right'} />}
          {props.label || ''}
        </strong>
        <ButtonGroup minimal={true} onClick={(e) => e.stopPropagation()}>
          {props.actions && props.actions.map((action) => SectionAction(action))}
        </ButtonGroup>
      </div>
      <Collapse isOpen={isOpen} transitionDuration={50} keepChildrenMounted={true}>
        {props.children}
      </Collapse>
    </React.Fragment>
  )
}

export const SearchBar = React.forwardRef<HTMLInputElement, SearchBarProps>((props: SearchBarProps, ref) => {
  const [text, setText] = useState('')
  const handleTextChanged = (e) => {
    props.value === undefined && setText(e.target.value)
    props.onChange && props.onChange(e.target.value)
  }

  const onBlur = (e) => props.onBlur && props.onBlur(e)

  return (
    <div className={cx(style.searchBar, props.className)}>
      <ControlGroup fill={true}>
        <InputGroup
          // @ts-ignore: inputRef expects a callback ref but types won't match with forwarRef signature
          inputRef={ref}
          onBlur={onBlur}
          id={props.id}
          leftIcon={props.icon}
          placeholder={props.placeholder || 'Search'}
          value={props.value !== undefined ? props.value : text}
          onChange={handleTextChanged}
        />
        {props.showButton && (
          <Button
            id="btn-search"
            icon={'search'}
            className={Classes.FIXED}
            onClick={(e) => props.onButtonClick && props.onButtonClick(e)}
          />
        )}
      </ControlGroup>
    </div>
  )
})

export const ItemList = (props: ItemListProps) => {
  return (
    <div className={style.itemList}>
      {props.items &&
        props.items.map((item) => {
          const key = item.key ? item.key : item.label
          return (
            <div key={key} className={cx(style.item, { [style.itemListSelected]: item.selected })}>
              <div
                id={item.id}
                className={style.label}
                onClick={() => props.onElementClicked && props.onElementClicked(item)}
                onContextMenu={(e) => showContextMenu(e, item.contextMenu)}
              >
                {item.icon && <Icon icon={item.icon} />} {item.label}
              </div>
              <div className={style.right}>
                {item.actions &&
                  item.actions.map((action) => (
                    <Tooltip key={key + action.tooltip} content={action.tooltip} position={Position.RIGHT}>
                      <span id={action.id}>
                        <Icon
                          style={{ padding: '0 7px' }} // so it has the same padding of a button
                          icon={action.icon}
                          color={Colors.GRAY2}
                          onClick={() => action.onClick && action.onClick(item)}
                        />
                      </span>
                    </Tooltip>
                  ))}
              </div>
            </div>
          )
        })}
    </div>
  )
}

export const PaddedContent = (props) => <div style={{ padding: '5px' }}>{props.children}</div>
export const SidePanel = (props: SidePanelProps) => (
  <div className={style.sidePanel} style={props.style}>
    {props.children}
  </div>
)

export const KeyboardShortcut = (props: KeyboardShortcutsProps) => {
  const ACTION_KEY = navigator.platform.toUpperCase().indexOf('MAC') >= 0 ? 'cmd' : 'ctrl'
  return (
    <p>
      {props.label || ''}
      &nbsp;
      {props.keys &&
        props.keys.map((key, idx) => {
          const realKey = key === 'ACTION' ? ACTION_KEY : key
          return idx > 0 ? (
            <span key={realKey}>
              &nbsp;+&nbsp;
              <kbd>{realKey}</kbd>
            </span>
          ) : (
            <kbd key={realKey}>{realKey}</kbd>
          )
        })}
    </p>
  )
}

export const SplashScreen = (props: SplashScreenProps) => (
  <div className={style.splashScreen}>
    <div>
      <Icon icon={props.icon} />
      <h1>{props.title || ''}</h1>
      <p>{props.description || ''}</p>
      {props.children}
    </div>
  </div>
)

const SectionAction = (action: SectionAction) => {
  const key = action.key || action.label || action.tooltip
  if (action.items) {
    return (
      <Tooltip key={key} disabled={!action.tooltip} content={action.tooltip} position={Position.RIGHT}>
        <Popover content={buildMenu(action.items)} position={Position.BOTTOM_LEFT}>
          <Button id={action.id} icon={action.icon} text={action.label} />
        </Popover>
      </Tooltip>
    )
  }

  return (
    <Popover key={key} disabled={!action.popover} content={action.popover}>
      <Tooltip disabled={!action.tooltip} content={action.tooltip} position={Position.RIGHT}>
        <Button
          id={action.id}
          disabled={action.disabled}
          icon={action.icon}
          text={action.label}
          onClick={(e) => {
            action.onClick && action.onClick(e)
          }}
        />
      </Tooltip>
    </Popover>
  )
}

export const Toolbar = (props: ToolbarProps) => {
  return <div className={style.toolbar}>{props.children}</div>
}

export const LeftToolbarButtons = (props: ToolbarButtonsProps) => {
  return <ButtonGroup minimal={true}>{props.children}</ButtonGroup>
}

export const RightToolbarButtons = (props: ToolbarButtonsProps) => {
  return (
    <ButtonGroup className={style.rightButtons} minimal={true}>
      {props.children}
    </ButtonGroup>
  )
}

export const InfoTooltip = (props: InfoTooltipProps) => (
  <Tooltip content={props.text} position={props.position || Position.RIGHT} usePortal={false}>
    <Icon icon={props.icon || 'info-sign'} iconSize={13} className={style.infoTooltip} />
  </Tooltip>
)

export { Container }

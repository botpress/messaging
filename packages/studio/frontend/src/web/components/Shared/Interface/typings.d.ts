import { IconName, MaybeElement, Position, IDialogProps } from '@blueprintjs/core'
import React from 'react'

/* @deprecated Please use import { ModuleUI } from 'botpress/Shared' */
declare module 'botpress/ui' {
  export function Container(props: ContainerProps): JSX.Element
  export function SidePanelSection(props: SidePanelSectionProps): JSX.Element

  export function SearchBar(props: SearchBarProps): JSX.Element
  export function ItemList(props: ItemListProps): JSX.Element
  export function KeyboardShortcut(props: KeyboardShortcutsProps): JSX.Element
  export function SplashScreen(props: SplashScreenProps): JSX.Element
  export function SidePanel(props: SidePanelProps): JSX.Element
  export function Toolbar(props: ToolbarProps): JSX.Element
  export function LeftToolbarButtons(props: ToolbarButtonsProps): JSX.Element
  export function RightToolbarButtons(props: ToolbarButtonsProps): JSX.Element
  export function InfoTooltip(props: InfoTooltipProps): JSX.Element
  export const { Item, ItemAction, SectionAction }
}

// TODO: Find the best location for this piece of code. I've added it here so modules importing botpress/ui have access to window.*
declare global {
  interface Window {
    __BP_VISITOR_ID: string
    botpressWebChat: {
      init: (config: any, containerSelector?: string) => void
      sendEvent: (payload: any, webchatId?: string) => void
      mergeConfig: (config: any) => void
      configure: (config: any) => void
      sendPayload: (payload: any) => void
    }
    BOT_API_PATH: string
    STUDIO_API_PATH: string
    API_PATH: string
    BOT_ID: string
    BP_BASE_PATH: string
    IS_CLOUD_BOT: boolean
    SEND_USAGE_STATS: boolean
    botpress: {
      [moduleName: string]: any
    }
    toggleSidePanel: () => void
  }
}

export interface ContainerProps {
  /**
   * Change the default width of the sidebar (in pixels)
   * @default 300
   */
  sidePanelWidth?: number
  /**
   * Sets the default state of the sidebar. When not visible, the width is set to 0px, but can be expanded manually
   */
  sidePanelHidden?: boolean
  /** Register a new combination of keyboard shortcuts for your container, for ex: ctrl+b, ctrl+alt+z, esc */
  keyMap?: {
    [id: string]: string
  }
  /** Makes the content scrollable vertically on overflow */
  yOverflowScroll?: boolean
  /** Add handlers for existing combinations in keyboardShortcuts.js, or create custom ones in combination to keyMap  */
  keyHandlers?: {
    [id: string]: (keyEvent?: KeyboardEvent) => void
  }
  readonly children: React.ReactNode
  className?: string
}

export interface SplashScreenProps {
  title: string
  description?: string | JSX.Element
  /** The name of the icon to use. Can also be a JSX element */
  icon?: IconName | MaybeElement
  readonly children?: React.ReactNode
}

export interface InfoTooltipProps {
  /** The text displayed when the cursor is over the icon */
  text: string
  /** The icon to display. By default it will use 'info-sign' */
  icon?: IconName | MaybeElement
  /** Where the tooltip will be directed. By default, it's right */
  position?: Position
}

export interface SidePanelProps {
  readonly children: React.ReactNode
  style?: any
}

export interface ItemListProps {
  items: Item[]
  /** This is called whenever any element of the list is clicked */
  onElementClicked?: (item: Item) => void
}

export interface Item {
  id?: string
  label: string
  /** This can be used when executing actions on the items */
  value: any
  icon?: IconName | MaybeElement
  /** When the element is selected, it is displayed in bold in the list */
  selected: boolean
  /** These actions are displayed at the end of the component when the mouse is over the element */
  actions?: ItemAction[]
  /** Context menu displayed when the element is right-clicked */
  contextMenu?: SectionAction[]
  /** Unique key used by React. If null, label is used */
  key?: any
}

interface ItemAction {
  id?: string
  /** Text displayed when the cursor is over the button */
  tooltip?: string
  /** The name of the icon to use. Can also be a JSX element */
  icon?: IconName | MaybeElement
  /** The action called when the specific action is clicked */
  onClick?: (item: Item) => void
}

export interface SidePanelSectionProps {
  /** When true, the content of the section is hidden by default */
  collapsed?: boolean
  /** The label to display as the section header */
  label: string
  /** When true, the caret icon is not displayed before the section label */
  hideCaret?: boolean
  /** An array of actions that can be executed by the user */
  actions?: SectionAction[]
  readonly children?: React.ReactNode
}

export interface SectionAction {
  /** An id to select this element easily */
  id?: string
  /** This text will be displayed when the mouse is over the icon */
  label?: string
  /** Text displayed when the cursor is over the button */
  tooltip?: string
  /** Any JSX element to be displayed when the button is clicked (for ex: filters)  */
  popover?: JSX.Element
  /** Type "divider" is special and adds a separator in the menu */
  type?: string
  /** When true, the button is still visible but the click event is discarded */
  disabled?: boolean
  key?: string
  /** The name of the icon to use. Can also be a JSX element */
  icon?: IconName | MaybeElement
  /** One or multiple items displayed as childs of that element */
  items?: SectionAction | SectionAction[]
  /** The function called when the action is clicked */
  onClick?: (e: React.MouseEvent) => void
}

export interface KeyboardShortcutsProps {
  label: string
  /**
   * An array of the different keys for the shortcut. There is a special key called ACTION, which will display the correct key for windows/mac
   * Example: keys: ["ACTION", "shift", "p"] will display: ctrl + shift + p
   */
  keys: string[]
}

export interface SearchBarProps {
  className?: string
  /** The input element ID */
  id?: string
  /** Text to display when there's no input value */
  placeholder?: string
  /** Set value when used as controled component */
  value?: string
  /** This is called whenever the text in the input changes */
  onChange?: (text: string) => void
  /** The name of the icon to use. Can also be a JSX element */
  icon?: IconName | MaybeElement
  /** Show or hide button */
  showButton?: boolean
  /** Called when search input loses focus */
  onBlur?: (e: React.FocusEvent) => void
  /** This is called when the user clicks on the button */
  onButtonClick?: (e: React.MouseEvent) => void
}

export interface ToolbarProps {
  /** Button Groups of Toolbar */
  children?: React.ReactElement<ToolbarButtonsProps> | React.ReactElement<ToolbarButtonsProps>[]
}

export interface ToolbarButtonsProps {
  /** Elements of the button group */
  children?: JSX.Element | JSX.Element[]
}

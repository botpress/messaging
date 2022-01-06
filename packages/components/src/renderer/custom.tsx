import React, { useMemo } from 'react'
import { ErrorBoundary } from '../base/error-boundary'
import { MessageTypeHandlerProps } from '../typings'
import { pick } from '../utils'
import { Keyboard } from './keyboard'

const checkError = (moduleInjector: Function, component: string, payload: string): Error | null => {
  const errorPrepend = 'Custom component error: '
  if (!moduleInjector) {
    return new Error(`${errorPrepend} could not get module injector`)
  }
  // TODO: what is this?
  // if (!module) {
  //   return new Error(`${errorPrepend} "module" is not defined in the payload`)
  // }
  if (!component) {
    return new Error(`${errorPrepend} "component" is not defined in the payload`)
  }
  return null
}

export const CustomComponentRenderer: React.FC<MessageTypeHandlerProps<'custom'>> = ({
  config,
  component,
  module,
  wrapped,
  ...payload
}) => {
  const InjectedModuleView = config.bp?.getModuleInjector()

  const error = useMemo(
    () => checkError(InjectedModuleView, component, module),
    [InjectedModuleView, component, module]
  )

  if (error) {
    throw error
  }

  const sanitizedProps = useMemo(() => {
    return pick(config, [
      'messageId',
      'isLastGroup',
      'isLastOfGroup',
      'isBotMessage',
      'onSendData',
      'onFileUpload',
      'sentOn',
      'store',
      'intl'
    ])
  }, [config])

  const extraProps = {
    ...sanitizedProps,
    messageDataProps: { ...payload },
    keyboard: Keyboard,
    children: wrapped && <CustomComponentRenderer config={config} component={component} module={module} {...payload} />
  }

  return <InjectedModuleView moduleName={module} componentName={component} lite extraProps={extraProps} />
}

export const Custom: React.FC<MessageTypeHandlerProps<'custom'>> = (props) => (
  <ErrorBoundary>
    <CustomComponentRenderer {...props} />
  </ErrorBoundary>
)

export { ErrorBoundary }

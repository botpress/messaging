import React, { Component, ErrorInfo, ReactNode } from 'react'

interface Props {
  children: ReactNode
  ErrorComponent?: React.ComponentType<{ error: Error | null }>
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  }

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo)
  }

  public render() {
    if (this.state.hasError) {
      const { ErrorComponent } = this.props
      return ErrorComponent ? (
        <ErrorComponent error={this.state.error} />
      ) : (
        <p>An error occured during component rendering: ${this.state.error?.message || ''}</p>
      )
    }

    return this.props.children
  }
}

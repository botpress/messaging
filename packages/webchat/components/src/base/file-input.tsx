import React from 'react'

interface Props {
  name: string
  className?: string
  placeholder?: string
  disabled?: boolean
  accept?: string
  onFileChanged?: (event: React.ChangeEvent<HTMLInputElement>) => void
}

interface State {
  value?: string
}
export class FileInput extends React.Component<Props, State> {
  state: State = {
    value: ''
  }

  handleFileChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ value: e.target.value.split(/(\\|\/)/g).pop() })
    this.props.onFileChanged && this.props.onFileChanged(e)
  }

  render() {
    return (
      <div style={{ position: 'relative' }}>
        <input
          type={'file'}
          name={this.props.name}
          className={this.props.className}
          onChange={this.handleFileChanged}
          accept={this.props.accept}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            opacity: 0,
            width: '100%',
            zIndex: 1
          }}
        />
        <input
          type={'text'}
          tabIndex={-1}
          name={this.props.name + '_filename'}
          className={this.props.className}
          onChange={() => {}}
          placeholder={this.props.placeholder}
          disabled={this.props.disabled}
          style={{ position: 'relative', zIndex: -1 }}
        />
      </div>
    )
  }
}

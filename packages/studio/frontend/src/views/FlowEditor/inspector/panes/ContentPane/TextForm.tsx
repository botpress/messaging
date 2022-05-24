import React, { FC } from 'react'

import { lang } from '~/src/components/Shared/translations'
import { TextInput, ReorderList, Switch } from '../../FormKit'

const TextForm: FC = () => {
  return (
    <>
      <TextInput name={`text$${lang.getLocale()}`} label="Text" />
      <ReorderList name={`variations$${lang.getLocale()}`} label="Variations">
        <TextInput name="" label="Alternative" />
        <input />
      </ReorderList>
      <Switch name={`markdown$${lang.getLocale()}`} label="Markdown" />
      <Switch name={`typing$${lang.getLocale()}`} label="Typing" />
    </>
  )
}

export default TextForm

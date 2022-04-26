import { Button } from '@blueprintjs/core'
import _ from 'lodash'
import React, { useEffect } from 'react'
import Dropdown from '~/components/Shared/Dropdown'

import withLanguage from '../../Util/withLanguage'

import { Flag } from './Flag'

interface Props {
  contentLang: string
  languages: string[]
  changeContentLanguage: any
  toggleLangSwitcher: any
  langSwitcherOpen: boolean
}

const STORAGE_KEY = `bp::${window.BOT_ID}::cmsLanguage`

export const LanguageSwitcher = (props: Props) => {
  useEffect(() => {
    const lastLang = localStorage.getItem(STORAGE_KEY)
    if (!props.languages || !props.languages.length || !lastLang) {
      return
    }

    if (props.languages.includes(lastLang)) {
      props.changeContentLanguage(lastLang)
    }
  }, [props.languages])

  const switchLang = (lang: string) => {
    props.changeContentLanguage(lang)
    props.toggleLangSwitcher()

    localStorage.setItem(STORAGE_KEY, lang)
  }

  const items = props.languages.map((langCode) => ({
    value: langCode,
    label: langCode.toUpperCase(),
    icon: <Flag languageCode={langCode} />
  }))

  return (
    props.languages.length > 1 && (
      <Dropdown
        items={items}
        filterable={false}
        defaultItem={items.find((i) => i.value === props.contentLang)}
        onChange={(item) => {
          switchLang(item.value)
        }}
      >
        <Button minimal icon={<Flag languageCode={props.contentLang} />} text={props.contentLang.toUpperCase()} />
      </Dropdown>
    )
  )
}

export default withLanguage(LanguageSwitcher)

import i18next from 'i18next'
import React from 'react'
import { useTranslation } from 'react-i18next'

import { useStore } from './store'
import * as style from './style.module.scss'

const Home = () => {
  const { count, inc } = useStore()
  const { t } = useTranslation(['home'])

  const changeLang = async (lang: string) => {
    await i18next.changeLanguage(lang)
  }

  return (
    <div className={style.container}>
      <h1 className={style.title}>{t('title', { count })}</h1>
      <button onClick={inc}>one up</button>

      <div>
        <button onClick={() => changeLang('en')}>EN</button>
        <button onClick={() => changeLang('fr')}>FR</button>
        <button onClick={() => changeLang('es')}>ES</button>
      </div>
    </div>
  )
}

export default Home

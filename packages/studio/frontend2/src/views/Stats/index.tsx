import React from 'react'
import { useQuery } from 'react-query'
import { Link } from 'react-router-dom'

import * as style from './style.module.scss'

export const Stats = () => {
  const { isLoading, error, data } = useQuery('repoData', () =>
    fetch('https://api.github.com/repos/botpress/messaging').then((res) => res.json())
  )

  if (isLoading) {
    return <p>Loading...</p>
  }

  if (error) {
    return <p>An error has occurred: {(error as Error).message}</p>
  }

  return (
    <div className={style.container}>
      <div>
        <h1 className={style.title}>{data.name}</h1>
        <p>{data.description}</p>
        <strong>👀 {data.subscribers_count}</strong> <strong>✨ {data.stargazers_count}</strong>{' '}
        <strong>🍴 {data.forks_count}</strong>
      </div>

      <div>
        <Link to="/">Home</Link>
      </div>
    </div>
  )
}

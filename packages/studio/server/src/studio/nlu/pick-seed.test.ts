import _ from 'lodash'

import pickSeed from './pick-seed'
import { BotConfig } from './typings'

test('make seed with defined seed should not generate one', () => {
  const actual = pickSeed({ id: 'testy', nluSeed: 42 } as BotConfig)
  expect(actual).toBe(42)
})

test('make seed with undefined seed should make one', () => {
  const strs = ['testy', 'abcdefgh', 'abcdefghijklmnop', 'أنا أحب فرودو ساكيت', '我爱佛罗多·巴金斯']

  for (const id of strs) {
    const actual = pickSeed({ id } as BotConfig)
    expect(_.isNumber(actual)).toBeTruthy()
    expect(_.isNaN(actual)).toBeFalsy()
    expect(actual).toBeGreaterThanOrEqual(0)
    expect(actual).toBeLessThan(10000)
  }
})

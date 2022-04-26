import { trimUtterances } from './intent-repo'

describe('trimUtterances', () => {
  const testcases: any[] = [
    [{ en: ['adfasdf '] }, { en: ['adfasdf'] }],
    [{ en: [' adfasdf '] }, { en: ['adfasdf'] }],
    [{ en: [' adfasdf'] }, { en: ['adfasdf'] }],
    [{ en: ['word1 word2'] }, { en: ['word1 word2'] }],
    [
      { en: [' adfasdf '], fr: [' adfasdf '] },
      { en: ['adfasdf'], fr: ['adfasdf'] }
    ]
  ]

  test.each(testcases)('trimUtterances %s', (actual: any, expected: any) => {
    const intent = { name: '', slots: [], contexts: [], utterances: actual }

    trimUtterances(intent)

    expect(intent.utterances).toEqual(expected)
  })
})

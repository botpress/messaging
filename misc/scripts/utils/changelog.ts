import changelog from 'conventional-changelog'
import fs from 'fs'

const updateChangelog = async (text: string) => {
  const changelogPath = './CHANGELOG.md'

  const existingChangelog = await new Promise<string>((resolve, reject) =>
    fs.readFile(changelogPath, { encoding: 'utf-8' }, (err, data) => (err ? reject(err) : resolve(data)))
  )
  return new Promise<void>((resolve, reject) =>
    fs.writeFile(changelogPath, `${text}${existingChangelog}`, { encoding: 'utf-8' }, (err) =>
      err ? reject(err) : resolve()
    )
  )
}

const build = async ({ writeToFile } = { writeToFile: false }) => {
  // see options here: https://github.com/conventional-changelog/conventional-changelog/tree/master/packages
  const changelogOts = {
    preset: 'angular',
    releaseCount: 1
  }
  const context = {}
  const gitRawCommitsOpts = {
    merges: null
  }
  const commitsParserOpts = {
    mergePattern: /^Merge pull request #(\d+) from (.*)/gi,
    mergeCorrespondence: ['id', 'source']
  }
  const changelogWriterOpts = {}

  let text = ''
  const stream = changelog(changelogOts, context, gitRawCommitsOpts, commitsParserOpts, changelogWriterOpts)

  stream.on('data', (chunk) => (text += chunk))
  await new Promise((resolve, reject) => {
    stream.on('error', reject)
    stream.on('end', resolve)
  })

  if (writeToFile) {
    await updateChangelog(text.toString())
  }

  return text.toString()
}

export default { build }

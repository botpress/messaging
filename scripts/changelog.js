require('bluebird-global')
const changelog = require('conventional-changelog')
const fse = require('fs-extra')

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
  stream.on('data', chunk => (text += chunk))
  await Promise.fromCallback(cb => stream.on('end', cb))

  if (writeToFile) {
    const existingChangelog = await fse.readFile('./CHANGELOG.md', 'utf-8')
    await fse.writeFile('./CHANGELOG.md', `${text.toString()}${existingChangelog}`, 'utf-8')
  }

  return text.toString()
}

module.exports = { build }

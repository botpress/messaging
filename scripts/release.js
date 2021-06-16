const semver = require('semver')
const yargs = require('yargs')
const fse = require('fs-extra')
const { spawn } = require('child_process')
const path = require('path')
const changelog = require('./changelog')
const logger = require('./logger')

yargs
  .command(['$0 <releaseType>'], 'Bump release version. releaseType options: major, minor, patch', {}, async argv => {
    yargs.positional('releaseType', {
      describe: 'Type of release to do: major, minor or patch',
      type: 'string',
      demandOption: true
    })

    try {
      const version = (await fse.readJSON(path.join('package.json'))).version
      const newVersion = semver.inc(version, argv.releaseType)

      const changes = await changelog.build({ writeToFile: true })
      logger.info(`Change Log:\n\n${changes}`)

      spawn('yarn', ['version', '--new-version', newVersion, '--no-git-tag-version'], {
        stdio: 'inherit',
        shell: true
      })
    } catch (err) {
      logger.error(err)
    }
  })
  .help().argv

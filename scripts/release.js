const { execute } = require('./exec')
const yargs = require('yargs')
const changelog = require('./changelog')
const logger = require('./logger')

yargs
  .command(['$0 <releaseType>'], 'Bump release version. releaseType options: major, minor, patch', {}, async (argv) => {
    yargs.positional('releaseType', {
      describe: 'Type of release to do: major, minor or patch',
      type: 'string',
      demandOption: true
    })

    try {
      const bumpCommand = `version ${argv.releaseType}`
      await execute(`yarn ${bumpCommand}`, undefined, { silent: true })
      await execute(`yarn workspace @botpress/messaging-server ${bumpCommand}`, undefined, { silent: true })

      const changes = await changelog.build({ writeToFile: true })
      logger.info(`Change Log:\n\n${changes}`)
    } catch (err) {
      logger.error(err)
    }
  })
  .help().argv

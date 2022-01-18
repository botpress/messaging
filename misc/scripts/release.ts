import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'

import changelog from './utils/changelog'
import { execute } from './utils/exec'
import logger from './utils/logger'
import { getProjectVersion } from './utils/version'

void yargs(hideBin(process.argv))
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

      logger.info(`Changelogs:\n\n${changes}`)
      logger.info(`New version: ${getProjectVersion()}`)
    } catch (err) {
      logger.error('Error running release script', err)
    }
  })
  .help().argv

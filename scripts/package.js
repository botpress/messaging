const { execute } = require('./exec')
const fse = require('fs-extra')
const path = require('path')

const package = async () => {
  const version = require(path.join(__dirname, '../package.json')).version.replace(/\./g, '_')

  try {
    await execute('cross-env pkg package.json', undefined, { silent: true })

    await fse.rename('./bin/messaging-win.exe', `./bin/messaging-v${version}-win-x64.exe`)
    await fse.rename('./bin/messaging-linux', `./bin/messaging-v${version}-linux-x64`)
    await fse.rename('./bin/messaging-macos', `./bin/messaging-v${version}-darwin-x64`)
  } catch (err) {
    console.error('Error running: ', err.cmd, '\nMessage: ', err.stderr, err)
  }
}

package()

require('bluebird-global')
const { exec } = require('child_process')

const execute = async (cmd, opts, { silent } = { silent: false }) => {
  await Promise.fromCallback(cb => {
    const proc = exec(cmd, opts, cb)
    if (!silent) {
      proc.stdout.pipe(process.stdout)
      proc.stderr.pipe(process.stderr)
    }
  })
}

module.exports = { execute }

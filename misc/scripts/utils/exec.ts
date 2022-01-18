import { exec } from 'child_process'

export type Options = Parameters<typeof exec>[1]

export const execute = async (cmd: string, opts: Options, { silent } = { silent: false }) => {
  await new Promise((resolve, reject) => {
    const proc = exec(cmd, opts, (err) => (err ? reject(err) : resolve(undefined)))
    if (!silent) {
      proc.stdout?.pipe(process.stdout)
      proc.stderr?.pipe(process.stderr)
    }
  })
}

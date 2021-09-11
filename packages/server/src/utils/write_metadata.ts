import { exec } from 'child_process'
import fs from 'fs'
import path from 'path'

const metadata = {
  version: require(path.join(__dirname, '../../package.json')).version,
  date: Date.now(),
  branch: 'master'
}

try {
  exec('git rev-parse --abbrev-ref HEAD', (err, currentBranch) => {
    metadata.branch = currentBranch.replace('\n', '')
    fs.writeFileSync(path.resolve(__dirname, '../metadata.json'), JSON.stringify(metadata, undefined, 2), 'utf-8')
  })
} catch (err) {
  console.error("Couldn't get active branch", err)
}

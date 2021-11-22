import { exec } from 'child_process'
import fs from 'fs'
import path from 'path'

try {
  exec('git rev-parse --abbrev-ref HEAD', (_, currentBranch) => {
    const metadata = {
      date: Date.now(),
      branch: currentBranch.replace('\n', '')
    }

    fs.writeFileSync(path.resolve(__dirname, './metadata.json'), JSON.stringify(metadata, undefined, 2), 'utf-8')
  })
} catch (e) {
  console.error("Couldn't get active branch", e)
}

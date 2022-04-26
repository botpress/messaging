const fse = require('fs-extra')
const path = require('path')

const rootDir = path.join(__dirname, '..')

const files = [
  { source: './src/builtin', dest: './dist/builtin' },
  { source: './src/typings/node.d.txt', dest: './dist/typings/node.d.txt' },
  { source: './src/typings/es6include.txt', dest: './dist/typings/es6include.txt' },
  { source: './src/sdk/botpress.d.ts', dest: './dist/sdk/botpress.d.txt' },
  { source: './src/sdk/botpress.runtime.d.ts', dest: './dist/sdk/botpress.runtime.d.txt' }
]

for (const file of files) {
  const source = path.join(rootDir, file.source)
  const target = path.join(rootDir, file.dest)

  fse.copySync(source, target)
}

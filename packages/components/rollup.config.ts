import css from 'rollup-plugin-import-css'
import typescriptPlugin from 'rollup-plugin-typescript2'
import typescript from 'typescript'
import pkg from './package.json'

const input = 'src/index.tsx'

const external = [...Object.keys(pkg.dependencies || {}), ...Object.keys(pkg.peerDependencies || {})]

const plugins = [
  typescriptPlugin({
    typescript
  }),
  css()
]

export default [
  {
    input,
    output: {
      file: pkg.module,
      format: 'esm',
      sourcemap: true
    },
    plugins,
    external
  },
  {
    input,
    output: {
      file: pkg.main,
      format: 'cjs',
      sourcemap: true
    },
    plugins,
    external
  }
]

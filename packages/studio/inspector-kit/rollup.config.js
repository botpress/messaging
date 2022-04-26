import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import typescript from '@rollup/plugin-typescript'
import { terser } from 'rollup-plugin-terser'
import external from 'rollup-plugin-peer-deps-external'
import postcss from 'rollup-plugin-postcss'
import dts from 'rollup-plugin-dts'
import json from '@rollup/plugin-json'
import autoprefixer from 'autoprefixer'
import sass from 'node-sass'

const packageJson = require('./package.json')

const config = [
  {
    input: 'src/index.ts',
    output: [
      {
        file: packageJson.main,
        format: 'cjs',
        sourcemap: true,
        name: packageJson.name
      },
      {
        file: packageJson.module,
        format: 'esm',
        sourcemap: true
      }
    ],
    plugins: [
      external(),
      resolve(),
      json(),
      commonjs(),
      typescript({ tsconfig: './tsconfig.json' }),
      postcss({
        preprocessor: (content, id) =>
          new Promise((resolve, reject) => {
            const result = sass.renderSync({ file: id })
            resolve({ code: result.css.toString() })
          }),
        plugins: [autoprefixer],
        sourceMap: true,
        extensions: ['.scss', '.css']
      }),
      terser()
    ]
  },
  {
    input: 'lib/esm/dist/index.d.ts',
    output: [{ file: 'lib/index.d.ts', format: 'esm' }],
    external: [/\.s?css$/],
    plugins: [dts()]
  }
]

export default config

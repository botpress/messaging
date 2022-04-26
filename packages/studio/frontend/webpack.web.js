process.traceDeprecation = true

const chalk = require('chalk')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const FileManagerPlugin = require('filemanager-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const moment = require('moment')
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin')
const path = require('path')
const TerserPlugin = require('terser-webpack-plugin')
const webpack = require('webpack')
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')

const isProduction = process.env.NODE_ENV === 'production'

const webConfig = {
  cache: false,
  mode: isProduction ? 'production' : 'development',
  bail: true,
  devtool: process.argv.find((x) => x.toLowerCase() === '--nomap') ? false : 'source-map',
  entry: {
    web: './src/web/index.tsx'
  },
  node: {
    net: 'empty',
    tls: 'empty',
    dns: 'empty'
  },
  output: {
    path: path.resolve(__dirname, './public/js'),
    publicPath: 'assets/studio/ui/public/js/',
    filename: '[name].[chunkhash].js'
  },
  resolve: {
    extensions: ['.js', '.tsx', '.ts', '.css'],
    alias: {
      '~': path.resolve(__dirname, './src/web'),
      common: path.resolve(__dirname, '../studio-be/dist/common'),
      'botpress/sdk': path.resolve(__dirname, '../studio-be/src/sdk/botpress.d.ts')
    }
  },
  optimization: {
    minimizer: [
      new TerserPlugin({
        sourceMap: true
      })
    ],
    splitChunks: {
      chunks: 'async',
      minChunks: 2,
      automaticNameDelimiter: '~',
      cacheGroups: {
        commons: {
          name: 'commons',
          chunks: 'initial',
          minSize: 0
        },
        default: {
          minChunks: 2,
          priority: -20,
          reuseExistingChunk: true
        }
      }
    },
    occurrenceOrder: true
  },
  infrastructureLogging: {
    level: 'error'
  },
  plugins: [
    new HtmlWebpackPlugin({
      inject: true,
      hash: true,
      chunksSortMode: 'none',
      template: './src/web/index.html',
      filename: '../index.html',
      chunks: ['commons', 'web']
    }),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: isProduction ? JSON.stringify('production') : JSON.stringify('development')
      }
    }),
    new CleanWebpackPlugin(['public']),
    new FileManagerPlugin({
      events: {
        onStart: [
          {
            copy: [
              {
                source: path.resolve(__dirname, './src/web/img'),
                destination: path.resolve(__dirname, './public/img')
              },
              {
                source: path.resolve(__dirname, './src/web/audio'),
                destination: path.resolve(__dirname, './public/audio')
              },
              {
                source: path.resolve(__dirname, './src/web/external'),
                destination: path.resolve(__dirname, './public/external')
              }
            ]
          }
        ],
        onEnd: [
          {
            delete: [{ source: path.resolve(__dirname, '../studio-be/dist/ui/public'), options: { force: true } }]
          },
          {
            copy: [
              {
                source: 'public',
                destination: path.resolve(__dirname, '../studio-be/dist/ui/public')
              }
            ]
          }
        ]
      }
    }),
    new MonacoWebpackPlugin({
      languages: ['json', 'javascript', 'typescript'],
      features: [
        'bracketMatching',
        'colorDetector',
        'comment',
        'codelens',
        'contextmenu',
        'coreCommands',
        'clipboard',
        'dnd',
        'find',
        'folding',
        'format',
        'goToDefinitionCommands',
        'goToDefinitionMouse',
        'gotoLine',
        'hover',
        'inPlaceReplace',
        'links',
        'onTypeRename',
        'parameterHints',
        'quickCommand',
        'quickOutline',
        'rename',
        'smartSelect',
        'suggest',
        'wordHighlighter',
        'wordOperations',
        'wordPartOperations'
      ]
    })
  ],

  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        exclude: /node_modules/,
        options: {
          transpileOnly: true
        }
      },
      {
        test: /\.md$/,
        use: [
          {
            loader: 'raw-loader'
          }
        ]
      },
      {
        test: /\.scss$/,
        use: [
          {
            loader: 'style-loader'
          },
          {
            loader: 'css-modules-typescript-loader'
          },
          {
            loader: 'css-loader',
            options: {
              modules: true,
              url: false,
              importLoaders: 1,
              localIdentName: '[name]__[local]___[hash:base64:5]'
            }
          },
          {
            loader: 'postcss-loader'
          },
          {
            loader: 'sass-loader'
          }
        ]
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.woff|\.woff2|\.svg|.eot|\.ttf/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '../fonts/[name].[ext]'
            }
          }
        ]
      }
    ]
  }
}

if (process.argv.find((x) => x.toLowerCase() === '--analyze')) {
  webConfig.plugins.push(new BundleAnalyzerPlugin())
}

const showNodeEnvWarning = () => {
  if (!isProduction) {
    console.log(
      chalk.yellow('WARNING: You are currently building Botpress in development; NOT generating a production build')
    )
    console.log(chalk.yellow('Run with NODE_ENV=production to create a production build instead'))
  }
}

const compiler = webpack(webConfig)

compiler.hooks.done.tap('ExitCodePlugin', (stats) => {
  const errors = stats.compilation.errors
  if (errors && errors.length && process.argv.indexOf('--watch') === -1) {
    for (const e of errors) {
      console.error(e)
      if (e.message) {
        console.error(e.message)
      }
    }
    console.error('Webpack build failed')
    process.exit(1)
  }
})

const postProcess = (err, stats) => {
  if (err) {
    throw err
  } else {
    console.log(`[${moment().format('HH:mm:ss')}] Studio ${chalk.grey(stats.toString('minimal'))}`)
  }
}

if (process.argv.indexOf('--compile') !== -1) {
  showNodeEnvWarning()
  compiler.run(postProcess)
} else if (process.argv.indexOf('--watch') !== -1) {
  compiler.watch(
    {
      ignored: ['*', /!.\/src\/web/]
    },
    postProcess
  )
}

module.exports = {
  web: webConfig
}

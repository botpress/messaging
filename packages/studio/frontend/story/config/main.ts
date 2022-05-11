import path from 'path'

export default {
  stories: ['../../src/**/*.stories.mdx', '../../src/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    '@storybook/addon-storysource'
  ],
  framework: '@storybook/react',
  webpackFinal: async (config: any) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '~': path.resolve(__dirname, '../../')
    }
    // config.resolve.extensions.push('.ts', '.tsx')
    // add SCSS support for CSS Modules
    config.module.rules.push({
      test: /\.scss$/,
      use: ['style-loader', 'css-loader?modules&importLoaders', 'sass-loader'],
      include: path.resolve(__dirname, '../../')
    })

    return config
  }
}

// module.exports = {
//   webpackFinal: async (config: any) => {
//     config.resolve.alias = {
//       ...config.resolve.alias,
//       '~/': path.resolve(__dirname, '../../')
//     }
//     // config.resolve.extensions.push('.ts', '.tsx')
//     return config
//   }
// }

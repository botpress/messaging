const path = require('path')
module.exports = {
  "stories": [
    "../src/**/*.stories.mdx",
    "../src/**/*.stories.@(js|jsx|ts|tsx)"
  ],
  "addons": [
    "@storybook/addon-links",
    "@storybook/addon-essentials"
  ],
  webpackFinal: async (config) => {
    console.log(config.module.rules)
    // config.module.rules.push({
    //   test: /\.css$/i,
    //   use: ["css-loader", "postcss-loader"],
    //   include: path.resolve(__dirname, '../src'),
    // });
    return config;
  },
}
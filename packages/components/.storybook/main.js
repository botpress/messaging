module.exports = {
  "stories": [
    "../story/**/*.stories.mdx",
    "../story/**/*.stories.@(js|jsx|ts|tsx)"
  ],
  features: {
    postcss: false,
  },
  "addons": [
    "@storybook/addon-links",
    "@storybook/addon-essentials"
  ]
}

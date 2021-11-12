module.exports = {
  "stories": [
    "../src/**/*.stories.mdx",
    "../src/**/*.stories.@(js|jsx|ts|tsx)"
  ],
  features: {
    postcss: false,
  },
  "addons": [
    "@storybook/addon-links",
    "@storybook/addon-essentials"
  ]
}

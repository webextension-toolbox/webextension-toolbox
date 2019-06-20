const compileWebpack = require('webpack')
const configureWebpack = require('./webpack-config.js')
const getConfigFile = require('./utils/get-config-file-config')

module.exports = (env = {}) => {
  // Get user config file
  const { webpack, ...config } = getConfigFile(env.config)

  // Configure userWebpackHook
  const userWebpackHook = webpack || (config => config)

  // Create webpack configuration
  let webpackConfig = configureWebpack({
    ...env,
    ...config
  })

  // Let the user overwrite webpack config
  webpackConfig = userWebpackHook(webpackConfig, env)

  // Run webpack
  return compileWebpack(webpackConfig)
}

import compileWebpack from 'webpack'
import configureWebpack from './webpack.mjs'
import { findUpSync } from 'find-up'

export default async (options = {}) => {
  // Get user config file
  const { webpack, ...config } = await getConfigFile(options.config)

  // Configure userWebpackHook
  const userWebpackHook = webpack || ((config) => config)

  // Create webpack configuration
  let webpackConfig = await configureWebpack({
    ...options,
    ...config
  })

  // Let the user overwrite webpack config
  webpackConfig = userWebpackHook(webpackConfig, options)

  // Run webpack
  return compileWebpack(webpackConfig)
}

async function getConfigFile (customFilePath) {
  const path = findUpSync(customFilePath)

  let config = {}

  if (path && path.length) {
    const configModule = await import(path)
    config = configModule.default || configModule
  } else {
    // TODO: warn
  }

  return config
}

const { resolve } = require('path')
const webpack = require('webpack')
const CleanPlugin = require('clean-webpack-plugin')
const GlobEntriesPlugin = require('webpack-watched-glob-entries-plugin')
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin')
const CopyPlugin = require('copy-webpack-plugin')
const ZipPlugin = require('zip-webpack-plugin')
const compileManifest = require('./manifest')
const getExtensionInfo = require('./utils/getExtensionInfo')
const getExtensionFileType = require('./utils/getExtensionFileType')
const validateVendor = require('./utils/validateVendor')
const createPreset = require('./preset')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')

module.exports = function compile ({
  src = 'app',
  target = 'build/[vendor]',
  packageTarget = 'packages',
  dev = false,
  copyIgnore = [ '**/*.js', '**/*.json' ],
  autoReload = false,
  devtool = false,
  pack = false,
  vendor = 'chrome',
  vendorVersion
} = {}) {
  // Input validation
  validateVendor(vendor)

  // Compile variable targets
  target = resolve(target.replace('[vendor]', vendor))
  packageTarget = resolve(packageTarget.replace('[vendor]', vendor))

  // Get some defaults
  const { version, name, description } = getExtensionInfo(src)
  const mode = dev ? 'development' : 'production'

  /******************************/
  /*      WEBPACK               */
  /******************************/
  const webpackConfig = {
    mode,
    context: resolve(src, '../')
  }

  // Source-Maps
  webpackConfig.devtool = devtool

  /******************************/
  /*       WEBPACK.ENTRY        */
  /******************************/
  const entries = []

  // Add main entry glob
  entries.push(resolve(src, '*.js'))
  entries.push(resolve(src, '?(scripts)/*.js'))

  // Add autoReload in dev
  if (autoReload && ['chrome', 'opera'].includes(vendor)) {
    entries.push(
      resolve(__dirname, './auto-reload')
    )
  }

  // We use the GlobEntriesPlugin in order to
  // restart the compiler in watch mode, when new
  // files got added.
  webpackConfig.entry = GlobEntriesPlugin.getEntries(
    entries
  )

  /******************************/
  /*       WEBPACK.OUTPUT       */
  /******************************/
  webpackConfig.output = {
    path: target,
    filename: '[name].js',
    chunkFilename: '[id].chunk.js'
  }

  /******************************/
  /*       WEBPACK.LOADERS      */
  /******************************/
  webpackConfig.module = {
    rules: []
  }

  // Add babel support
  webpackConfig.module.rules.push({
    test: /\.(js|jsx|mjs)$/,
    exclude: /node_modules/,
    use: {
      loader: require.resolve('babel-loader'),
      options: {
        cacheDirectory: true,
        ...createPreset({
          vendor,
          vendorVersion
        })
      }
    }
  })

  /******************************/
  /*     WEBPACK.PLUGINS        */
  /******************************/
  webpackConfig.plugins = []

  // Clear output directory
  webpackConfig.plugins.push(new CleanPlugin([target], { allowExternal: true }))

  // Watcher doesn't work well if you mistype casing in a path so we use
  // a plugin that prints an error when you attempt to do this.
  webpackConfig.plugins.push(new CaseSensitivePathsPlugin())

  // Add Wilcard Entry Plugin
  webpackConfig.plugins.push(new GlobEntriesPlugin())

  // Add module names to factory functions so they appear in browser profiler
  if (dev) {
    webpackConfig.plugins.push(new webpack.NamedModulesPlugin())
  }

  // Add webextension polyfill
  if (['chrome', 'opera'].includes(vendor)) {
    webpackConfig.plugins.push(
      new webpack.ProvidePlugin({
        browser: require.resolve('./webextension-polyfill')
      })
    )
  }

  // Set environment vars
  webpackConfig.plugins.push(
    new webpack.EnvironmentPlugin({
      NODE_ENV: mode,
      VENDOR: vendor,
      WEBEXTENSION_TOOLBOX_VERSION: version
    })
  )

  // Copy non js files & compile manifest
  webpackConfig.plugins.push(
    new CopyPlugin([
      {
        // Copy all files except (.js, .json, _locales)
        context: src,
        from: '**/*',
        ignore: copyIgnore,
        to: target
      },
      {
        // Copy & Tranform manifest
        from: resolve(src, './manifest.json'),
        transform: str => compileManifest(str, {
          vendor,
          autoReload,
          name,
          version,
          description
        })
      },
      {
        // Copy all files except (.js, .json, _locales)
        context: src,
        from: '_locales/**/*.json',
        to: target
      }
    ])
  )

  // Minify in production
  if (!dev) {
    webpackConfig.plugins.push(new UglifyJsPlugin({
      uglifyOptions: {
        ecma: 8
      }
    }))
  }

  // Pack extension
  if (pack) {
    webpackConfig.plugins.push(new ZipPlugin({
      path: packageTarget,
      filename: `${name}.v${version}.${vendor}.${getExtensionFileType(vendor)}`
    }))
  }

  return webpack(webpackConfig)
}

const { resolve } = require('path')
const webpack = require('webpack')
const CleanPlugin = require('clean-webpack-plugin')
const GlobEntriesPlugin = require('webpack-watched-glob-entries-plugin')
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin')
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin')
const CopyPlugin = require('copy-webpack-plugin')
const MinifyPlugin = require('babel-minify-webpack-plugin')
const ZipPlugin = require('zip-webpack-plugin')
const compileManifest = require('./manifest')
const getExtensionInfo = require('./utils/getExtensionInfo')
const getExtensionFileType = require('./utils/getExtensionFileType')
const validateVendor = require('./utils/validateVendor')
const capitalize = require('./utils/capitalize')

module.exports = function compile ({
  src = 'app',
  target = 'build/[vendor]',
  packageTarget = 'packages',
  dev = false,
  copyIgnore = [ '*.js', '*.json', '!_locales/**/*.json' ],
  autoReload = false,
  devtool = false,
  pack = false,
  vendor = 'chrome'
} = {}) {
  // Input validation
  validateVendor(vendor)

  // Compile variable targets
  target = resolve(target.replace('[vendor]', vendor))
  packageTarget = resolve(packageTarget.replace('[vendor]', vendor))

  // Get some defaults
  const { version, name, description } = getExtensionInfo(src)

  /******************************/
  /*      WEBPACK               */
  /******************************/
  const webpackConfig = {}

  // Source-Maps
  webpackConfig.devtool = devtool

  /******************************/
  /*       WEBPACK.ENTRY        */
  /******************************/
  const entries = []

  // Add main entry glob
  entries.push(resolve(src, '*.js'))
  entries.push(resolve(src, 'scripts/*.js'))

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
    include: resolve(__dirname, src),
    use: {
      loader: require.resolve('babel-loader'),
      options: {
        babelrc: false,
        cacheDirectory: true,
        presets: [
          // Latest stable ECMAScript features
          [
            require.resolve('@babel/preset-env'), {
              targets: {
                browsers: [`last 2 ${capitalize(vendor)} versions`]
              },
              useBuiltIns: 'usage'
            }
          ],
          // JSX, Flow
          require.resolve('@babel/preset-react')
        ]
      }
    }
  })

  /******************************/
  /*     WEBPACK.PLUGINS        */
  /******************************/
  webpackConfig.plugins = []

  // Clear output directory
  webpackConfig.plugins.push(new CleanPlugin([target], { allowExternal: true }))

  // Add CaseSensitivePathsPlugin
  webpackConfig.plugins.push(new CaseSensitivePathsPlugin())

  // Add Wilcard Entry Plugin
  webpackConfig.plugins.push(new GlobEntriesPlugin())

  // Improve log output in devmode
  if (dev) {
    webpackConfig.plugins.push(new FriendlyErrorsPlugin())
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
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': dev ? '"development"' : '"production"',
      'process.env.VENDOR': `"${vendor}"`,
      'process.env.WEBEXTENSION_TOOLBOX_VERSION': `"${version}"`
    })
  )

  // Copy non js files & compile manifest
  webpackConfig.plugins.push(
    new CopyPlugin([
      {
        // Copy all files except (.js, .json, _locales)
        context: src,
        from: '**/*',
        copyIgnore,
        to: target
      },
      {
        // Copy _locales
        context: resolve(src, '_locales'),
        from: '**/*.json',
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
      }
    ])
  )

  // Minify in production
  if (!dev) {
    webpackConfig.plugins.push(new MinifyPlugin())
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

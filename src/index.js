const { resolve } = require('path')
const webpack = require('webpack')
const globEntry = require('webpack-glob-entry')
const CleanPlugin = require('clean-webpack-plugin')
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin')
const CopyPlugin = require('copy-webpack-plugin')
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin')
const MinifyPlugin = require('babel-minify-webpack-plugin')
const ZipPlugin = require('zip-webpack-plugin')
const compileManifest = require('./manifest')
const getExtensionInfo = require('./utils/getExtensionInfo')
const getExtensionFileType = require('./utils/getExtensionFileType')
const validateVendor = require('./utils/validateVendor')
const capitalize = require('./utils/capitalize')

function compile ({
  src = 'app',
  target = 'build/[vendor]',
  dev = false,
  copyIgnore = [ '*.js', '*.json', '_locales/**/*' ],
  autoReload = false,
  devtool = 'cheap-source-map',
  pack = false,
  vendor = 'chrome'
} = {}) {
  target = resolve(target.replace('[vendor]', vendor))
  validateVendor(vendor)
  const { version, name, description } = getExtensionInfo(src)
  const webpackConfig = {}

  // Source-Maps
  webpackConfig.devtool = devtool

  /******************************/
  /*           ENTRY            */
  /******************************/
  webpackConfig.entry = globEntry(
    resolve(src, '*.js'),
    resolve(src, 'scripts/*.js')
  )

  // Add autoReload in dev
  if (autoReload) {
    webpackConfig.entry.autoReload = resolve(
      __dirname,
      './autoReload'
    )
  }

  /******************************/
  /*          OUTPUT            */
  /******************************/
  webpackConfig.output = {
    path: target,
    filename: '[name].js',
    chunkFilename: '[id].chunk.js'
  }

  /******************************/
  /*         LOADERS            */
  /******************************/
  webpackConfig.module = {
    rules: []
  }

  // Add babel support
  webpackConfig.module.rules.push({
    test: /\.js$/,
    exclude: /node_modules/,
    use: {
      loader: 'babel-loader',
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
  /*         PLUGINS            */
  /******************************/
  webpackConfig.plugins = []

  // Add CaseSensitivePathsPlugin
  webpackConfig.plugins.push(new CaseSensitivePathsPlugin())

  // Clear output directory
  webpackConfig.plugins.push(new CleanPlugin([target], { allowExternal: true }))

  // Improve log output in devmode
  if (dev) {
    webpackConfig.plugins.push(new FriendlyErrorsPlugin())
  }

  // Add webextension polyfill
  if (['chrome', 'opera'].includes(vendor)) {
    webpackConfig.plugins.push(
      new webpack.ProvidePlugin({
        browser: resolve(__dirname, './webextensionPolyfill')
      })
    )
  }

  // Set environment vars
  webpackConfig.plugins.push(
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': dev ? '"development"' : '"production"',
      'process.env.VENDOR': `"${vendor}"`
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
      path: resolve(target, '../../packages'),
      filename: `${name}.v${version}.${vendor}.${getExtensionFileType(vendor)}`
    }))
  }

  return webpack(webpackConfig)
}

module.exports = compile

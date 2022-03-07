import { resolve } from 'path'
import webpack from 'webpack'
import { CleanWebpackPlugin } from 'clean-webpack-plugin'
import GlobEntriesPlugin from 'webpack-watched-glob-entries-plugin'
import CaseSensitivePathsPlugin from 'case-sensitive-paths-webpack-plugin'
import CopyPlugin from 'copy-webpack-plugin'
import ZipPlugin from 'zip-webpack-plugin'
import WebextensionPlugin from 'webpack-webextension-plugin'
import getExtensionInfo from './utils/getExtensionInfo.mjs'
import WebpackBar from 'webpackbar'
import browserslist from 'browserslist'
import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin';

const { EnvironmentPlugin } = webpack
const { data: browserslistData } = browserslist
const { getEntries } = GlobEntriesPlugin

export default async function webpackConfig ({
  src = 'app',
  target = 'build/[vendor]',
  packageTarget = 'packages',
  dev = false,
  copyIgnore = ['**/*.js', '**/*.json', '**/*.ts', '**/*.tsx'],
  devtool = false,
  minimize = false,
  vendor = 'chrome',
  validateManifest = false,
  vendorVersion
} = {}) {
  const mode = dev ? 'development' : 'production'

  // Set the NODE_ENV (needed for babel)
  process.env.NODE_ENV = mode

  // Compile variable targets
  target = resolve(target.replace('[vendor]', vendor))
  packageTarget = resolve(packageTarget.replace('[vendor]', vendor))

  // Get some defaults
  const { version, name, description, typescript } = await getExtensionInfo(src)

  /******************************/
  /*      WEBPACK               */
  /******************************/
  const config = {
    mode,
    context: resolve(src)
  }

  // Automatically resolve the following extensions:
  if(typescript) {
    config.resolve = {
      extensions: ['.js', '.json', '.mjs', '.jsx', '.ts', '.tsx']
    }
  } else {
    config.resolve = {
      extensions: ['.js', '.json', '.mjs', '.jsx']
    }
  }

  // Source-Maps
  config.devtool = devtool

  /******************************/
  /*       WEBPACK.ENTRY        */
  /******************************/
  const entries = []

  // Add main entry glob
  if(typescript) {
    entries.push(resolve(src, '*.{js,mjs,jsx,ts,tsx}'))
    entries.push(resolve(src, '?(scripts)/*.{js,mjs,jsx,ts,tsx}'))
  } else {
    entries.push(resolve(src, '*.{js,mjs,jsx}'))
    entries.push(resolve(src, '?(scripts)/*.{js,mjs,jsx}'))
  }

  // We use the GlobEntriesPlugin in order to
  // restart the compiler in watch mode, when new
  // files got added.
  config.entry = getEntries(
    entries,
    {
      ignore: []
    }
  )

  /******************************/
  /*       WEBPACK.OUTPUT       */
  /******************************/
  config.output = {
    path: target,
    filename: '[name].js',
    chunkFilename: '[id].chunk.js'
  }
  /******************************/
  /*    WEBPACK.OPTIMIZATION    */
  /******************************/
  config.optimization = { minimize }

  /******************************/
  /*       WEBPACK.LOADERS      */
  /******************************/
  config.module = {
    rules: []
  }

  // Add babel support
  config.module.rules.push({
    test: /\.(js|jsx|mjs)$/,
    exclude: /node_modules/,
    use: {
      loader: 'babel-loader',
      options: {
        cacheDirectory: false,
        presets: [
          ['@babel/preset-env', {
            // Do not transform modules to CJS
            modules: false,
            // Restrict to vendor
            targets: {
              [vendor]: vendorVersion || getLastNVendorVersion(3, vendor)
            }
          }]
        ]
      }
    }
  })

  //Add TypeScript support
  if(typescript) {
    config.module.rules.push({
      test: /\.tsx?$/,
      loader: 'ts-loader'
    })
  }


  /******************************/
  /*     WEBPACK.PLUGINS        */
  /******************************/
  config.plugins = []

  //Use this to load modules whose location is specified in the paths section of tsconfig.json
  if(typescript) {
    config.resolve.plugins = [];
    config.resolve.plugins.push(new TsconfigPathsPlugin())
  }

  // Clear output directory
  config.plugins.push(new CleanWebpackPlugin())

  // Watcher doesn't work well if you mistype casing in a path so we use
  // a plugin that prints an error when you attempt to do this.
  config.plugins.push(new CaseSensitivePathsPlugin())

  // Add Wilcard Entry Plugin
  config.plugins.push(new GlobEntriesPlugin())

  // Set environment vars
  config.plugins.push(
    new EnvironmentPlugin({
      VENDOR: vendor,
      WEBEXTENSION_TOOLBOX_VERSION: version
    })
  )

  // Copy non js files & compile manifest
  config.plugins.push(
    new CopyPlugin({
      patterns: [
        {
          // Copy all files except (.js, .json, _locales)
          context: resolve(src),
          from: resolve(src, '**/*').replace(/\\/g, '/'),
          globOptions: {
            ignore: copyIgnore
          },
          to: target
        },
        {
          // Copy all language json files
          context: resolve(src),
          from: resolve(src, '_locales/**/*.json').replace(/\\/g, '/'),
          to: target
        }
      ]
    })
  )

  // Compile and validate manifest and autoreload
  // extension in watch mode
  config.plugins.push(
    new WebextensionPlugin({
      vendor,
      manifestDefaults: {
        name,
        description,
        version
      },
      skipManifestValidation: !validateManifest
    })
  )

  // Pack extension
  if (mode === 'production') {
    config.plugins.push(new ZipPlugin({
      path: packageTarget,
      filename: `${name}.v${version}.${vendor}.${getExtensionFileType(vendor)}`
    }))
  }

  // Disable webpacks usage of eval & function string constructor
  // @url https://github.com/webpack/webpack/blob/master/buildin/global.js
  config.node = false

  // In order to still be able to use global we use window instead
  /*
  config.plugins.push(
    new ProvidePlugin({
      global: require.resolve('./utils/global.js')
    })
  )
  */

  config.plugins.push(new WebpackBar())

  return config
}

/**
 * Returns last n
 * vendor version
 * @param {integer} n
 * @param {string} vendor
 * @return {Number} version
 */
function getLastNVendorVersion (n, vendor) {
  const { released } = browserslistData[vendor]
  return released[released.length - n]
}

function getExtensionFileType (vendor) {
  switch (vendor) {
    case 'firefox':
      return 'xpi'
    case 'opera':
      return 'crx'
    default:
      return 'zip'
  }
}

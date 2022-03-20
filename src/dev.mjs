import compile from './common/compile.mjs'
import WebpackDevServer from 'webpack-dev-server'
import path from 'path'

export default async function (vendor, options) {
  const compiler = await compile({
    vendor,
    dev: true,
    devtool: options.devtool,
    src: options.src,
    minimize: false,
    target: options.target,
    autoReload: options.autoReload,
    vendorVersion: options.vendorVersion,
    validateManifest: options.validateManifest,
    config: options.config,
    port: options.port ?? 35729
  })

  if (options.verbose) {
    compiler.hooks.watchRun.tap('WebpackInfo', function () {
      console.error('\nCompilation starting…\n')
    })
  }

  if (options.devServer) {
    const devServerPort = process.env.DEV_SERVER_PORT || 9000
    const server = new WebpackDevServer(compiler, {
      contentBase: path.join(
        process.cwd(),
        options.target.split('[vendor]').join(vendor)
      ),
      compress: true,
      port: devServerPort,
      stats: {
        colors: true
      },
      historyApiFallback: {
        index: 'index.html'
      }
    })
    server.listen(devServerPort, '127.0.0.1', () => {
      console.log(`Starting dev server on http://localhost:${devServerPort}`)
    })
  } else {
    compiler.watch({}, logCompileOutput.bind(null, options))
  }
}

function logCompileOutput (options, error, stats) {
  if (error) {
    console.error(error)
  }

  console.log(
    stats.toString({
      colors: true,
      version: false,
      hash: false
    })
  )

  if (options.verbose) {
    console.error('\nCompilation finished\n')
  }
}

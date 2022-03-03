import { program } from "commander";
import chalk from "chalk";
import { promises as fs } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import build from "./src/build.mjs";
import dev from "./src/dev.mjs";

const __filename = fileURLToPath(import.meta.url);
const { version } = JSON.parse(await fs.readFile("package.json"));

const { blue, bold } = chalk;

program
  .name(path.basename(__filename))
  .description(blue(`              ╔════════╗
  ╔══════════════════════════════╗
  ║     ${bold.yellow('WEBEXTENSION-TOOLBOX')}     ║
  ╚══════════════════════════════╝`))
  .version(version);

program
  .command("dev")
  .description("Compiles extension in devmode")
  .argument("<vendor>", "The Vendor to compile")
  .option(
    "-c, --config [config]",
    "specify config file path",
    "./webextension-toolbox.config.js"
  )
  .option("-s, --src [src]", "specify source directory", "app")
  .option("-t, --target [target]", "specify target directory", "dist/[vendor]")
  .option(
    "-d, --devtool [devtool]",
    "controls if and how source maps are generated",
    "cheap-source-map"
  )
  .option(
    "-r, --autoReload [autoReload]",
    "reload extension after rebuild",
    true
  )
  .option(
    "-v, --vendorVersion [vendorVersion]",
    "last supported vendor (default: current)"
  )
  .option(
    "--dev-server [devServer]",
    "use webpack dev server to serve bundled files",
    false
  )
  .option(
    "--validateManifest [validateManifest]",
    "validate manifest syntax",
    false
  )
  .option(
    "--verbose [verbose]",
    "print messages at the beginning and end of incremental build",
    false
  )
  .action(dev);

program
  .command("build")
  .description("Compiles extension for production")
  .argument("<vendor>", "The Vendor to compile").option('-c, --config [config]', 'specify config file path', './webextension-toolbox.config.js')
  .option('-s, --src [src]', 'specify source directory', 'app')
  .option('-t, --target [target]', 'specify target directory', 'dist/[vendor]')
  .option('-d, --devtool [devtool]', 'controls if and how source maps are generated', false)
  .option('-m, --no-minimize', 'disables code minification', false)
  .option('-v, --vendorVersion [vendorVersion]', 'last supported vendor (default: current)')
  .option('--validateManifest [validateManifest]', 'validate manifest syntax', false)
  .action(build)

program.parse();

/*
version('1.3.4')

command('dev <vendor>')
  .description('Compiles extension in devmode')
  .option('-c, --config [config]', 'specify config file path', './webextension-toolbox.config.js')
  .option('-s, --src [src]', 'specify source directory', 'app')
  .option('-t, --target [target]', 'specify target directory', 'dist/[vendor]')
  .option('-d, --devtool [devtool]', 'controls if and how source maps are generated', 'cheap-source-map')
  .option('-r, --autoReload [autoReload]', 'reload extension after rebuild', true)
  .option('-v, --vendorVersion [vendorVersion]', 'last supported vendor (default: current)')
  .option("--dev-server [devServer]", "use webpack dev server to serve bundled files", false)
  .option('--validateManifest [validateManifest]', 'validate manifest syntax', false)
  .option('--verbose [verbose]', 'print messages at the beginning and end of incremental build', false)
  .action(function watch (vendor, options) {
    logBanner()
    const compiler = compile({
      vendor,
      dev: true,
      devtool: options.devtool,
      src: options.src,
      minimize: false,
      target: options.target,
      autoReload: options.autoReload,
      vendorVersion: options.vendorVersion,
      validateManifest: options.validateManifest,
      config: options.config
    })

    if (options.verbose) {
      compiler.hooks.watchRun.tap('WebpackInfo', function () {
        console.error('\nCompilation starting…\n')
      })
    }

    if (options.devServer) {
      const devServerPort = process.env.DEV_SERVER_PORT || 9000;
      const server = new WebpackDevServer(compiler, {
        contentBase: path.join(
          process.cwd(),
          options.target.split("[vendor]").join(vendor)
        ),
        compress: true,
        port: devServerPort,
        stats: {
          colors: true
        },
        historyApiFallback: {
          index: "index.html"
        }
      });
      server.listen(devServerPort, "127.0.0.1", () => {
        console.log(`Starting dev server on http://localhost:${devServerPort}`);
      });
    } else {
      compiler.watch({}, logCompileOutput.bind(null, options));
    }
  })

command('build <vendor>')
  .description('Compiles extension for production')
  .option('-c, --config [config]', 'specify config file path', './webextension-toolbox.config.js')
  .option('-s, --src [src]', 'specify source directory', 'app')
  .option('-t, --target [target]', 'specify target directory', 'dist/[vendor]')
  .option('-d, --devtool [devtool]', 'controls if and how source maps are generated', false)
  .option('-m, --no-minimize', 'disables code minification', false)
  .option('-v, --vendorVersion [vendorVersion]', 'last supported vendor (default: current)')
  .option('--validateManifest [validateManifest]', 'validate manifest syntax', false)
  .action(function build (vendor, options) {
    logBanner()
    compile({
      vendor,
      devtool: options.devtool,
      src: options.src,
      target: options.target,
      minimize: options.minimize,
      autoReload: false,
      vendorVersion: options.vendorVersion,
      validateManifest: options.validateManifest,
      config: options.config
    }).run(logCompileOutput.bind(null, options))
  })

parse(process.argv)

function logCompileOutput (options, error, stats) {
  if (error) {
    console.error(error)
  }

  console.log(stats.toString({
    colors: true,
    version: false,
    hash: false
  }))

  if (options.verbose) {
    console.error('\nCompilation finished\n')
  }
}

function logBanner () {
  const banner = `
           ╔════════╗
╔══════════════════════════════╗
║     WEBEXTENSION-TOOLBOX     ║
╚══════════════════════════════╝`
  const colouredBanner = blue(
    banner.replace('WEBEXTENSION-TOOLBOX', bold.yellow('WEBEXTENSION-TOOLBOX'))
  )
  console.log(colouredBanner)
}
*/

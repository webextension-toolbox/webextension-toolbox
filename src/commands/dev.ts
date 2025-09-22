import WebpackDevServer from "webpack-dev-server";
import path from "path";
import type { Compiler, MultiCompiler } from "webpack";
import {
  compile,
  logCompileOutput,
  DevCompileOptions,
} from "../common/index.js";

function isMultiCompiler(
  compiler: Compiler | MultiCompiler
): compiler is MultiCompiler {
  return "compilers" in compiler;
}

function getCompilers(compiler: Compiler | MultiCompiler): Compiler[] {
  return isMultiCompiler(compiler) ? compiler.compilers : [compiler];
}

export default async function dev(vendor: string, options: DevCompileOptions) {
  const compiler = await compile({
    vendor,
    devtool: options.devtool,
    dev: true,
    src: options.src,
    minimize: false,
    target: options.target,
    autoReload: options.autoReload,
    vendorVersion: options.vendorVersion,
    manifestValidation: options.manifestValidation,
    config: options.config,
    port: options.port ?? 35729,
    swc: options.swc ?? false,
  });

  if (!compiler) {
    throw new Error("Failed to initialize webpack compiler.");
  }

  if (options.verbose) {
    getCompilers(compiler).forEach((activeCompiler) => {
      activeCompiler.hooks.watchRun.tap("WebpackInfo", () => {
        console.error("\nCompilation starting…\n");
      });
    });
  }

  if (options.devServer) {
    const envPort = process.env.DEV_SERVER_PORT;
    const devServerPort = Number(envPort ?? 9000);
    const normalizedPort = Number.isNaN(devServerPort) ? 9000 : devServerPort;
    const host = "127.0.0.1";
    const server = new WebpackDevServer(
      {
        static: {
          directory: path.join(
            process.cwd(),
            options.target.split("[vendor]").join(vendor)
          ),
        },
        compress: true,
        host,
        port: normalizedPort,
        devMiddleware: {
          stats: {
            colors: true,
          },
        },
        historyApiFallback: {
          index: "index.html",
        },
      },
      compiler
    );
    await server.start();
    console.log(`Starting dev server on http://${host}:${normalizedPort}`);
  } else {
    compiler.watch({}, logCompileOutput.bind(null, options));
  }
}

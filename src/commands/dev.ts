import WebpackDevServer from "webpack-dev-server";
import path from "path";
import {
  compile,
  logCompileOutput,
  DevCompileOptions,
} from "../common/index.js";

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

  if (options.verbose) {
    compiler.hooks.watchRun.tap("WebpackInfo", () => {
      console.error("\nCompilation starting…\n");
    });
  }

  if (options.devServer) {
    const devServerPort = process.env.DEV_SERVER_PORT || 9000;
    const server = new WebpackDevServer(
      {
        static: {
          directory: path.join(
            process.cwd(),
            options.target.split("[vendor]").join(vendor)
          ),
        },
        compress: true,
        port: devServerPort,
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
    server.listen(devServerPort, "127.0.0.1", () => {
      console.log(`Starting dev server on http://localhost:${devServerPort}`);
    });
  } else {
    compiler.watch({}, logCompileOutput.bind(null, options));
  }
}

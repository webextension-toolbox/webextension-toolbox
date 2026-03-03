import {
  compile,
  logCompileOutput,
  BuildCompileOptions,
} from "../common/index.js";

export default async function build(
  vendor: string,
  options: BuildCompileOptions
) {
  const compiler = await compile({
    vendor,
    devtool: options.devtool,
    dev: false,
    src: options.src,
    target: options.target,
    minimize: options.minimize,
    autoReload: false,
    vendorVersion: options.vendorVersion,
    manifestValidation: options.manifestValidation,
    config: options.config,
    swc: options.swc ?? false,
    outputFilename: options.outputFilename,
  });

  if (!compiler) {
    throw new Error(
      'Failed to initialize webpack compiler. ' +
      'This may be caused by:\n' +
      '  - Invalid webpack configuration in your config file\n' +
      '  - Missing or invalid manifest.json in your src directory\n' +
      '  - Missing required dependencies in node_modules\n' +
      'Try running with --verbose to see detailed error output.'
    );
  }

  compiler.run(logCompileOutput.bind(null, options));
}

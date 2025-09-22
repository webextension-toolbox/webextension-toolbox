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
    throw new Error("Failed to initialize webpack compiler.");
  }

  compiler.run(logCompileOutput.bind(null, options));
}

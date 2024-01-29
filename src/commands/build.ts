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

  compiler.run(logCompileOutput.bind(null, options));
}

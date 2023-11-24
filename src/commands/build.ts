import { compile, logCompileOutput, BuildCompileOptions } from "../common";

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
  });

  compiler.run(logCompileOutput.bind(null, options));
}

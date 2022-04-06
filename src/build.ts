import compile, { CompileOptions } from "./common/compile";
import logCompileOutput from "./common/utils/logCompileOutput";

export default async function build(vendor: string, options: CompileOptions) {
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
  });

  compiler.run(logCompileOutput.bind(null, options));
}

import compile from './common/compile.mjs';

export default async function(vendor, options) {
	const g = await compile({
		vendor,
		devtool: options.devtool,
		src: options.src,
		target: options.target,
		minimize: options.minimize,
		autoReload: false,
		vendorVersion: options.vendorVersion,
		validateManifest: options.validateManifest,
		config: options.config
	  });

	  g.run(logCompileOutput.bind(null, options))
}

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
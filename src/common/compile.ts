import compileWebpack, { Configuration } from "webpack";
import findUp from "find-up";
import configureWebpack from "./webpack";

export interface CompileOptions {
  vendor: string;
  src: string;
  target: string;
  dev?: boolean;
  devtool?: string | false;
  minimize?: boolean;
  autoReload?: boolean;
  vendorVersion?: string;
  manifestValidation?: boolean;
  config?: string;
  port?: number;
  verbose?: boolean;
  devServer?: boolean;
}

export interface UserWebpack extends CompileOptions {
  webpack?: any;
}

async function getConfigFile(options: CompileOptions): Promise<UserWebpack> {
  if (!options.config) {
    return options;
  }

  let path = await findUp(options.config);

  if (path && path.length) {
    if (process.platform === "win32") {
      path = `file:///${path}`;
    }
    const configModule = await import(path);
    return configModule.default || configModule;
  }

  return options;
}

export default async (
  options: CompileOptions = {
    vendor: "chrome",
    target: "dist/[vendor]",
    src: "app",
    dev: false,
  }
) => {
  // Get user config file
  const { webpack, ...config } = await getConfigFile(options);

  // Configure userWebpackHook
  const userWebpackHook = webpack || ((conf: Configuration) => conf);

  // Create webpack configuration
  let webpackConfig = await configureWebpack({
    ...options,
    ...config,
  });

  // Let the user overwrite webpack config
  webpackConfig = userWebpackHook(webpackConfig, options);

  // Run webpack
  return compileWebpack(webpackConfig);
};

import compileWebpack, { Configuration } from "webpack";
import configureWebpack from "./webpack";
import findUp from "find-up";

export interface CompileOptions {
  vendor: string;
  src: string;
  target: string;
  devtool?: string | false;
  minimize?: boolean;
  autoReload?: boolean;
  vendorVersion?: string;
  validateManifest?: boolean;
  config?: string;
  port?: number;
  verbose?: boolean;
  devServer?: boolean;
}

export interface UserWebpack extends CompileOptions {
  webpack?: any;
}

export default async (
  options: CompileOptions = {
    vendor: "chrome",
    target: "dist/[vendor]",
    src: "app",
  }
) => {
  // Get user config file
  const { webpack, ...config } = await getConfigFile(options);

  // Configure userWebpackHook
  const userWebpackHook = webpack || ((config: Configuration) => config);

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

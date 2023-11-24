import compileWebpack, { Configuration } from "webpack";
import chalk from "chalk";
import configureWebpack from "./webpack";
import { CompileOptions, UserWebpack } from "./interfaces";

const { bold, green, red, grey, italic } = chalk;

async function loadWebpackConfig(
  options: CompileOptions
): Promise<UserWebpack> {
  const { findUp } = await import("find-up");

  if (!options.config) {
    const path = await findUp("webextension-toolbox.config.js");
    if (path) {
      console.error(
        bold(
          red(`--config option not provided but ${italic(grey(path))} exists.`)
        )
      );
      console.error(
        bold(
          red(
            `The config option is now required. Provide ${grey(
              "--config"
            )} or delete/rename ${grey(path)}`
          )
        )
      );
      process.exit(-1);
    }
    return options;
  }

  const path = await findUp(options.config);

  if (!path) {
    console.log(
      `${red(bold("x"))} No webpack config found at ${green(
        bold(options.config)
      )}`
    );

    process.exit(-1);
  }

  console.log(
    `${green(bold("✔"))} Loading webpack config from ${green(bold(path))}`
  );
  const configModule = await import(path);
  return configModule.default || configModule;
}

export default async (options: CompileOptions) => {
  // Get user config file
  const { webpack, ...config } = await loadWebpackConfig(options);

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

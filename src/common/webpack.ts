import { resolve } from "path";
import Webpack, { Configuration } from "webpack";
import GlobEntriesPlugin from "webpack-watched-glob-entries-plugin";
import CaseSensitivePathsPlugin from "case-sensitive-paths-webpack-plugin";
import CopyPlugin from "copy-webpack-plugin";
import ZipPlugin from "zip-webpack-plugin";
import WebpackBar from "webpackbar";
import { glob } from "glob";
import { Chalk } from "chalk";
import { TsconfigPathsPlugin } from "tsconfig-paths-webpack-plugin";
import { WebextensionPlugin } from "@webextension-toolbox/webpack-webextension-plugin";
import browserslist from "browserslist";
import { BuildCompileOptions, DevCompileOptions } from "./interfaces.js";
import getExtensionInfo from "./utils/getExtensionInfo.js";

// CommonJS module, which may not support all module.exports as named exports
const { data: browserslistData } = browserslist;
const { EnvironmentPlugin } = Webpack;

const { green } = new Chalk();
const { getEntries } = GlobEntriesPlugin;

/**
 * Returns a Browserslist query string
 * for the target vendor and version
 * @param {string} vendor
 * @param {string} [version]
 * @return {string}
 */
function getBrowserslistQuery(vendor: string, version?: string): string {
  if (version && !Number.isNaN(Number(version))) {
    return `${vendor} ${version}`;
  }

  return `browserslist config and ${vendor} > 0 or defaults`;
}

function getExtensionFileType(vendor: string): string {
  switch (vendor) {
    case "firefox":
      return "xpi";
    case "opera":
      return "crx";
    default:
      return "zip";
  }
}

type WebpackConfigOptions = DevCompileOptions & BuildCompileOptions;

const defaultGlob = "**/*.?(m){j,t}s?(x)";

const defaultExtensions = [
  ".js",
  ".mjs",
  ".jsx",
  ".mjsx",
  ".ts",
  ".mts",
  ".tsx",
  ".mtsx",
];

export default async function webpackConfig({
  src = "app",
  target = "build/[vendor]",
  packageTarget = "packages",
  dev = false,
  copyIgnore = [],
  compileIgnore = [],
  devtool = false,
  minimize = false,
  vendor = "chrome",
  vendorVersion = "",
  manifestValidation = true,
  port = 35729,
  autoReload = false,
  swc = false,
  outputFilename,
}: WebpackConfigOptions) {
  if (!browserslistData[vendor]) {
    throw new Error(
      `${vendor} is not a valid vendor. Valid options are: ${Object.keys(
        browserslistData
      ).join(", ")}`
    );
  }

  const resolvedTarget = resolve(target.replace("[vendor]", vendor));
  const mode = dev ? "development" : "production";

  // Get some defaults
  const { version, name, description } = await getExtensionInfo(src);

  /** *************************** */
  /*      WEBPACK               */
  /** *************************** */
  const config: Configuration = {
    mode,
    context: resolve(src),
    // Turn off warnings that dont really apply to extensions
    performance: {
      hints: false,
      maxEntrypointSize: 512000,
      maxAssetSize: 512000,
    },
  };

  config.resolve = {
    extensions: defaultExtensions,
  };

  // Source-Maps
  config.devtool = devtool === "false" ? false : devtool;

  /** *************************** */
  /*       WEBPACK.ENTRY        */
  /** *************************** */
  const entries = [];

  // Add main entry glob
  entries.push(resolve(src, defaultGlob));

  const compileIgnoredArray = compileIgnore.map((path) => resolve(src, path));

  // We use the GlobEntriesPlugin in order to
  // restart the compiler in watch mode, when new
  // files got added.
  config.entry = getEntries(entries, {
    ignore: compileIgnoredArray,
  });

  /** *************************** */
  /*       WEBPACK.OUTPUT       */
  /** *************************** */
  config.output = {
    path: resolvedTarget,
    filename: "[name].js",
    chunkFilename: "[id].chunk.js",
    // https://github.com/webpack/webpack-dev-middleware/issues/861
    clean: true,
  };

  /** *************************** */
  /*    WEBPACK.OPTIMIZATION    */
  /** *************************** */
  config.optimization = { minimize };

  /** *************************** */
  /*       WEBPACK.LOADERS      */
  /** *************************** */
  config.module = {};

  config.module.rules = [];

  if (swc) {
    console.log(green("Using SWC loader to compile"));
    // SWC Mode
    config.module.rules.push({
      test: /\.m?(t|j)sx?$/,
      exclude: /(node_modules)/,
      use: {
        loader: "swc-loader",
        options: {
          env: {
            // Restrict to vendor by explicit vendor version OR configured browser(s) using browserslist
            targets: getBrowserslistQuery(vendor, vendorVersion),
          },
          minify: minimize,
        },
      },
    });
  } else {
    console.log(green("Using Babel loader to compile"));
    // Babel Mode
    // Find all Regular TS files
    config.module.rules.push({
      test: /\.m?jsx?$/,
      exclude: [/node_modules/],
      use: {
        loader: "babel-loader",
        options: {
          envName: mode,
          cacheDirectory: false,
          presets: [
            [
              "@babel/preset-env",
              {
                // Do not transform modules to CJS
                modules: false,
                // Restrict to vendor by explicit vendor version OR configured browser(s) using browserslist
                targets: getBrowserslistQuery(vendor, vendorVersion),
              },
            ],
          ],
        },
      },
    });

    // Find all typescript files
    config.module.rules.push({
      test: /\.m?tsx?$/,
      exclude: /node_modules/,
      loader: "ts-loader",
    });
  }

  /** *************************** */
  /*     WEBPACK.PLUGINS        */
  /** *************************** */
  config.plugins = [];

  // Check for existence of any typescript files
  const typescript = await glob(resolve(src, "**/*.?(m)ts?(x)"), {
    ignore: compileIgnoredArray,
  });

  // If there are any typescript files being compiled
  // add the typescript plugin to load tsconfig.json
  if (typescript.length > 0) {
    config.resolve.plugins = [];
    config.resolve.plugins.push(new TsconfigPathsPlugin());
  }

  // Watcher doesn't work well if you mistype casing in a path so we use
  // a plugin that prints an error when you attempt to do this.
  config.plugins.push(new CaseSensitivePathsPlugin());

  // Add Wilcard Entry Plugin
  const gep = <any>new GlobEntriesPlugin();
  config.plugins.push(gep);

  // Set environment vars
  config.plugins.push(
    new EnvironmentPlugin({
      NODE_ENV: mode,
      VENDOR: vendor,
      WEBEXTENSION_TOOLBOX_VERSION: version,
    })
  );

  let compiledFiles = await glob(resolve(src, defaultGlob), {
    ignore: compileIgnoredArray,
  });

  // Add manifest to compiled files list
  compiledFiles.push(resolve(src, "manifest.json"));

  // Copy non compiled files
  config.plugins.push(
    new CopyPlugin({
      patterns: [
        ...compileIgnoredArray,
        {
          // Copy all files except those that are compiled and manifest
          context: resolve(src),
          from: resolve(src, "**/*").replace(/\\/g, "/"),
          globOptions: {
            ignore: [...copyIgnore, ...compiledFiles],
          },
          to: resolvedTarget,
        },
      ],
    })
  );

  // Compile and validate manifest and autoreload
  // extension in watch mode
  config.plugins.push(
    new WebextensionPlugin({
      autoreload: autoReload,
      vendor,
      manifestDefaults: {
        name,
        description,
        version,
      },
      skipManifestValidation: !manifestValidation,
      port,
    })
  );

  // Pack extension
  if (mode === "production") {
    config.plugins.push(
      new ZipPlugin({
        path: resolve(packageTarget.replace("[vendor]", vendor)),
        filename: outputFilename || `${name}.v${version}.${vendor}`,
        extension: getExtensionFileType(vendor),
      })
    );
  }

  config.plugins.push(new WebpackBar());

  return config;
}

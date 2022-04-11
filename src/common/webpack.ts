import { resolve } from "path";
import { Configuration, EnvironmentPlugin } from "webpack";
import GlobEntriesPlugin from "webpack-watched-glob-entries-plugin";
import CaseSensitivePathsPlugin from "case-sensitive-paths-webpack-plugin";
import CopyPlugin from "copy-webpack-plugin";
import ZipPlugin from "zip-webpack-plugin";
import WebextensionPlugin from "@webextension-toolbox/webpack-webextension-plugin";
import WebpackBar from "webpackbar";
import { data as browserslistData } from "browserslist";
import TsconfigPathsPlugin from "tsconfig-paths-webpack-plugin";
import { promisify } from "util";
import g from "glob";
import getExtensionInfo from "./utils/getExtensionInfo";

const glob = promisify(g);
const { getEntries } = GlobEntriesPlugin;

/**
 * Returns last n
 * vendor version
 * @param {integer} n
 * @param {string} vendor
 * @return {string} version
 */
function getLastNVendorVersion(n: number, vendor: string): string | undefined {
  const { released } = browserslistData[vendor] ?? { released: [] };
  return released[released.length - n] ?? undefined;
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
export interface WebpackConfig {
  src?: string;
  target?: string;
  packageTarget?: string;
  dev?: boolean;
  copyIgnore?: string[];
  devtool?: string | false | undefined;
  minimize?: boolean;
  vendor?: string;
  manifestValidation?: boolean;
  port?: number;
  vendorVersion?: string;
  autoReload?: boolean;
}

export default async function webpackConfig({
  src = "app",
  target = "build/[vendor]",
  packageTarget = "packages",
  dev = false,
  copyIgnore = ["**/*.js", "**/*.json", "**/*.ts", "**/*.tsx"],
  devtool = false,
  minimize = false,
  vendor = "chrome",
  manifestValidation = true,
  port = 35729,
  autoReload = false,
  vendorVersion,
}: WebpackConfig = {}) {
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
  const { version, name, description, typescript } = await getExtensionInfo(
    src
  );

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

  const extensions = [".js", ".json", ".mjs", ".jsx"];
  // Automatically resolve the following extensions:
  if (typescript) {
    extensions.push(".ts", ".tsx");
  }

  config.resolve = {
    extensions,
  };

  // Source-Maps
  config.devtool = devtool === "false" ? false : devtool;

  /** *************************** */
  /*       WEBPACK.ENTRY        */
  /** *************************** */
  const entries = [];

  // Add main entry glob
  if (typescript) {
    entries.push(resolve(src, "*.{js,mjs,jsx,ts,tsx}"));
    entries.push(resolve(src, "?(scripts)/*.{js,mjs,jsx,ts,tsx}"));
  } else {
    entries.push(resolve(src, "*.{js,mjs,jsx}"));
    entries.push(resolve(src, "?(scripts)/*.{js,mjs,jsx}"));
  }

  // We use the GlobEntriesPlugin in order to
  // restart the compiler in watch mode, when new
  // files got added.
  config.entry = getEntries(entries, {
    ignore: [],
  });

  /** *************************** */
  /*       WEBPACK.OUTPUT       */
  /** *************************** */
  config.output = {
    path: resolvedTarget,
    filename: "[name].js",
    chunkFilename: "[id].chunk.js",
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

  // Add babel support
  config.module.rules.push({
    test: /\.m?jsx?$/,
    exclude: /node_modules/,
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
              // Restrict to vendor
              targets: {
                [vendor]: vendorVersion || getLastNVendorVersion(3, vendor),
              },
            },
          ],
        ],
      },
    },
  });

  // Add TypeScript support if there is a tsconfig.json file
  if (typescript) {
    config.module.rules.push({
      test: /\.tsx?$/,
      exclude: /node_modules/,
      loader: "ts-loader",
    });
  }

  /** *************************** */
  /*     WEBPACK.PLUGINS        */
  /** *************************** */
  config.plugins = [];

  // Use this to load modules whose location is specified in the paths section of tsconfig.json
  if (typescript) {
    config.resolve.plugins = [];
    config.resolve.plugins.push(new TsconfigPathsPlugin());
  }

  // Watcher doesn't work well if you mistype casing in a path so we use
  // a plugin that prints an error when you attempt to do this.
  config.plugins.push(new CaseSensitivePathsPlugin());

  // Add Wilcard Entry Plugin
  const bb = <any>new GlobEntriesPlugin();
  config.plugins.push(bb);

  // Set environment vars
  config.plugins.push(
    new EnvironmentPlugin({
      NODE_ENV: mode,
      VENDOR: vendor,
      WEBEXTENSION_TOOLBOX_VERSION: version,
    })
  );

  const copyPatterns: CopyPlugin.Pattern[] = [
    {
      // Copy all files except (.js, .json, _locales)
      context: resolve(src),
      from: resolve(src, "**/*").replace(/\\/g, "/"),
      globOptions: {
        ignore: copyIgnore,
      },
      to: resolvedTarget,
    },
  ];

  // Copy language files (_locales) if they exist
  const resolvedFrom = resolve(src, "_locales/**/*.json").replace(/\\/g, "/");
  const resolvedFromGlob = await glob(resolvedFrom);
  if (resolvedFromGlob.length) {
    copyPatterns.push({
      // Copy all language json files
      context: resolve(src),
      from: resolvedFrom,
      to: resolvedTarget,
    });
  }

  // Copy non js files & compile manifest
  config.plugins.push(
    new CopyPlugin({
      patterns: copyPatterns,
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
        filename: `${name}.v${version}.${vendor}.${getExtensionFileType(
          vendor
        )}`,
      })
    );
  }

  config.plugins.push(new WebpackBar());

  return config;
}

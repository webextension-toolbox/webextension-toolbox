import { Command, program } from "commander";
import chalk from "chalk";
import { promises as fs } from "fs";
import path, { dirname } from "path";
import { parse, stringify } from "yaml";
import { findUp } from "find-up";
import { fileURLToPath } from "url";
import { build, dev } from "./commands/index.js";
import { CompileOptions } from "./common/index.js";

// eslint-disable-next-line no-underscore-dangle
const __dirname = dirname(fileURLToPath(import.meta.url));
const { blue, bold, green, dim } = chalk;

const configFile = ".webextensiontoolboxrc";

async function saveConfig(options: CompileOptions) {
  if (!options.save) {
    return;
  }
  const cwd = process.cwd();

  const webextensiontoolboxrcPath = path.resolve(cwd, configFile);

  const filteredOptions = Object.fromEntries(
    Object.entries(options).filter(([key]) => key !== "save")
  );

  await fs.writeFile(webextensiontoolboxrcPath, stringify(filteredOptions));

  console.log(
    `${green(bold("✔"))} Saved ${dim(".webextensiontoolboxrc")} to ${green(
      bold(webextensiontoolboxrcPath)
    )}`
  );
  process.exit(0);
}

function addSharedOptions(cmd: Command): Command {
  return cmd
    .option("--swc", "Use SWC instead of Babel")
    .option("-c, --config [config]", "specify config file path")
    .option("-s, --src [src]", "specify source directory", "app")
    .option(
      "-t, --target [target]",
      "specify target directory",
      "dist/[vendor]"
    )
    .option(
      "-d, --devtool [string | false]",
      "controls if and how source maps are generated",
      "cheap-source-map"
    )
    .option(
      "--vendor-version [vendorVersion]",
      "last supported vendor (default: current)"
    )
    .option(
      "--copy-ignore [copyIgnore...]",
      "Do not copy the files in this list, glob pattern"
    )
    .option(
      "--compile-ignore [compileIgnore...]",
      "Do not compile the files in this list, glob pattern"
    )
    .option("--no-manifest-validation", "Skip Manifest Validation")
    .option("--save", `Save config to ${dim(".webextensiontoolboxrc")}`)
    .option(
      "--verbose",
      "print messages at the beginning and end of incremental build"
    );
}

export default async function command() {
  const webextensiontoolboxrcPath = await findUp(configFile);

  let config = {};
  if (webextensiontoolboxrcPath) {
    const webextensiontoolboxrc = await fs.readFile(webextensiontoolboxrcPath);
    config = parse(webextensiontoolboxrc.toString());
  }

  const { version } = JSON.parse(
    (await fs.readFile(`${__dirname}/../package.json`)).toString()
  );

  program
    .name("webextension-toolbox")
    .description(
      blue(
        `
                  ╔══════════╗
    ╔═════════════════════════════════════╗
    ║     ${bold.yellow(`WEBEXTENSION-TOOLBOX v${version}`)}     ║
    ╚═════════════════════════════════════╝
`
          .replace(/^\n*/g, "")
          .replace(/\n*$/g, "")
      )
    )
    .version(version)
    .hook(
      "preSubcommand",
      async (hookedCommand: Command, subCommand: Command) => {
        const supportedOptions = subCommand.opts();

        if (webextensiontoolboxrcPath) {
          console.log(
            `${green(bold("✔"))} Loaded ${dim(
              ".webextensiontoolboxrc"
            )} from ${green(bold(webextensiontoolboxrcPath))}`
          );
        }

        Object.entries(config)
          .filter(([key]) => supportedOptions[key] !== undefined)
          .forEach(([key, value]) => {
            subCommand.setOptionValue(key, value);
          });
      }
    );

  addSharedOptions(
    program
      .command("dev")
      .description("Compiles extension in devmode")
      .argument("<vendor>", "The Vendor to compile")
  )
    .option(
      "--no-auto-reload",
      "Do not inject auto reload scripts into background pages or service workers",
      true
    )
    .option(
      "-p, --port [port]",
      "Define the port for the websocket development server",
      "35729"
    )
    .option(
      "--dev-server [devServer]",
      "use webpack dev server to serve bundled files",
      false
    )
    .action(async (vendor: string, options: CompileOptions) => {
      await saveConfig(options);
      return dev(vendor, options);
    });

  addSharedOptions(
    program
      .command("build")
      .description("Compiles extension for production")
      .argument("<vendor>", "The Vendor to compile")
  )
    .option("--no-minimize", "disables code minification", true)
    .option(
      "-o,--output-filename [outputFilename]",
      "Override the output filename"
    )
    .action(async (vendor: string, options: CompileOptions) => {
      await saveConfig(options);
      return build(vendor, options);
    });

  program.parse();
}

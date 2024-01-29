// https://dev.to/ayc0/typescript-50-new-mode-bundler-esm-1jic
// https://adamcoster.com/blog/commonjs-and-esm-importexport-compatibility-examples
import compile from "./compile.js";
import logCompileOutput from "./utils/logCompileOutput.js";
import getExtensionInfo from "./utils/getExtensionInfo.js";
import type {
  BuildCompileOptions,
  DevCompileOptions,
  CompileOptions,
} from "./interfaces.js";

export { compile, logCompileOutput, getExtensionInfo };
export type { BuildCompileOptions, DevCompileOptions, CompileOptions };

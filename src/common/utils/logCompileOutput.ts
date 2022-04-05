import { CompileOptions } from "../compile";
import { Stats } from "webpack";

export default function logCompileOutput(
  options: CompileOptions,
  error: any,
  stats: Stats | undefined
) {
  if (error) {
    console.error(error);
  }

  if (stats) {
    console.log(
      stats.toString({
        colors: true,
        version: false,
        hash: false,
      })
    );
  }

  if (options.verbose) {
    console.error("\nCompilation finished\n");
  }
}

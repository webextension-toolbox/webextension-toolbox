import { Configuration } from "webpack";

export interface BaseCompileOptions {
  vendor: string;
  src: string;
  target: string;
  dev?: boolean;
  devtool?: string | false;
  vendorVersion?: string;
  manifestValidation?: boolean;
  config?: string;
  port?: number;
  verbose?: boolean;
  save?: boolean;
  copyIgnore?: string[];
  compileIgnore?: string[];
  swc?: boolean;
}

export interface DevCompileOptions extends BaseCompileOptions {
  autoReload?: boolean;
  devServer?: boolean;
}

export interface BuildCompileOptions extends BaseCompileOptions {
  minimize?: boolean;
  packageTarget?: string;
}

export type CompileOptions = DevCompileOptions | BuildCompileOptions;

export type UserWebpack = CompileOptions & {
  // eslint-disable-next-line no-unused-vars
  webpack?: (config: Configuration, options: CompileOptions) => Configuration;
};

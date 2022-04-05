export interface Config {
  src?: string;
  target?: string;
  packageTarget?: string;
  dev?: boolean;
  copyIgnore?: string[];
  devtool?: string | false | undefined;
  minimize?: boolean;
  vendor?: string;
  validateManifest?: boolean;
  port?: number;
  vendorVersion?: string;
  config?: string;
}

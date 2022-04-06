[<img align="right" src="./assets/icon.svg?sanitize=true">](https://www.npmjs.com/package/@webextension-toolbox/webextension-toolbox)

# WebExtension Toolbox

[![npm version](https://badge.fury.io/js/@webextension-toolbox%2Fwebextension-toolbox.svg)](https://badge.fury.io/js/webextension-toolbox%2Fwebextension-toolbox)
[![Node.js CI](https://github.com/webextension-toolbox/webextension-toolbox/actions/workflows/build.yml/badge.svg)](https://github.com/webextension-toolbox/webextension-toolbox/actions/workflows/build.yml)
[![license](https://img.shields.io/npm/l/@webextension-toolbox%2Fwebextension-toolbox.svg)](https://github.com/webextension-toolbox/webextension-toolbox/blob/main/LICENSE)

Small cli toolbox for creating cross-browser WebExtensions.

If you want to get started quickly check out the [yeoman generator](https://github.com/webextension-toolbox/generator-web-extension) for this project.

# Browser Support

- Chrome (`chrome`)
- Opera (`opera`)
- Edge (`edge`)
- Firefox (`firefox`)
- Safari (`safari`)

# Features

## Packing

The `build` task creates bundles for:

- Firefox (`.xpi`)
- Chrome (`.zip`)
- Opera (`.crx`)
- Edge (`.zip`)
- Safari (`.zip`)

## Manifest validation

Validates your `manifest.json` while compiling.

You can skip this by adding `--validateManifest` to your `build` or `dev` command.

## Manifest defaults

Uses default fields (`name`, `version`, `description`) from your `package.json`

## Typescript Support

Native typescript support (but not enforced!)
 (see section [How do I use Typescript?](#how-do-i-use-typescript))

## Manifest vendor keys

Allows you to define vendor specific manifest keys.

### Example

`manifest.json`

```
"name": "my-extension",
"__chrome__key": "yourchromekey",
"__chrome|opera__key2": "yourblinkkey"
```

If the vendor is `chrome` it compiles to:

```
"name": "my-extension",
"key": "yourchromekey",
"key2": "yourblinkkey"
```

If the vendor is `opera` it compiles to:

```
"name": "my-extension",
"key2": "yourblinkkey"
```

else it compiles to:

```
"name": "my-extension"
```

## Polyfill

The [WebExtension specification](https://developer.mozilla.org/docs/Mozilla/Add-ons/WebExtensions) is currently supported on Chrome, Firefox, Edge (Chromium) and Safari ([Safari Web Extension’s Browser Compatibility](https://developer.apple.com/documentation/safariservices/safari_web_extensions/assessing_your_safari_web_extension_s_browser_compatibility)).

This toolbox no longer provides any polyfills for cross-browser support. If you need polyfills e.g. between 'browser' and 'chrome', we recommend detecting the browser during the build time using process.env.VENDOR.

This toolbox comes with <a href="https://github.com/babel/babel/tree/master/packages/babel-preset-env">babel-preset-env</a>. Feel free add custom configuration if you need any custom polyfills.

# Usage

## Install

#### Globally

```shell
$ npm install -g @webextension-toolbox/webextension-toolbox
```

#### Locally

```shell
$ npm install -D @webextension-toolbox/webextension-toolbox
```

## Development

- Compiles the extension via webpack to `dist/<vendor>`.
- Watches all extension files and recompiles on demand.
- Reloads extension or extension page as soon something changed.
- Sets `process.env.NODE_ENV` to `development`.
- Sets `process.env.VENDOR` to the current vendor.

### Syntax

```shell
$ webextension-toolbox dev <vendor> [..options]
```

### Examples

```shell
$ webextension-toolbox dev --help
$ webextension-toolbox dev chrome
$ webextension-toolbox dev firefox
$ webextension-toolbox dev opera
$ webextension-toolbox dev edge
$ webextension-toolbox dev safari
```

## Build

- Compile extension via webpack to `dist/<vendor>`.
- Minifies extension Code.
- Sets `process.env.NODE_ENV` to `production`.
- Sets `process.env.VENDOR` to the current vendor.
- Packs extension to `packages`.

### Syntax

#### Building
```shell
Usage: build [options] <vendor>

Compiles extension for production

Options:
  -c, --config [config]                 specify config file path (default: "./webextension-toolbox.config.js")
  -s, --src [src]                       specify source directory (default: "app")
  -t, --target [target]                 specify target directory (default: "dist/[vendor]")
  -d, --devtool [string | false]        controls if and how source maps are generated (default: false)
  --no-minimize                         disables code minification
  -v, --vendor-version [vendorVersion]  last supported vendor (default: current)
  --no-manifest-validation              validate manifest syntax
  -h, --help                            display help for command
```

#### Developing
```shell
Usage: dev [options] <vendor>

Compiles extension in devmode

Arguments:
  vendor                                The Vendor to compile

Options:
  -c, --config [config]                 specify config file path (default: "./webextension-toolbox.config.js")
  -s, --src [src]                       specify source directory (default: "app")
  -t, --target [target]                 specify target directory (default: "dist/[vendor]")
  -d, --devtool [string | false]        controls if and how source maps are generated (default: "cheap-source-map")
  -r, --no-auto-reload                  Do not inject auto reload scripts into background objects
  -p, --port [port]                     Define the port for the websocket development server (default: "35729")
  -v, --vendor-version [vendorVersion]  last supported vendor (default: current)
  --dev-server [devServer]              use webpack dev server to serve bundled files (default: false)
  --no-manifest-validation              Skip Manifest Validation
  --verbose                             print messages at the beginning and end of incremental build
  -h, --help                            display help for command
```

## Entry points

All javascript files located at the root of your `./app` or `./app/scripts` directory will create a separate bundle.

| app                                 | dist                                  |
| ----------------------------------- | ------------------------------------- |
| `app/background.js`                 | `dist/<vendor>/background.js`         |
| `app/scripts/background.js`         | `dist/<vendor>/scripts/background.js` |
| `app/some-dir/some-file.js`         | Will be ignored as entry file.        |
| `app/scripts/some-dir/some-file.js` | Will be ignored as entry file.        |

## Customizing webpack config

In order to extend the usage of `webpack`, you can define a function that extends its config via `webextension-toolbox.config.js` (or a file you define through the usage of the `-c` option) in your project root.

```js
module.exports = {
  webpack: (config, { dev, vendor }) => {
    // Perform customizations to webpack config

    // Important: return the modified config
    return config;
  },
};
```

As WebExtension Toolbox uses webpack’s [devtool](https://webpack.js.org/configuration/devtool/) feature under the hood, you can also customize the desired devtool with the `--devtool` argument.

For example, if you have problems with source maps on Firefox, you can try the following command:

```
webextension-toolbox build firefox --devtool=inline-cheap-source-map
```

Please see [Issue #58](https://github.com/webextension-toolbox/webextension-toolbox/issues/58) for more information on this

# FAQ

## What is the difference to [web-ext](https://github.com/mozilla/web-ext)?

If want to develop browser extensions for Firefox only [web-ext](https://github.com/mozilla/web-ext) might be a better fit for you, since it supports, extension signing, better manifest validation and auto mounting.

Nevertheless if you want to develop cross browser extensions using

- the same development experience in every browser
- a single codebase
- custom webpack configuration

webextension-toolbox might be your tool of choice.

## How do I use React?

1. `npm install @babel/preset-react --save-dev`
2. Create a .babelrc file next to your package.json file and insert the following contents:

```
{
  "presets": [
    "@babel/preset-react"
  ]
}
```

## How do I use Typescript?

1. `npm install typescript --save-dev`
2. Run `tsc --init` or manually add a tsconfig.json file to your project root

# License

Copyright 2018-2022 Henrik Wenz

This project is free software released under the MIT license.

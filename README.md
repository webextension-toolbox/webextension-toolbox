[<img align="right" src="./assets/icon.svg?sanitize=true">](https://www.npmjs.com/package/webextension-toolbox)
# WebExtension Toolbox

[![npm version](https://badge.fury.io/js/webextension-toolbox.svg)](https://badge.fury.io/js/webextension-toolbox)
[![Node.js CI](https://github.com/webextension-toolbox/webextension-toolbox/actions/workflows/nodejs.yml/badge.svg)](https://github.com/webextension-toolbox/webextension-toolbox/actions/workflows/nodejs.yml)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)
[![license](https://img.shields.io/npm/l/webextension-toolbox.svg)](https://github.com/webextension-toolbox/webextension-toolbox/blob/master/LICENSE)

Small cli toolbox for creating cross-browser WebExtensions.

If you want to get started quickly check out the [yeoman generator](https://github.com/webextension-toolbox/generator-web-extension) for this project.

# Browser Support

* Chrome (`chrome`) (auto [polyfilled](https://github.com/mozilla/webextension-polyfill))
* Opera (`opera`) (auto [polyfilled](https://github.com/mozilla/webextension-polyfill))
* Edge (`edge`) (auto [polyfilled](https://github.com/mozilla/webextension-polyfill))
* Firefox (`firefox`)

# Features

## React.js
Works with [React](https://reactjs.org/) out of the box!  
Run `$ npm i react react-dom` and you are ready to go.

## Packing

The `build` task creates bundles for:
* Firefox (`.xpi`)
* Chrome (`.zip`)
* Opera (`.crx`)
* Edge (`.zip`)

## Manifest validation

Validates your `manifest.json` while compiling.

## Manifest defaults

Uses default fields (`name`, `version`, `description`) from your `package.json`

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
  
The [WebExtension specification](https://developer.mozilla.org/docs/Mozilla/Add-ons/WebExtensions) is currently only supported by Firefox and Edge (Trident version). This toolbox adds the necessary polyfills for Chrome, Edge (Chromium) and Opera. 

This way many webextension apis will work in Chrome, Edge (Chromium) and Opera out of the box. 
  
In addition to that, this toolbox comes with <a href="https://github.com/babel/babel/tree/master/packages/babel-preset-env">babel-preset-env</a>.
  

# Usage

## Install

```shell
$ npm install -g webextension-toolbox
```

## Development

* Compiles the extension via webpack to `dist/<vendor>`.
* Watches all extension files and recompiles on demand.
* Reloads extension or extension page as soon something changed.
* Sets `process.env.NODE_ENV` to `development`.
* Sets `process.env.VENDOR` to the current vendor.

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
```

## Build

* Compile extension via webpack to `dist/<vendor>`.
* Minifies extension Code.
* Sets `process.env.NODE_ENV` to `production`.
* Sets `process.env.VENDOR` to the current vendor.
* Packs extension to `packages`.

### Syntax

```shell
Usage: build [options] <vendor>

Compiles extension for production

Options:
  -s, --src [src]                       specify source directory (default: "app")
  -t, --target [target]                 specify target directory (default: "dist/[vendor]")
  -d, --devtool [devtool]               controls if and how source maps are generated (default: false)
  -m, --no-minimize                     disables code minification
  -v, --vendorVersion [vendorVersion]   last supported vendor (default: current)
  -h, --help                            output usage information
```

## Browser API

Always use the [WebExtension browser API](https://developer.mozilla.org/docs/Mozilla/Add-ons/WebExtensions). Webextension-Toolbox will polyfill it for you in chrome and opera.

## Entry points

All javascript files located at the root of your `./app` or `./app/scripts` directory will create a seperate bundle.

| app                                 | dist                                  |
|-------------------------------------|---------------------------------------|
| `app/background.js`                 | `dist/<vendor>/background.js`         |
| `app/scripts/background.js`         | `dist/<vendor>/scripts/background.js` |
| `app/some-dir/some-file.js`         | Will be ignored as entry file.        |
| `app/scripts/some-dir/some-file.js` | Will be ignored as entry file.        |

## Customizing webpack config

In order to extend our usage of `webpack`, you can define a function that extends its config via `webextension-toolbox-config.js`.

```js
// This file is not going through babel transformation.
// So, we write it in vanilla JS
// (But you could use ES2015 features supported by your Node.js version)
const webpack = require('webpack')

module.exports = {
  webpack: (config, { dev, vendor }) => {
    // Perform customizations to webpack config

    // Important: return the modified config
    return config
  }
}
```

As WebExtension Toolbox uses webpack’s [devtool]( https://webpack.js.org/configuration/devtool/) feature under the hood, you can also customize the desired devtool with the `--devtool` argument.

For example, if you have problems with source maps on Firefox, you can try the following command:

```
webextension-toolbox build firefox --devtool=inline-cheap-source-map
```

Please see [Issue #58](https://github.com/webextension-toolbox/webextension-toolbox/issues/58) for more information on this

# FAQ

## What is the difference to [web-ext](https://github.com/mozilla/web-ext)?

If want to develop browser extensions for Firefox only [web-ext](https://github.com/mozilla/web-ext) might be a better fit for you, since it supports, extension signing, better manifest validation and auto mounting.

Nevertheless if you want to develop cross browser extensions using

* the same development experience in every browser
* a single codebase
* react
* and custom webpack configuration

webextension-toolbox might be your tool of choice. 

# License

Copyright 2021 Henrik Wenz

This project is free software released under the MIT license.

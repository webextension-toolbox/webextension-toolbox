[<img align="right" src="./assets/icon.svg?sanitize=true"></a>](https://www.npmjs.com/package/webextension-toolbox)
# WebExtension Toolbox

[![npm package](https://badge.fury.io/js/webextension-toolbox.svg)](https://www.npmjs.com/package/webextension-toolbox)
[![build status](https://travis-ci.org/webextension-toolbox/webextension-toolbox.svg?branch=master)](https://travis-ci.org/webextension-toolbox/webextension-toolbox) 
[![dependencies](https://david-dm.org/webextension-toolbox/webextension-toolbox/status.svg)](https://david-dm.org/webextension-toolbox/webextension-toolbox)
[![devDependencies](https://david-dm.org/webextension-toolbox/webextension-toolbox/dev-status.svg)](https://david-dm.org/webextension-toolbox/webextension-toolbox?type=dev)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)
[![license](https://img.shields.io/npm/l/webextension-toolbox.svg)](https://github.com/webextension-toolbox/webextension-toolbox/blob/master/LICENSE)

Small cli toolbox for creating cross-browser WebExtensions.

If you want to get started quickly check out the [yeoman generator](https://github.com/webextension-toolbox/generator-web-extension) for this project.

# Browser Support
* `chrome` (auto [polyfilled](https://github.com/mozilla/webextension-polyfill))
* `opera` (auto [polyfilled](https://github.com/mozilla/webextension-polyfill))
* `firefox`
* `edge`
# Features
## react.js
Works with react.js out of the box!  
Run `$ npm i react react-dom` and you are ready to go.
## packing
The `build` task creates bundles for:
* Firefox (`.xpi`)
* Chrome (`.zip`)
* Opera (`.crx`)
* Edge (`.zip`)
## manifest validation
Validates your `manifest.json` while compiling.
## manifest defaults
Uses default fields (`name`, `version`, `description`) from your `package.json`
## manifest vendor keys
Allows you to define vendor specific manifest keys.
### Example

`manifest.json` 
```
"name": "my-extension"
"__chrome__key": "yourchromekey"
"__chrome|opera__key2: "yourblinkkey"
```
If the vendor is `chrome` it compiles to:
```
"name": "my-extension"
"key": "yourchromekey"
"key2": "yourblinkkey"
```
If the vendor is `opera` it compiles to:
```
"name": "my-extension"
"key2": "yourblinkkey"
```
else it compiles to:

```
"name": "my-extension"
```

## polyfill
  
The [webextension standard](https://developer.mozilla.org/de/Add-ons/WebExtensions) is currently only supported by firefox and edge. This toolbox adds the necessary polyfills for chrome and opera. 

This way many webextension apis will work in chrome and opera out of the box. 
  
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

Note: For Microsoft Edge, it is not allowed to connect to localhost with WebSocket. For this reason, you need to disable automatic detection for intranet network. You can do this under Internet options:
![fix_edge_websocket](https://user-images.githubusercontent.com/1768446/39151474-a0ab6ea6-4745-11e8-8f59-b2aafd101da2.gif)

or using Registry Editor (regedit):
```
Windows Registry Editor Version 5.00

[HKEY_CURRENT_USER\Software\Microsoft\Windows\CurrentVersion\Internet Settings\ZoneMap]
"IntranetName"=dword:00000000
```

## Build

* Compile extension via webpack to `dist/<vendor>`.
* Minifies extension Code.
* Sets `process.env.NODE_ENV` to `production`.
* Sets `process.env.VENDOR` to the current vendor.
* Packs extension to `packages`.

### Syntax

```shell
$ webextension-toolbox build <vendor> [..options]
```


### Examples

```shell
$ webextension-toolbox build --help
$ webextension-toolbox build chrome
$ webextension-toolbox build firefox
$ webextension-toolbox build opera
$ webextension-toolbox build edge
```

## Browser API

Always use the [webextension browser api](https://developer.mozilla.org/de/Add-ons/WebExtensions). Webextension-Toolbox will polyfill it for you in chrome and opera.

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
Please see Issue #58 for more information on this


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

Copyright 2018 Henrik Wenz

This project is free software released under the MIT license.

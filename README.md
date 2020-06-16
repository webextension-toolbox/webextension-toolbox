[<img align="right" src="./assets/icon.svg?sanitize=true">](https://www.npmjs.com/package/webextension-toolbox)

# WebExtension Toolbox

[![npm package](https://badge.fury.io/js/webextension-toolbox.svg)](https://www.npmjs.com/package/webextension-toolbox)
[![build status](https://travis-ci.org/webextension-toolbox/webextension-toolbox.svg?branch=master)](https://travis-ci.org/webextension-toolbox/webextension-toolbox)
[![Build Status](https://dev.azure.com/webextension-toolbox/webextension-toolbox/_apis/build/status/webextension-toolbox.webextension-toolbox)](https://dev.azure.com/webextension-toolbox/webextension-toolbox/_build/latest?definitionId=1)
[![dependencies](https://david-dm.org/webextension-toolbox/webextension-toolbox/status.svg)](https://david-dm.org/webextension-toolbox/webextension-toolbox)
[![devDependencies](https://david-dm.org/webextension-toolbox/webextension-toolbox/dev-status.svg)](https://david-dm.org/webextension-toolbox/webextension-toolbox?type=dev)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)
[![license](https://img.shields.io/npm/l/webextension-toolbox.svg)](https://github.com/webextension-toolbox/webextension-toolbox/blob/master/LICENSE)

Small cli toolbox for creating cross-browser WebExtensions.

If you want to get started quickly check out the [yeoman generator](https://github.com/webextension-toolbox/generator-web-extension) for this project.

# Browser Support

- `chrome` (auto [polyfilled](https://github.com/mozilla/webextension-polyfill))
- `opera` (auto [polyfilled](https://github.com/mozilla/webextension-polyfill))
- `firefox`
- `edge`

# Features

## react.js

Works with react.js out of the box!  
Run `$ npm i react react-dom` and you are ready to go.

## packing

The `build` task creates bundles for:

- Firefox (`.xpi`)
- Chrome (`.zip`)
- Opera (`.crx`)
- Edge (`.zip`)

## manifest validation

Validates your `manifest.json` while compiling.

## manifest defaults

Uses default fields (`name`, `version`, `description`) from your `package.json`

## manifest vendor keys

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

## polyfill

The [webextension standard](https://developer.mozilla.org/docs/Mozilla/Add-ons/WebExtensions) is currently only supported by firefox and edge. This toolbox adds the necessary polyfills for chrome and opera.

This way many webextension apis will work in chrome and opera out of the box.

In addition to that, this toolbox comes with <a href="https://github.com/babel/babel/tree/master/packages/babel-preset-env">babel-preset-env</a>.

# Usage

## Install

```shell
$ npm install -g webextension-toolbox
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
```

Note: For Microsoft Edge, it is not allowed to connect to localhost with WebSocket.
You need to disable "Include all local (intranet) sites not listed in other zones" under "Internet options":
![GIF Animation showing a cursor turning off Include all local (intranet) sites not listed in other zones option under Internet properties, Security, Local intranet](https://i.imgur.com/puhk4gZ.gif)

or using Registry Editor (regedit):

```
Windows Registry Editor Version 5.00

[HKEY_CURRENT_USER\Software\Microsoft\Windows\CurrentVersion\Internet Settings\ZoneMap]
"IntranetName"=dword:00000000
```

## Build

- Compile extension via webpack to `dist/<vendor>`.
- Minifies extension Code.
- Sets `process.env.NODE_ENV` to `production`.
- Sets `process.env.VENDOR` to the current vendor.
- Packs extension to `packages`.

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

Always use the [webextension browser api](https://developer.mozilla.org/docs/Mozilla/Add-ons/WebExtensions). Webextension-Toolbox will polyfill it for you in chrome and opera.

## Entry points

All javascript files located at the root of your `./app` or `./app/scripts` directory will create a seperate bundle.

| app                                 | dist                                  |
| ----------------------------------- | ------------------------------------- |
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
const webpack = require("webpack");

module.exports = {
	webpack: (config, { dev, vendor }) => {
		// Perform customizations to webpack config

		// Important: return the modified config
		return config;
	}
};
```

As WebExtension Toolbox uses webpack’s [devtool](https://webpack.js.org/configuration/devtool/) feature under the hood, you can also customize the desired devtool with the `--devtool` argument.
For example, if you have problems with source maps on Firefox, you can try the following command:

```
webextension-toolbox build firefox --devtool=inline-cheap-source-map
```

Please see Issue #58 for more information on this

# CI/CD

For testing WebExtension Toolbox, we rely mainly on [Azure Pipelines](https://docs.microsoft.com/azure/devops/pipelines/) and [Travis](https://travis-ci.org/).

We try to target every platform our users use: Linux, macOS or Windows
Regarding Node.js versions, we try to target what would our users would use:

- Last version in Maintenance LTS (currentl: v8)
- Active LTS (currently v10)
- Current (currently: v11)

Currently, passing all tests is required to merge a Pull Request

## Test matrix

<table>
  <tr>
    <th>CI/CD vendor</th>
    <th>Operating System</th>
    <th>NodeJS versions</th>
  </tr>
  <tr>
    <td rowspan="3">Azure Pipelines</td>
    <td>Ubuntu (ubuntu-16.04)</td>
    <td rowspan="3">
      <ul>
        <li>8.x</li>
        <li>10.x</li> 
        <li>11.x</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>macOS (macOS-10.13)</td>
  </tr>
  <tr>
    <td>Windows (win1803)</td>
  </tr>
  <tr>
    <td>Travis CI</td>
    <td>Ubuntu Xenial 16.04</td>
    <td>
      <ul>
        <li>lts (10.x)</li>
        <li>current (11.x)</li>
      </ul>
    </td>
  </tr>
</table>
In other words, every pull request goes through on 11 test environment

# FAQ

## What is the difference to [web-ext](https://github.com/mozilla/web-ext)?

If want to develop browser extensions for Firefox only [web-ext](https://github.com/mozilla/web-ext) might be a better fit for you, since it supports, extension signing, better manifest validation and auto mounting.

Nevertheless if you want to develop cross browser extensions using

- the same development experience in every browser
- a single codebase
- react
- and custom webpack configuration

webextension-toolbox might be your tool of choice.

# License

Copyright 2018 Henrik Wenz

This project is free software released under the MIT license.

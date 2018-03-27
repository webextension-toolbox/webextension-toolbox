[![webextension-toolbox](./assets/logo-repo.png)](https://www.npmjs.com/package/webextension-toolbox)

[![npm package](https://badge.fury.io/js/webextension-toolbox.svg)](https://www.npmjs.com/package/webextension-toolbox)
[![build status](https://travis-ci.org/HaNdTriX/webextension-toolbox.svg?branch=master)](https://travis-ci.org/HaNdTriX/webextension-toolbox) 
[![dependencies](https://img.shields.io/bithound/dependencies/github/rexxars/sse-channel.svg)](https://github.com/HaNdTriX/webextension-toolbox)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)
[![license](https://img.shields.io/npm/l/webextension-toolbox.svg)](https://github.com/HaNdTriX/webextension-toolbox/blob/master/LICENSE)

Small cli toolbox for creating cross-browser WebExtensions.

If you want to get started quickly check out the [yeoman generator](https://github.com/HaNdTriX/generator-web-extension) for this project.

## Browser Support

* `chrome` (polyfill)
* `opera` (polyfill)
* `firefox`
* `edge`

## Features

<details>
  <summary><b>react.js</b></summary>
  <p>
    Works with react.js out of the box!
    <br />
    Run <code>$ npm i react react-dom</code> and you are ready to go.
  </p>
</details>

<details>
  <summary><b>packing</b></summary>
  <p>
    The <code>build</code> task creates bundles for:
    <ul>
        <li>Firefox (<code>.xpi</code>)</li>
        <li>Chrome (<code>.zip</code>)</li>
        <li>Opera (<code>.crx</code>)</li>
        <li>Edge (<code>.zip</code>)</li>
    </ul>
  </p>
</details>

<details>
  <summary><b>manifest validation</b></summary>
  <p>
    Validates your <code>manifest.json</code> while compiling.
  </p>
</details>

<details>
  <summary><b>manifest defaults</b></summary>
  <p>
    Uses default fields (<code>name</code>, <code>version</code>, <code>description</code>) from your <code>package.json</code>
  </p>
</details>

<details>
  <summary><b>manifest vendor keys</b></summary>
  <p>Allows you to define vendor specific manifest keys.</p>
  <b>Example:</b> <code>manifest.json</code> 
<pre>
...
"name": "my-extension"
"__chrome__key": "yourchromekey"
...
</pre>

  <p>If the vendor is <code>chrome</code> it compiles to:</p>

<pre>
...
"name": "my-extension"
"key": "yourchromekey"
...
</pre>

  <p>else it compiles to:</p>

<pre>
...
"name": "my-extension"
...
</pre>
  
</details>

<details>
  <summary><b>polyfill</b></summary>
  <p>
    The <a href="https://developer.mozilla.org/de/Add-ons/WebExtensions">webextension standard</a> is currently only supported by firefox and edge. This toolbox adds the necessary polyfills for chrome and opera. 
  </p>
  <p>
    This way many webextension apis will work in chrome and opera out of the box. 
  </p>
  <p>
    In addition to that, this toolbox comes with <a href="https://github.com/babel/babel/tree/master/packages/babel-preset-env">babel-preset-env</a>.
  </p>
</details>

## Usage

### Install

```shell
$ npm install -g webextension-toolbox
```

### Development

* Compiles the extension via webpack to `dist/<vendor>`.
* Watches all extension files and recompiles on demand.
* Reloads extension as soon something changed.
* Sets `process.env.NODE_ENV` to `development`.
* Sets `process.env.VENDOR` to the current vendor.
* Mounts the extension *(Firefox only)*

#### Syntax

```shell
$ webextension-toolbox dev <vendor> [..options]
```

#### Examples

```shell
$ webextension-toolbox dev --help
$ webextension-toolbox dev chrome
$ webextension-toolbox dev firefox
$ webextension-toolbox dev opera
$ webextension-toolbox dev edge
```

### Build

* Compile extension via webpack to `dist/<vendor>`.
* Minifies extension Code.
* Sets `process.env.NODE_ENV` to `production`.
* Sets `process.env.VENDOR` to the current vendor.
* Packs extension to `packages`.

#### Syntax

```shell
$ webextension-toolbox build <vendor> [..options]
```


#### Examples

```shell
$ webextension-toolbox build --help
$ webextension-toolbox build chrome
$ webextension-toolbox build firefox
$ webextension-toolbox build opera
$ webextension-toolbox build edge
```

### Browser API

Always use the [webextension browser api](https://developer.mozilla.org/de/Add-ons/WebExtensions). Webextension-Toolbox will polyfill it for you in chrome and opera.

### Entry points

All javascript files located at the root of your `./app` or `./app/scripts` directory will create a seperate bundle.

| app                         | dist                                  |
|-----------------------------|---------------------------------------|
| `app/background.js`         | `dist/<vendor>/background.js`         |
| `app/scripts/background.js` | `dist/<vendor>/scripts/background.js` |
| `app/some-dir/some-file.js` | Will be ignored.                      |

### Customizing webpack config

In order to extend our usage of `webpack`, you can define a function that extends its config via `webextension-toolbox.js`.

```js
// This file is not going through babel transformation.
// So, we write it in vanilla JS
// (But you could use ES2015 features supported by your Node.js version)
module.exports = {
  webpack: (config, { mode }) => {
    // Perform customizations to webpack config

    // Important: return the modified config
    return config
  }
}
```

## License

Copyright 2018 Henrik Wenz

This project is free software released under the MIT license.

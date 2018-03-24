# webpack-webextension-plugin

⚠️ WORK IN PROGRESS ⚠️

**Todo:**

* test opera
* test edge
* test firefox
* evaluate csp gotchas

## What does it do?

* Autoreload extensions via websockets
* Use vendor prefixes in manifest properties

## Install

```bash
$ npm i webpack-webextension-plugin
```

## Usage

```js
const WebextensionPlugins = require('webpack-webextension-plugin')

...
plugins: [
  new WebextensionPlugins({
    vendor: 'chrome'
  })
]
...
```

## FAQ

### How does autoreload work?

In watch mode we extends/create a background page in the extension with an websockets client, that connects to our custom websocket server.

### What are vendor prefixed manifest keys?

Vendor prefixed manifest keys allow you to write one `manifest.json` for multible vendors. 

`manifest.json`:

```json
{
  "__chrome__name": "SuperChrome",
  "__chrome__name": "SuperFox",
  "__chrome__name": "SuperEdge"
}
```

if the vendor is `chrome` this compiles to:

`manifest.json`:

```json
{
  "name": "SuperChrome",
}
```

### Why are you not using mozillas `web-ext` package

`webpack-webextension-plugin` should work for every browser in the same way.
`web-ext` only works for firefox. Nevertheless if your primary browser is firefox, you should definetly check it out.

## License

Copyright 2018 Henrik Wenz

This project is free software released under the MIT license.

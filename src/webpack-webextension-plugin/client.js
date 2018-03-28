
;(function webextensionAutoReload ({ WebSocket, chrome, browser }) {
  const host = /* PLACEHOLDER-HOST */ 'localhost' /* PLACEHOLDER-HOST */
  const port = /* PLACEHOLDER-PORT */ 35729 /* PLACEHOLDER-PORT */
  const reconnectTime = /* PLACEHOLDER-RECONNECTTIME */ 3000 /* PLACEHOLDER-RECONNECTTIME */

  connect()

  function connect () {
    const connection = new WebSocket(
      `ws://${host}:${port}`
    )
    connection.onopen = handleConnectionOpen
    connection.onmessage = handleConnectionMessage
    connection.onerror = handleConnectionError
    connection.onclose = handleConnectionClose
  }

  let reconnectTimeoutId
  function reconnect () {
    clearTimeout(reconnectTimeoutId)
    reconnectTimeoutId = setTimeout(connect, reconnectTime)
  }

  function handleConnectionOpen () {
    log('Connected')
  }

  function handleConnectionClose () {
    log(`Connection lost. Reconnecting in %ss'`, reconnectTime / 1000)
    reconnect()
  }

  function handleConnectionError () {
    log('Connection error.')
  }

  function handleConnectionMessage (event) {
    let payload
    try {
      payload = JSON.parse(event.data)
    } catch (error) {
      log('Could not parse server payload')
    }
    handleServerRequest(payload)
  }

  function handleServerRequest ({ action, changedFiles }) {
    switch (action) {
      case 'reload':
        reloadExtension(changedFiles)
        break
    }
  }

  function reloadExtension (changedFiles) {
    log('Reloading ...')

    // Full reload if we have no changed files (dump reload!)
    if (!changedFiles) {
      (browser || chrome).runtime.reload()
    }

    // Full reload manifest changed
    if (changedFiles.some(file => file === 'manifest.json')) {
      reloadExtension()
    }

    // Full reload if _locales changed
    if (changedFiles.some(file => /^_locales\//.test(file))) {
      reloadExtension()
    }

    // Full reload if manifest deps changed
    if (getManifestFileDeps().some(file => changedFiles.includes(file))) {
      reloadExtension()
    }

    // Reload current tab (smart reload)
    (browser || chrome).tabs.reload();

    // Reload other extension views
    (browser || chrome).extension
      .getViews()
      .map(_window => _window.location.reload())
  }

  function getManifestFileDeps () {
    const manifest = (browser || chrome).runtime.getManifest()
    const manifestStr = JSON.stringify(manifest)
    const fileRegex = /[^"]*\.[a-zA-Z]+/g
    return manifestStr.match(fileRegex)
  }

  function log (message, ...args) {
    console.log(`%cWebpackWebextensionPlugin: ${message}`, 'color: gray;', ...args)
  }
})(window)

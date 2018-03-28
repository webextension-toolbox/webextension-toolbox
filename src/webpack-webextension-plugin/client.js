
;(function webextensionAutoReload ({ WebSocket, chrome, browser }) {
  const host = /* PLACEHOLDER-HOST */ 'localhost' /* PLACEHOLDER-HOST */
  const port = /* PLACEHOLDER-PORT */ 35729 /* PLACEHOLDER-PORT */
  const reconnectTime = /* PLACEHOLDER-RECONNECTTIME */ 3000 /* PLACEHOLDER-RECONNECTTIME */
  const quiet = /* PLACEHOLDER-QUIET */ false /* PLACEHOLDER-QUIET */

  connect()

  /**
   * Connect to the server
   */
  function connect () {
    const connection = new WebSocket(
      `ws://${host}:${port}`
    )
    connection.onopen = () => {
      log('Connected')
    }
    connection.onmessage = (event) => {
      let payload
      try {
        payload = JSON.parse(event.data)
      } catch (error) {
        log('Could not parse server payload')
      }
      handleServerMessage(payload)
    }
    connection.onerror = () => {
      log('Connection error.')
    }
    connection.onclose = () => {
      log(`Connection lost. Reconnecting in %ss'`, reconnectTime / 1000)
      reconnect()
    }
  }

  /**
   * Debounced connect to the server
   */
  const reconnect = debounce(connect, reconnectTime)

  /**
   * Simple debounce function
   * Delay and throttle the execution
   * of the fs function
   *
   * @param {function} fn
   * @param {number} time
   */
  function debounce (fn, time) {
    let timeout
    return function () {
      const functionCall = () => fn.apply(this, arguments)
      clearTimeout(timeout)
      timeout = setTimeout(functionCall, time)
    }
  }

  /**
   * Handle messages from the server
   *
   * @param {Object} payload
   * @param {String} payload.action
   */
  function handleServerMessage ({ action, changedFiles }) {
    switch (action) {
      case 'reload':
        smartReloadExtension(changedFiles)
        break
    }
  }

  /**
   * We don't like reopening our devtools after a browser.runtime.reload.
   * Since it is not possible to open them programatically, we
   * need to reduce the runtime.reloads.
   * This function prefers softer reloads, by comparing
   * runtime depenencies with the changed files.
   *
   * @param {Array} changedFiles
   */
  function smartReloadExtension (changedFiles) {
    log('Reloading ...')

    // Full reload if we have no changed files (dump reload!)
    if (!changedFiles) {
      (browser || chrome).runtime.reload()
    }

    // Full reload manifest changed
    if (changedFiles.some(file => file === 'manifest.json')) {
      smartReloadExtension()
    }

    // Full reload if _locales changed
    if (changedFiles.some(file => /^_locales\//.test(file))) {
      smartReloadExtension()
    }

    // Full reload if manifest deps changed
    if (getManifestFileDeps().some(file => changedFiles.includes(file))) {
      smartReloadExtension()
    }

    // Reload current tab (smart reload)
    (browser || chrome).tabs.reload();

    // Reload other extension views
    (browser || chrome).extension
      .getViews()
      .map(_window => _window.location.reload())
  }

  /**
   * Return all files depenencies listed
   * in the manifest.json.
   */
  function getManifestFileDeps () {
    const manifest = (browser || chrome).runtime.getManifest()
    const manifestStr = JSON.stringify(manifest)
    const fileRegex = /[^"]*\.[a-zA-Z]+/g
    return manifestStr.match(fileRegex)
  }

  /**
   * Simple namespaced logger
   *
   * @param {*} message
   * @param {*} args
   */
  function log (message, ...args) {
    if (!quiet) {
      console.log(`%cwebpack-webextension-plugin: ${message}`, 'color: gray;', ...args)
    }
  }
})(window)

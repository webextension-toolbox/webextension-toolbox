const path = require('path')
const WebSocket = require('ws')
const compileTemplate = require('./utils/compile-template')
const { promisify } = require('util')
const WebpackFileEntry = require('./utils/webpack-file-entry')
const manifestUtils = require('./manifest-utils')

class WebextensionPlugin {
  constructor ({
    port = 35729,
    host = 'localhost',
    reconnectTime = 3000,
    autoreload = true,
    vendor = 'chrome',
    manifestDefaults = {},
    quiet = false
  } = {}) {
    // Apply Settings
    this.port = port
    this.host = host
    this.autoreload = autoreload
    this.reconnectTime = reconnectTime
    this.vendor = vendor
    this.manifestDefaults = manifestDefaults
    this.quiet = quiet

    // Set some defaults
    this.server = null
    this.isWatching = false
    this.startTime = Date.now()
    this.prevFileTimestamps = new Map()
  }

  /**
   * Install plugin (install hooks)
   *
   * @param {Object} compiler
   */
  apply (compiler) {
    const { name } = this.constructor
    compiler.hooks.watchRun.tapPromise(name, this.watchRun.bind(this))
    compiler.hooks.emit.tapPromise(name, this.emit.bind(this))
    compiler.hooks.afterCompile.tap(name, this.afterCompile.bind(this))
    compiler.hooks.done.tap(name, this.done.bind(this))
  }

  /**
   * Webpack watchRun hook
   *
   * @param {Boolean} watching
   */
  watchRun (watching) {
    this.isWatching = true
    return this.startServer()
  }

  /**
   * Webpack emit hook
   *
   * @param {Object} compilation
   */
  emit (compilation) {
    const { inputFileSystem } = compilation
    this.readFile = promisify(inputFileSystem.readFile.bind(inputFileSystem))
    return Promise.all([
      this.addClient(compilation),
      this.addManifest(compilation)
    ])
  }

  afterCompile (compilation) {
    return this.watchManifest(compilation)
  }

  /**
   * Add manifest to the filesDependencies
   *
   * @param {Object} compilation
   */
  watchManifest (compilation) {
    compilation.fileDependencies.add(
      path.join(compilation.options.context, 'manifest.json')
    )
  }

  /**
   * Webpack done hook
   *
   * @param {Object} stats
   */
  done (stats) {
    this.reloadExtensions(stats)
  }

  /**
   * Start websocket server
   * on watch mode
   */
  startServer () {
    return new Promise((resolve, reject) => {
      if (!this.autoreload || !this.isWatching || this.server) return resolve()
      const { host, port } = this
      this.server = new WebSocket.Server({ port }, () => {
        this.log(`listens on ws://${host}:${port}`)
        resolve()
      })
      this.server.on('error', reject)
      this.nofiyExtension = data => {
        this.server.clients.forEach(client => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data))
          }
        })
      }
    })
  }

  /**
   * Namespaced logger
   *
   * @param {*} args
   */
  log (...args) {
    if (!this.quiet) {
      console.log('webpack-webextension-plugin', ...args)
    }
  }

  async addClient (compilation) {
    if (this.autoreload && this.isWatching) {
      await this.compileClient(compilation)
      // Add client to extension. We will includes this
      // as a background script in the manifest.json later.
      compilation.assets['webextension-toolbox/client.js'] = this.client
    }
  }

  /**
   * Compile the client only once
   * and add it to the assets output
   *
   * @param {Object} compilation
   */
  async compileClient ({ inputFileSystem }) {
    // Only compile client once
    if (this.client) return this.client

    // Get the client as string
    const clientPath = path.resolve(__dirname, 'client.js')
    const clientBuffer = await this.readFile(clientPath)

    // Inject settings
    const client = compileTemplate(clientBuffer.toString(), {
      port: this.port,
      host: this.host,
      reconnectTime: this.reconnectTime
    })

    // Create webpack file entry
    this.client = new WebpackFileEntry(client)
  }

  /**
   * Compile manifest and add it
   * to the asset ouput
   *
   * @param {Object} compilation
   */
  async addManifest (compilation) {
    // Load manifest
    const manifestPath = path.join(compilation.options.context, 'manifest.json')
    const manifestBuffer = await this.readFile(manifestPath)

    // Convert to JSON
    try {
      var manifest = JSON.parse(manifestBuffer)
    } catch (error) {
      throw new Error('Could not parse manifest.json')
    }

    manifest = {
      ...this.manifestDefaults,
      ...manifest
    }

    // Tranform __chrome__key -> key
    manifest = manifestUtils.transformVendorKeys(manifest)

    // Validate
    await manifestUtils.validate(manifest)

    // Add client
    if (this.autoreload && this.isWatching) {
      manifest = manifestUtils.addBackgroundscript(manifest, 'webextension-toolbox/client.js')
    }

    // Create webpack file entry
    const manifestStr = JSON.stringify(manifest, null, 2)
    compilation.assets['manifest.json'] = new WebpackFileEntry(manifestStr)
  }

  /**
   * Send message to extensions with
   * changed files
   *
   * @param {Object} stats
   */
  reloadExtensions (stats) {
    // Skip in normal mode
    if (!this.server || !this.isWatching) return

    // Get changed files since last compile
    const changedFiles = this.extractChangedFiles(stats.compilation)
    if (changedFiles.length) {
      this.log('reloading extension...')
      this.nofiyExtension({
        action: 'reload',
        changedFiles
      })
    }
  }

  /**
   * Get the changed files since
   * last compilation
   *
   * @param {Object} compilation
   */
  extractChangedFiles ({ fileTimestamps, options }) {
    const changedFiles = new Map()

    // Compare file timestamps with last compilation
    for (const [watchfile, timestamp] of fileTimestamps.entries()) {
      const isFile = Boolean(path.extname(watchfile))
      if (isFile && (this.prevFileTimestamps.get(watchfile) || this.startTime) < (fileTimestamps.get(watchfile) || Infinity)) {
        changedFiles.set(watchfile, timestamp)
      }
    }
    this.prevFileTimestamps = fileTimestamps

    // Remove context path
    const contextRegex = new RegExp('^' + options.context.replace('/', '\\/') + '\\/')
    return Array
      .from(changedFiles.keys())
      .map(filePath => filePath.replace(contextRegex, ''))
  }
}

module.exports = WebextensionPlugin

const { resolve } = require('path')
const { existsSync } = require('fs')

function getExtensionInfo (src) {
  const manifestJSON = getManifestJSON(src)
  const packageJSON = getPackageJSON(src)

  if (!manifestJSON.version && !packageJSON.version) {
    throw new Error('You need to provide a version string either in the manifest.json or in your package.json')
  }

  return {
    version: manifestJSON.version || packageJSON.version,
    name: packageJSON.name || 'extension',
    description: packageJSON.description
  }
}

function getManifestJSON (src) {
  const manifestPath = resolve(src, 'manifest.json')

  if (!existsSync(manifestPath)) {
    throw new Error('manifest.json is not present on app path (' + manifestPath + ')')
  }

  try {
    return require(manifestPath)
  } catch (error) {
    throw new Error('You need to provide a valid \'manifest.json\'')
  }
}

function getPackageJSON (src) {
  try {
    try {
      return require(resolve(src, '../package.json'))
    } catch (error) {
      return require(resolve(src, 'package.json'))
    }
  } catch (e) {
    return {}
  }
}

module.exports = getExtensionInfo

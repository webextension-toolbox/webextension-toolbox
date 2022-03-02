const { resolve } = require('path')

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
  try {
    return require(resolve(src, 'manifest.json'))
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

const validate = require('./validate')
const transformVendorKeys = require('./transformVendorKeys')
const addAutoreload = require('./addAutoreload')

async function transformManifest (manifest, { vendor, autoReload, version, description }) {
  manifest = JSON.parse(manifest.toString('utf8'))
  manifest = await validate(manifest)
  manifest = await transformVendorKeys(manifest, vendor)

  manifest.version = version
  manifest.description = manifest.description || description

  if (autoReload) {
    manifest = addAutoreload(manifest)
  }

  return Buffer.from(JSON.stringify(manifest, null, 2))
}

module.exports = transformManifest

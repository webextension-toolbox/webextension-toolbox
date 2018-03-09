const validate = require('./validate')
const transformVendorKeys = require('./transform-vendor-keys')
const addAutoreload = require('./add-autoreload')

async function transformManifest (manifest, { vendor, autoReload, name, version, description }) {
  manifest = JSON.parse(manifest.toString('utf8'))
  manifest.name = manifest.name || name
  manifest.version = version
  manifest.description = manifest.description || description

  manifest = await validate(manifest)
  manifest = await transformVendorKeys(manifest, vendor)

  if (autoReload && ['chrome', 'opera'].includes(vendor)) {
    manifest = addAutoreload(manifest)
  }

  return Buffer.from(JSON.stringify(manifest, null, 2))
}

module.exports = transformManifest

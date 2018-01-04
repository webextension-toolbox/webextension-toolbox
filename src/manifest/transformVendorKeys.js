const vendors = require('../../vendors.json')
const vendorRegExp = new RegExp(`^__(${vendors.join('|')})__(.*)`)

async function transform (manifest, vendor) {
  const transformedManifest = Object.entries(
    manifest
  ).reduce((manifest, [key, value]) => {
    const match = key.match(vendorRegExp)
    if (match) {
      // Swap key with non prefixed name
      if (match[1] === vendor) {
        manifest[match[2]] = value
      }
    } else {
      manifest[key] = value
    }
    return manifest
  }, {})

  return transformedManifest
}

module.exports = transform

const vendors = require('../vendors.json')
const vendorRegExp = new RegExp(`^__(${vendors.join('|')})__(.*)`)

module.exports = function transformVendorKeys (manifest, vendor) {
  if (Array.isArray(manifest)) {
    return manifest.map(manifest => transformVendorKeys(manifest, vendor))
  }

  if (typeof manifest === 'object') {
    return Object
      .entries(manifest)
      .reduce((manifest, [key, value]) => {
        const match = key.match(vendorRegExp)
        if (match) {
          // Swap key with non prefixed name
          if (match[1] === vendor) {
            manifest[match[2]] = value
          }
        } else {
          manifest[key] = transformVendorKeys(value, vendor)
        }
        return manifest
      }, {})
  }

  return manifest
}

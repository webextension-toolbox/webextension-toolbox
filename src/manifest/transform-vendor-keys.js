const vendors = require('../vendors.json')
const vendorRegExp = new RegExp(`^__(${vendors.join('|')})__(.*)`)

function transform (manifest, vendor) {
  if (Array.isArray(manifest)) {
    return manifest.map(manifest => transform(manifest, vendor))
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
          manifest[key] = transform(value, vendor)
        }
        return manifest
      }, {})
  }

  return manifest
}

module.exports = transform

const vendors = require('../../vendors.json')

function validateVendor (vendor) {
  if (!vendors.includes(vendor)) {
    throw new Error(`Invalid vendor (Allowed: ${vendors.join(',')})`)
  }
}

module.exports = validateVendor

const vendors = require('../vendors.json')

function validateVendor (vendor) {
  if (!vendors.includes(vendor)) {
    const error = new Error(`Invalid vendor (Allowed: ${vendors.join(',')})`)
    throw error
  }
}

module.exports = validateVendor

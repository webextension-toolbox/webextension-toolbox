const browserslist = require('browserslist')

/**
 * Returns last n
 * vendor version
 * @param {integer} n
 * @param {string} vendor
 * @return {Number} version
 */
function getLastNVendorVersion (n, vendor) {
  const { released } = browserslist.data[vendor]
  return released[released.length - n]
}

module.exports = getLastNVendorVersion

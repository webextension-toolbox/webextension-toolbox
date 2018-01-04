function getExtensionFileType (vendor) {
  switch (vendor) {
    case 'firefox':
      return 'xpi'
    case 'opera':
      return 'crx'
    default:
      return 'zip'
  }
}

module.exports = getExtensionFileType

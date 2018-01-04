module.exports = function addAutoreload (manifest) {
  if (!manifest.background) {
    manifest.background = {}
  }

  if (!manifest.background.scripts) {
    manifest.background.scripts = []
  }

  manifest.background.scripts = [
    'autoReload.js',
    ...manifest.background.scripts
  ]

  return manifest
}

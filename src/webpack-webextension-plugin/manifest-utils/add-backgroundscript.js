module.exports = function addBackgroundscript (manifest, path) {
  if (!manifest.background) {
    manifest.background = {}
  }

  if (!manifest.background.scripts) {
    manifest.background.scripts = []
  }

  manifest.background.scripts = [
    path,
    ...manifest.background.scripts
  ]

  return manifest
}

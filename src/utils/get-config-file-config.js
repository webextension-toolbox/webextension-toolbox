const findUp = require('find-up')

module.exports = function getConfig (customFilePath) {
  const path = findUp.sync(customFilePath)

  let config = {}

  if (path && path.length) {
    const configModule = require(path)
    config = configModule.default || configModule
  }

  return config
}

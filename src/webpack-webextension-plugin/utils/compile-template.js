/**
 * Compiles a javascript template file.
 * This function is only working for strings and number
 *
 * @param {string} templateStr
 * @param {object} obj
 */
function compileTemplate (templateStr, obj) {
  let result = templateStr
  for (let [key, value] of Object.entries(obj)) {
    const regex = regexFactory(key)
    if (typeof value === 'object') {
      throw new Error('compileTemplate only works for strings and numbers')
    }
    if (typeof value !== 'number') {
      value = JSON.stringify(value)
    }
    result = result.replace(regex, value)
  }
  return result
}

/**
 * Creates template regexes
 *
 * @param {string} name
 */
function regexFactory (name) {
  const _name = name.toUpperCase()
  return new RegExp(`\\/\\*\\sPLACEHOLDER-${_name}\\s\\*\\/.*\\/\\*\\sPLACEHOLDER-${_name}\\s\\*\\/`, 'g')
}

module.exports = compileTemplate

module.exports = class WebpackFileEntry {
  constructor (str) {
    this.str = str
  }

  source () {
    return this.str
  }

  size () {
    return this.str.length
  }
}

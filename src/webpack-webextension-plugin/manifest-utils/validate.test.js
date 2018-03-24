/* eslint-env jest */
const validateManifest = require('./validate')
const chalk = require('chalk')
let colorSupportBackup

beforeEach(() => {
  colorSupportBackup = chalk.enabled
  chalk.enabled = false
})

afterEach(() => {
  chalk.enabled = colorSupportBackup
})

test('validates manifest', async () => {
  const manifest = {}
  // Name is required
  expect(
    validateManifest(manifest)
  ).rejects.toThrowErrorMatchingSnapshot()
})

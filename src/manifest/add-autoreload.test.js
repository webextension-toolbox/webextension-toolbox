/* eslint-env jest */
const addAutoreload = require('./add-autoreload')

test('adds a new background entry called autoreload', () => {
  const manifest = {
    name: 'left-pad'
  }
  const result = addAutoreload(manifest)
  expect(result).toEqual({
    name: 'left-pad',
    background: {
      scripts: [
        'auto-reload.js'
      ]
    }
  })
})

test('extends background entry with autoreload', () => {
  const manifest = {
    name: 'left-pad',
    background: {
      scripts: [
        'background.js'
      ]
    }
  }
  const result = addAutoreload(manifest)
  expect(result).toEqual({
    name: 'left-pad',
    background: {
      scripts: [
        'auto-reload.js',
        'background.js'
      ]
    }
  })
})

/* eslint-env jest */
const addBackgroundscript = require('./add-backgroundscript')

test('adds a new background backgroundscript', () => {
  const manifest = {
    name: 'left-pad'
  }
  const result = addBackgroundscript(manifest, 'auto-reload.js')
  expect(result).toEqual({
    name: 'left-pad',
    background: {
      scripts: [
        'auto-reload.js'
      ]
    }
  })
})

test('extends background entry with backgroundscript', () => {
  const manifest = {
    name: 'left-pad',
    background: {
      scripts: [
        'background.js'
      ]
    }
  }
  const result = addBackgroundscript(manifest, 'auto-reload.js')
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

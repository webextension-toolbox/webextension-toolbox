/* eslint-env jest */
const compileTemplate = require('./compile-template')

test('replaces strings as stings', () => {
  const template = '/* PLACEHOLDER-VALUE */ "someStr" /* PLACEHOLDER-VALUE */'
  const result = compileTemplate(template, {
    value: 'foo'
  })
  expect(result).toEqual('"foo"')
})

test('replaces numbers as numbers', () => {
  const template = '/* PLACEHOLDER-VALUE */ 42 /* PLACEHOLDER-VALUE */'
  const result = compileTemplate(template, {
    value: 100
  })
  expect(result).toEqual('100')
})

test('replaces multible values', () => {
  const template = '/* PLACEHOLDER-VALUE1 */ 42 /* PLACEHOLDER-VALUE1 *//* PLACEHOLDER-VALUE2 */ "str" /* PLACEHOLDER-VALUE2 */'
  const result = compileTemplate(template, {
    value1: 100,
    value2: 'str'
  })
  expect(result).toEqual('100"str"')
})

try {
  const colors = require('colors/safe')
  Object.defineProperty(colors, '__loaded', {
    value: true,
    configurable: false,
    writable: false,
  })
  module.exports = colors
} catch (err) {
  const colors = {}
  Object.defineProperty(colors, '__loaded', {
    value: false,
    configurable: false,
    writable: false,
  })
}

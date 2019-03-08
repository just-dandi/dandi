const { isBrowser } = require('./is-browser')

if (isBrowser()) {
  module.exports.CUSTOM_INSPECTOR = 'toString'
} else {
  module.exports.CUSTOM_INSPECTOR = require('util').inspect.custom
}

const { ENV_IS_BROWSER } = require('./env-is-browser')

if (ENV_IS_BROWSER) {
  module.exports.CUSTOM_INSPECTOR = 'toString'
} else {
  module.exports.CUSTOM_INSPECTOR = require('util').inspect.custom
}

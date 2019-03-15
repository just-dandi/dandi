const { ENV_IS_BROWSER } = require('./env-is-browser')

/*
 * export the native URL implementation, depending on the platform
 */

if (ENV_IS_BROWSER) {
  module.exports.Url = URL
} else {
  module.exports.Url = require('url').URL
}

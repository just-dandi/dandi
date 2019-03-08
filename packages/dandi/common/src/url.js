const { isBrowser } = require('./is-browser')

/*
 * export the native URL implementation, depending on the platform
 */

if (isBrowser()) {
  module.exports.Url = URL
} else {
  module.exports.Url = require('url').URL
}

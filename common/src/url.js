// eslint-disable-next-line no-new-func
const isBrowser = new Function(
  'try { return this === window; } catch(err) { return false; }',
);

/*
 * export the native URL implementation, depending on the platform
 */
if (isBrowser()) {
  module.exports.Url = URL;
} else {
  module.exports.Url = require('url').URL;
}

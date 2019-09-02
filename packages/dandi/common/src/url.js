function getURL() {
  try {
    // require.resolve will return 'url' when executed by NodeJS
    // for Webpack, it's possible that the "url" npm package (or an alias to it) could be installed, which is why the
    // above check is required
    if (require.resolve && require.resolve('url') === 'url') {
      return require('url').URL
    }
    return URL
  } catch (err) {
    return URL
  }
}

/*
 * export the native URL implementation, depending on the platform
 */
module.exports.Url = getURL()

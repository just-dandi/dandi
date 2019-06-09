function getURL() {
  try {
    if (require.resolve('url')) {
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

const DEFAULT_INSPECTOR = 'toString'

function getCustomInspector() {
  try {
    if (require.resolve('util')) {
      return require('util').inspect.custom
    }
    return DEFAULT_INSPECTOR
  } catch (err) {
    return DEFAULT_INSPECTOR
  }
}

module.exports.CUSTOM_INSPECTOR = getCustomInspector()

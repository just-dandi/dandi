const plugin = require('./src/plugin')

module.exports = function(PluginHost) {
  const app = PluginHost.owner
  app.converter.addComponent(plugin.PLUGIN_NAME, plugin.ModuleNameByPackagePlugin)
}
